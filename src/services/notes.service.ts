import { apiService } from './api.service';

export interface BackendTask {
  id?: string;
  text: string;
  due_date: string | null;
  done: boolean;
  priority: number;
}

export interface BackendNote {
  id?: string;
  title: string;
  transcript: string;
  summary: string;
  topics: string[];
  key_points: string[];
  tasks: BackendTask[];
  created_at: string | null;
}

export interface ListNotesResponse {
  notes: BackendNote[];
}

export interface ListTasksResponse {
  tasks: BackendTask[];
}

export class NotesService {
  /**
   * Envía la transcripción final al backend para ser procesada por IA.
   * Retorna los datos estructurados y guarda en DB si save=true.
   */
  async createFromTranscript(transcript: string, titleHint?: string, save: boolean = true): Promise<BackendNote> {
    return await apiService.post<BackendNote>('/api/class-notes/from-transcript', {
      transcript,
      title_hint: titleHint,
      save
    });
  }

  /**
   * Obtiene una nota específica por ID.
   */
  async getNoteById(noteId: string): Promise<BackendNote> {
    return await apiService.get<BackendNote>(`/api/class-notes/${noteId}`);
  }

  /**
   * Lista historial de notas creadas.
   */
  async listNotes(limit: number = 20, offset: number = 0): Promise<BackendNote[]> {
    const response = await apiService.get<ListNotesResponse>('/api/class-notes', {
      limit,
      offset
    });
    return response?.notes || [];
  }

  /**
   * Obtiene las tareas extraídas.
   */
  async listTasks(onlyPending: boolean = true, onlyWithDueDate: boolean = false, limit: number = 50): Promise<BackendTask[]> {
    const response = await apiService.get<ListTasksResponse>('/api/class-notes/tasks', {
      only_pending: onlyPending,
      only_with_due_date: onlyWithDueDate,
      limit
    });
    return response?.tasks || [];
  }

  /**
   * Exporta a documento APA 7
   */
  async generateApa7Pdf(payload: {
    title: string;
    author: string;
    paragraphs: string[];
    due_date?: string;
  }): Promise<Blob> {
    return await apiService.request<Blob>('/api/documents/apa7/pdf', {
      method: 'POST',
      headers: {
        'Accept': 'application/pdf',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         ...payload,
         filename: "resumen_clase.pdf"
      })
    });
  }
}

export const notesService = new NotesService();
