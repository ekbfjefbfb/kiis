/**
 * Servicio de Agenda IA
 * Conecta con el backend de Render para:
 * - Crear sesiones de clase
 * - Transcribir audio con Groq
 * - Clasificar relevancia en tiempo real
 * - Extraer tareas, fechas, conceptos automáticamente
 */

import { apiService, API_BASE_URL } from './api.service';

// ============= TIPOS =============

export interface AgendaSession {
  id: string;
  user_id: string;
  class_name: string;
  teacher_name?: string;
  teacher_email?: string;
  topic_hint?: string;
  session_datetime: string;
  timezone?: string;
  status: 'active' | 'done';
  live_transcript: string;
  created_at: string;
  updated_at: string;
}

export interface AgendaItem {
  id: string;
  session_id: string;
  item_type: 'task' | 'event' | 'key_point' | 'summary' | 'reminder';
  title?: string;
  content: string;
  due_date?: string;
  priority?: number;
  important: boolean;
  status?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionRequest {
  class_name: string;
  teacher_name?: string;
  teacher_email?: string;
  topic_hint?: string;
  session_datetime?: string;
  timezone?: string;
}

export interface SessionWithItems extends AgendaSession {
  items: AgendaItem[];
}

export interface TranscriptChunk {
  text: string;
  t_start_ms?: number;
  t_end_ms?: number;
}

export interface RelevanceClassification {
  relevance_label: 'IMPORTANTE' | 'SECUNDARIO' | 'IRRELEVANTE';
  relevance_reason: string;
  relevance_signals: string[];
  relevance_score: number;
}

export interface AgendaState {
  summary: string;
  lecture_notes: string; // Markdown
  key_points: string[];
  tasks: Array<{
    text: string;
    due_date?: string;
    priority: number;
  }>;
  relevance: {
    important_signals: string[];
  };
}

// WebSocket Events
export interface WSTranscriptChunk {
  event: 'transcript_chunk';
  text: string;
  t_start_ms?: number;
  t_end_ms?: number;
  min_ai_interval_sec?: number;
}

export interface WSAskAI {
  event: 'ask_ai';
  question: string;
}

export interface WSChunkRelevance {
  event: 'chunk_relevance';
  session_id: string;
  relevance: RelevanceClassification;
}

export interface WSAgendaState {
  event: 'agenda_state';
  session_id: string;
  state: AgendaState;
}

export interface WSAssistantAnswer {
  event: 'assistant_answer';
  question: string;
  answer: string;
}

export type WSIncomingEvent = WSChunkRelevance | WSAgendaState | WSAssistantAnswer;

// ============= SERVICIO =============

class AgendaService {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  // Callbacks
  private onChunkRelevanceCallback?: (data: WSChunkRelevance) => void;
  private onAgendaStateCallback?: (data: WSAgendaState) => void;
  private onAssistantAnswerCallback?: (data: WSAssistantAnswer) => void;
  private onErrorCallback?: (error: any) => void;
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;

  // ========== HTTP API ==========

  /**
   * Crear nueva sesión de clase
   */
  async createSession(data: CreateSessionRequest): Promise<AgendaSession> {
    return await apiService.post<AgendaSession>('/api/agenda/sessions', data);
  }

  /**
   * Obtener sesión con items
   */
  async getSession(sessionId: string): Promise<SessionWithItems> {
    return await apiService.get<SessionWithItems>(`/api/agenda/sessions/${sessionId}`);
  }

  /**
   * Guardar chunk de transcript por HTTP (fallback)
   */
  async saveChunk(sessionId: string, chunk: TranscriptChunk): Promise<void> {
    await apiService.post(`/api/agenda/sessions/${sessionId}/chunks`, chunk);
  }

  /**
   * Crear item manual
   */
  async createItem(sessionId: string, item: Partial<AgendaItem>): Promise<AgendaItem> {
    return await apiService.post<AgendaItem>(`/api/agenda/sessions/${sessionId}/items`, item);
  }

  /**
   * Actualizar item
   */
  async updateItem(sessionId: string, itemId: string, updates: Partial<AgendaItem>): Promise<AgendaItem> {
    return await apiService.request<AgendaItem>(
      `/api/agenda/sessions/${sessionId}/items/${itemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  /**
   * Eliminar item
   */
  async deleteItem(sessionId: string, itemId: string): Promise<void> {
    await apiService.delete(`/api/agenda/sessions/${sessionId}/items/${itemId}`);
  }

  /**
   * Finalizar sesión
   */
  async finalizeSession(sessionId: string): Promise<AgendaSession> {
    return await apiService.post<AgendaSession>(`/api/agenda/sessions/${sessionId}/finalize`);
  }

  /**
   * Transcribir audio con Groq Whisper
   */
  async transcribeAudio(audioBlob: Blob): Promise<{ text: string; language?: string; duration?: number }> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    return await apiService.post<{ text: string; language?: string; duration?: number }>(
      '/api/stt/groq/transcribe',
      formData,
      true
    );
  }

  // ========== WEBSOCKET ==========

  /**
   * Conectar al WebSocket de agenda en vivo
   */
  connectWebSocket(
    sessionId: string,
    callbacks: {
      onChunkRelevance?: (data: WSChunkRelevance) => void;
      onAgendaState?: (data: WSAgendaState) => void;
      onAssistantAnswer?: (data: WSAssistantAnswer) => void;
      onError?: (error: any) => void;
      onConnected?: () => void;
      onDisconnected?: () => void;
    }
  ): void {
    this.sessionId = sessionId;
    this.onChunkRelevanceCallback = callbacks.onChunkRelevance;
    this.onAgendaStateCallback = callbacks.onAgendaState;
    this.onAssistantAnswerCallback = callbacks.onAssistantAnswer;
    this.onErrorCallback = callbacks.onError;
    this.onConnectedCallback = callbacks.onConnected;
    this.onDisconnectedCallback = callbacks.onDisconnected;

    this.connect();
  }

  private connect(): void {
    if (!this.sessionId) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.onErrorCallback?.({ message: 'No access token found' });
      return;
    }

    // Convertir HTTP URL a WS URL
    const wsUrl = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const url = `${wsUrl}/api/agenda/live/${this.sessionId}/ws?token=${token}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket conectado');
        this.reconnectAttempts = 0;
        this.onConnectedCallback?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WSIncomingEvent = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.onErrorCallback?.(error);
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        this.onDisconnectedCallback?.();
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.onErrorCallback?.(error);
    }
  }

  private handleMessage(data: WSIncomingEvent): void {
    switch (data.event) {
      case 'chunk_relevance':
        this.onChunkRelevanceCallback?.(data);
        break;
      case 'agenda_state':
        this.onAgendaStateCallback?.(data);
        break;
      case 'assistant_answer':
        this.onAssistantAnswerCallback?.(data);
        break;
      default:
        console.log('Unknown WebSocket event:', data);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Enviar chunk de transcript al WebSocket
   */
  sendTranscriptChunk(text: string, options?: { t_start_ms?: number; t_end_ms?: number; min_ai_interval_sec?: number }): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    const message: WSTranscriptChunk = {
      event: 'transcript_chunk',
      text,
      ...options,
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Hacer pregunta al asistente
   */
  askAI(question: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    const message: WSAskAI = {
      event: 'ask_ai',
      question,
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Desconectar WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.sessionId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Estado de conexión
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const agendaService = new AgendaService();
