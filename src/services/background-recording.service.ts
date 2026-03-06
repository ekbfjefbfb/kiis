export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export interface LiveTranscript {
  text: string;
  isFinal: boolean;
  timestamp: number;
}

export interface RecordingSession {
  id: string;
  classId: string;
  className: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  transcript: LiveTranscript[];
}

type TranscriptCallback = (transcript: LiveTranscript) => void;
type StateCallback = (state: 'idle' | 'recording' | 'paused' | 'error') => void;

class BackgroundRecordingService {
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  
  private session: RecordingSession | null = null;
  private onTranscript: TranscriptCallback | null = null;
  private onStateChange: StateCallback | null = null;
  
  private isInBackground = false;
  private visibilityHandler: (() => void) | null = null;
  private networkHandler: (() => void) | null = null;
  private scheduledCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initSpeechRecognition();
    this.setupBackgroundDetection();
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';
    }
  }

  private setupBackgroundDetection() {
    this.visibilityHandler = () => {
      this.isInBackground = document.hidden;
      if (this.isInBackground && this.session?.isActive) {
        console.log('📱 App en background - grabando en silencio');
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    this.networkHandler = () => {
      if (navigator.onLine && this.session?.isActive) {
        console.log('🌐 Volvió la conexión - continuar transcripción');
      }
    };
    window.addEventListener('online', this.networkHandler);
    window.addEventListener('offline', this.networkHandler);
  }

  async requestPermissions(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  async startRecording(
    classId: string,
    className: string,
    onTranscript: TranscriptCallback,
    onStateChange: StateCallback
  ): Promise<boolean> {
    if (this.session?.isActive) return false;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      onStateChange('error');
      return false;
    }

    this.onTranscript = onTranscript;
    this.onStateChange = onStateChange;

    this.session = {
      id: `rec-${Date.now()}`,
      classId,
      className,
      startTime: new Date(),
      isActive: true,
      transcript: []
    };

    this.startSpeechRecognition();
    this.startMediaRecording();
    
    onStateChange('recording');
    return true;
  }

  private startSpeechRecognition() {
    if (!this.recognition) return;

    let finalBuffer = '';

    this.recognition.onresult = (event: any) => {
      let interimText = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalBuffer += result[0].transcript + ' ';
          const transcript: LiveTranscript = {
            text: finalBuffer.trim(),
            isFinal: true,
            timestamp: Date.now()
          };
          this.session?.transcript.push(transcript);
          this.onTranscript?.(transcript);
          finalBuffer = '';
        } else {
          interimText += result[0].transcript;
          const transcript: LiveTranscript = {
            text: interimText,
            isFinal: false,
            timestamp: Date.now()
          };
          this.onTranscript?.(transcript);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'no-speech') {
        this.onStateChange?.('error');
      }
    };

    this.recognition.onend = () => {
      if (this.session?.isActive) {
        try {
          this.recognition.start();
        } catch {
          console.log('Re-iniciando reconocimiento...');
        }
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.error('Error al iniciar reconocimiento:', e);
    }
  }

  private startMediaRecording() {
    if (!this.stream) return;

    const mimeType = this.getBestMimeType();
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: mimeType || undefined,
      audioBitsPerSecond: 64000
    });

    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(5000);
  }

  private getBestMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  }

  async stopRecording(): Promise<RecordingSession> {
    if (!this.session) throw new Error('No hay sesión activa');

    this.session.isActive = false;
    this.session.endTime = new Date();

    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
    }

    const finalSession = { ...this.session };
    this.session = null;
    this.onStateChange?.('idle');

    return finalSession;
  }

  pauseRecording() {
    if (this.session?.isActive) {
      this.session.isActive = false;
      this.recognition?.stop();
      this.mediaRecorder?.pause();
      this.onStateChange?.('paused');
    }
  }

  resumeRecording() {
    if (this.session && !this.session.isActive) {
      this.session.isActive = true;
      this.startSpeechRecognition();
      this.mediaRecorder?.resume();
      this.onStateChange?.('recording');
    }
  }

  scheduleAutoRecord(classId: string, className: string, startTime: Date, endTime: Date) {
    const now = new Date();
    const delay = startTime.getTime() - now.getTime();

    if (delay > 0) {
      console.log(`⏰ Programado auto-grabación para ${startTime.toLocaleTimeString()}`);
      setTimeout(() => {
        if (this.onStateChange) {
          this.startRecording(classId, className, () => {}, this.onStateChange!);
        }
      }, delay);
    }
  }

  checkScheduledClasses(classes: { id: string; name: string; schedule: { day: string; time: string }[] }[]) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getTime();

    for (const cls of classes) {
      for (const schedule of cls.schedule) {
        if (schedule.day.toLowerCase() === currentDay) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          const classStart = new Date(now);
          classStart.setHours(hours, minutes, 0, 0);
          
          const classEnd = new Date(classStart);
          classEnd.setHours(classStart.getHours() + 2);

          const diffToStart = classStart.getTime() - currentTime;
          const diffToEnd = classEnd.getTime() - currentTime;

          if (diffToStart > 0 && diffToStart < 60000) {
            console.log(`🎯 Clase ${cls.name} comenzando - auto-iniciar grabación`);
            this.startRecording(cls.id, cls.name, () => {}, () => {});
          }
        }
      }
    }
  }

  getCurrentSession(): RecordingSession | null {
    return this.session;
  }

  destroy() {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    if (this.networkHandler) {
      window.removeEventListener('online', this.networkHandler);
      window.removeEventListener('offline', this.networkHandler);
    }
    if (this.scheduledCheckInterval) {
      clearInterval(this.scheduledCheckInterval);
    }
    this.recognition?.stop();
    this.mediaRecorder?.stop();
  }
}

export const backgroundRecordingService = new BackgroundRecordingService();
