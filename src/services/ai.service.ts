import { API_BASE_URL } from './api.service';
import { groqService } from './groq.service';

interface ChatMessage {
  role: "user" | "ai" | "system";
  content: string;
}

type ChatActionTask = {
  title: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
};

type ChatActionPlanStep = {
  step: string;
  duration?: number;
};

type ChatAction =
  | { type: 'tasks'; data: ChatActionTask[] }
  | { type: 'plan'; data: ChatActionPlanStep[] };

interface ChatResponse {
  success?: boolean;
  response?: string;
  message?: string;
  error?: string;
  error_code?: string;
  timestamp?: string;
  message_id?: string;
  actions?: ChatAction[];
  context?: {
    usage_percent?: number;
    needs_refresh?: boolean;
    auto_refreshed?: boolean;
  };
}

type ChatStructuredResult = {
  text: string;
  actions?: ChatAction[];
  message_id?: string;
  context?: ChatResponse['context'];
};

type ProgressResponse = {
  success?: boolean;
  today_tasks?: any[];
  week_tasks?: any[];
  completed_tasks?: any[];
  last_plan?: any;
  last_interaction?: string;
  error?: string;
  message?: string;
};

type CompleteProgressResponse = {
  success?: boolean;
  error?: string;
  message?: string;
};

interface VoiceChatResponse {
  success: boolean;
  transcribed: string;
  response: string;
  audio: string;
  user_id: string;
  timestamp: string;
}

interface ChatContextResponse {
  usage: number;
  messages_count: number;
  last_check: string;
}

// WebSocket interfaces
interface WSChatMessage {
  response: string;
  context: {
    needs_refresh: boolean;
    auto_refreshed: boolean;
  };
}

type WSMessageHandler = (data: WSChatMessage) => void;
type WSConnectHandler = () => void;
type WSErrorHandler = (error: any) => void;
type WSCloseHandler = () => void;

// Instrucción de sistema para controlar el frontend
const SYSTEM_PROMPT = `
Eres un asistente estudiantil muy inteligente y amigable de la app "Notdeer".
Habla siempre en español.
Puedes ayudar a responder preguntas sobre clases, resumir textos y dar consejos.

IMPORTANTE: Tienes la capacidad de navegar por la aplicación del usuario.
Si el usuario te dice o implica algo como "Llévame a mi perfil", "Abre el calendario", "Quiero ir al inicio" o "Abre mis notas", DEBES incluir al final de tu respuesta el comando exacto en este formato:
[NAVIGATE:/ruta_destino]

Las rutas válidas son:
- /dashboard (Inicio, página principal)
- /calendar (Calendario)
- /notes (Mis Notas)
- /profile (Mi Perfil)
- /voice (Chat de Voz)
- /search (Búsqueda Web)

Por ejemplo:
Usuario: "Llévame a mi perfil"
Tú: "¡Claro! Te llevo a tu perfil ahora mismo. [NAVIGATE:/profile]"

Usuario: "¿Qué tengo en el calendario?"
Tú: "Vamos a revisar tu calendario. [NAVIGATE:/calendar]"
`;

/**
 * Servicio WebSocket para Chat IA en tiempo real
 */
class ChatWebSocketService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  // Callbacks
  private onMessageCallback: WSMessageHandler | null = null;
  private onConnectCallback: WSConnectHandler | null = null;
  private onErrorCallback: WSErrorHandler | null = null;
  private onCloseCallback: WSCloseHandler | null = null;

  /**
   * Conectar al WebSocket de chat IA (método público)
   */
  connect(
    userId: string,
    callbacks: {
      onMessage?: WSMessageHandler;
      onConnect?: WSConnectHandler;
      onError?: WSErrorHandler;
      onClose?: WSCloseHandler;
    }
  ): void {
    this.userId = userId;
    this.onMessageCallback = callbacks.onMessage || null;
    this.onConnectCallback = callbacks.onConnect || null;
    this.onErrorCallback = callbacks.onError || null;
    this.onCloseCallback = callbacks.onClose || null;

    this._doConnect();
  }

  /**
   * Conexión interna (privada)
   */
  private _doConnect(): void {
    if (!this.userId) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.onErrorCallback?.({ message: 'No access token found' });
      return;
    }

    // Convertir HTTP URL a WS URL
    const wsUrl = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const url = `${wsUrl}/api/unified-chat/ws/${this.userId}?token=${token}`;

    try {
      console.log('🔌 Conectando WebSocket Chat IA...');
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket Chat IA conectado');
        this.reconnectAttempts = 0;
        this.onConnectCallback?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WSChatMessage = JSON.parse(event.data);
          this.onMessageCallback?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket Chat IA error:', error);
        this.onErrorCallback?.(error);
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket Chat IA desconectado');
        this.onCloseCallback?.();
        this._attemptReconnect();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.onErrorCallback?.(error);
    }
  }

  private _attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnecting Chat WS... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this._doConnect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Enviar mensaje al WebSocket
   */
  sendMessage(message: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, message not sent');
      return;
    }

    this.ws.send(JSON.stringify({ message }));
  }

  /**
   * Desconectar WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Estado de conexión
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Exportar instancia singleton
export const chatWebSocket = new ChatWebSocketService();

export const aiService = {
  /**
   * Procesa audio usando Groq Whisper Large V3 Turbo para transcripción real.
   */
  async processAudio(audioBlob: Blob): Promise<{ text: string }> {
    const text = await groqService.transcribe(audioBlob, 'es');
    return { text };
  },

  /**
   * Solo transcribir audio a texto (SST)
   */
  async transcribe(audioBlob: Blob): Promise<string> {
    const { text } = await this.processAudio(audioBlob);
    return text;
  },

  async summarizeNotes(text: string, onToken?: (token: string) => void): Promise<string> {
    if (onToken) {
      onToken("La funcionalidad de resumen local fue deprecada en favor del backend.");
    }
    return "La funcionalidad de resumen local fue deprecada en favor del backend.";
  },

  async chat(message: string, history: ChatMessage[] = [], onToken?: (token: string) => void): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-chat/message/json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        let details: ChatResponse | null = null;
        try {
          details = await response.json();
        } catch {
          details = null;
        }
        const msg = details?.error || details?.message || `HTTP error! status: ${response.status}`;
        throw new Error(`[${response.status}] ${msg}`);
      }

      const data: ChatResponse = await response.json();

      if (data?.success === false) {
        throw new Error(data?.error || data?.message || 'Error del asistente');
      }

      const finalMsg =
        data?.response ||
        data?.message ||
        "Lo siento, no pude procesar la respuesta.";
      
      if (onToken) {
        const words = finalMsg.split(" ");
        for (const word of words) {
          await new Promise(r => setTimeout(r, 30));
          onToken(word + " ");
        }
      }
      return finalMsg;
    } catch (e) {
      console.error("AI Chat Error:", e);
      if (e instanceof Error) throw e;
      throw new Error("Hubo un error al conectar con el asistente.");
    }
  },

  async chatStructured(message: string, history: ChatMessage[] = [], onToken?: (token: string) => void): Promise<ChatStructuredResult> {
    const response = await fetch(`${API_BASE_URL}/unified-chat/message/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      let details: ChatResponse | null = null;
      try {
        details = await response.json();
      } catch {
        details = null;
      }
      const msg = details?.error || details?.message || `HTTP error! status: ${response.status}`;
      throw new Error(`[${response.status}] ${msg}`);
    }

    const data: ChatResponse = await response.json();
    if (data?.success === false) {
      throw new Error(data?.error || data?.message || 'Error del asistente');
    }

    const text = data?.response || data?.message || "Lo siento, no pude procesar la respuesta.";

    if (onToken) {
      const words = text.split(' ');
      for (const word of words) {
        await new Promise(r => setTimeout(r, 30));
        onToken(word + ' ');
      }
    }

    return {
      text,
      actions: data?.actions,
      message_id: data?.message_id,
      context: data?.context,
    };
  },

  async getProgress(): Promise<ProgressResponse> {
    const response = await fetch(`${API_BASE_URL}/unified-chat/progress`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      let details: ProgressResponse | null = null;
      try {
        details = await response.json();
      } catch {
        details = null;
      }
      const msg = details?.error || details?.message || `HTTP error! status: ${response.status}`;
      throw new Error(`[${response.status}] ${msg}`);
    }

    return await response.json();
  },

  async completeProgressTask(taskId: string): Promise<CompleteProgressResponse> {
    const response = await fetch(`${API_BASE_URL}/unified-chat/progress/complete/${encodeURIComponent(taskId)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      let details: CompleteProgressResponse | null = null;
      try {
        details = await response.json();
      } catch {
        details = null;
      }
      const msg = details?.error || details?.message || `HTTP error! status: ${response.status}`;
      throw new Error(`[${response.status}] ${msg}`);
    }

    return await response.json();
  },

  /**
   * Chat por voz: STT -> IA -> TTS
   * Envía audio y recibe respuesta con audio generado
   */
  async chatVoice(audioBlob: Blob): Promise<VoiceChatResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await fetch(`${API_BASE_URL}/unified-chat/voice/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Obtener contexto del usuario (uso de tokens, mensajes, etc.)
   */
  async getContext(userId: string): Promise<ChatContextResponse> {
    const response = await fetch(`${API_BASE_URL}/unified-chat/context/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Forzar refresh del contexto
   */
  async refreshContext(userId: string): Promise<{ success: boolean; message: string; user_id: string }> {
    const response = await fetch(`${API_BASE_URL}/unified-chat/context/refresh/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Obtener instancia del WebSocket para chat en tiempo real
   */
  getWebSocket(): typeof chatWebSocket {
    return chatWebSocket;
  }
};
