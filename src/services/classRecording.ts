import { AuthService } from '../auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ClassRecording {
  id: string;
  date: Date;
  rawTranscript: string;
  processed: boolean;
  summary?: string;
  keyPoints?: string[];
  tasks?: Task[];
  dates?: ImportantDate[];
  notes?: string;
  topics?: string[];
}

export interface Task {
  id: string;
  description: string;
  dueDate?: Date;
  completed: boolean;
}

export interface ImportantDate {
  id: string;
  description: string;
  date: Date;
}

export class ClassRecordingService {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  private getUserId(): string {
    const user = this.authService.getCurrentUser();
    return user?.uid || 'anonymous';
  }

  async processTranscript(transcript: string): Promise<ClassRecording> {
    const userId = this.getUserId();
    
    try {
      const response = await fetch(`${API_URL}/api/recordings/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          userId
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar con el servidor');
      }

      const recording = await response.json();
      
      // También guardar localmente como backup
      this.saveToLocalStorage(recording);
      
      return recording;
    } catch (error) {
      console.error('Error procesando transcripción:', error);
      
      // Fallback: guardar sin procesar
      const recording: ClassRecording = {
        id: `rec-${Date.now()}`,
        date: new Date(),
        rawTranscript: transcript,
        processed: false
      };
      
      this.saveToLocalStorage(recording);
      return recording;
    }
  }

  private saveToLocalStorage(recording: ClassRecording) {
    const recordings = this.getLocalRecordings();
    const index = recordings.findIndex(r => r.id === recording.id);
    
    if (index >= 0) {
      recordings[index] = recording;
    } else {
      recordings.push(recording);
    }
    
    localStorage.setItem('classRecordings', JSON.stringify(recordings));
  }

  private getLocalRecordings(): ClassRecording[] {
    const data = localStorage.getItem('classRecordings');
    return data ? JSON.parse(data) : [];
  }

  async getRecordings(): Promise<ClassRecording[]> {
    const userId = this.getUserId();
    
    try {
      const response = await fetch(`${API_URL}/api/recordings/${userId}`);
      
      if (response.ok) {
        const recordings = await response.json();
        // Actualizar cache local
        localStorage.setItem('classRecordings', JSON.stringify(recordings));
        return recordings;
      }
    } catch (error) {
      console.error('Error obteniendo grabaciones del servidor:', error);
    }
    
    // Fallback a localStorage
    return this.getLocalRecordings();
  }

  async getRecordingById(id: string): Promise<ClassRecording | undefined> {
    const recordings = await this.getRecordings();
    return recordings.find(r => r.id === id);
  }

  async updateRecording(id: string, updates: Partial<ClassRecording>): Promise<void> {
    const userId = this.getUserId();
    
    try {
      const response = await fetch(`${API_URL}/api/recordings/${userId}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updated = await response.json();
        this.saveToLocalStorage(updated);
        return;
      }
    } catch (error) {
      console.error('Error actualizando en servidor:', error);
    }
    
    // Fallback a localStorage
    const recordings = this.getLocalRecordings();
    const index = recordings.findIndex(r => r.id === id);
    if (index !== -1) {
      recordings[index] = { ...recordings[index], ...updates };
      localStorage.setItem('classRecordings', JSON.stringify(recordings));
    }
  }
}
