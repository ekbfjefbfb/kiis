export class AudioService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private permissionsGranted = false;
  private wakeLock: any = null;
  private fullTranscript = '';

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true; // Cambiar a true para grabación continua
      this.recognition.interimResults = true; // Resultados intermedios
      this.recognition.lang = 'es-ES';
      this.recognition.maxAlternatives = 1;
    }
  }

  // Mantener la pantalla activa durante la grabación
  private async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('Wake Lock activado');
        
        this.wakeLock.addEventListener('release', () => {
          console.log('Wake Lock liberado');
        });
      }
    } catch (err) {
      console.error('Error al activar Wake Lock:', err);
    }
  }

  private async releaseWakeLock() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (this.permissionsGranted) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      this.permissionsGranted = true;
      return true;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }

  startRecording(onResult: (text: string) => void, onError?: (error: string) => void): void {
    if (!this.recognition) {
      onError?.('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    this.isRecording = true;
    this.fullTranscript = '';
    this.requestWakeLock(); // Mantener pantalla activa

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.fullTranscript += finalTranscript;
        onResult(this.fullTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Error en reconocimiento de voz:', event.error);
      
      // Si el error es "no-speech", reiniciar automáticamente
      if (event.error === 'no-speech' && this.isRecording) {
        console.log('Reiniciando reconocimiento...');
        setTimeout(() => {
          if (this.isRecording) {
            try {
              this.recognition.start();
            } catch (e) {
              console.error('Error al reiniciar:', e);
            }
          }
        }, 100);
      } else {
        onError?.(event.error);
        this.isRecording = false;
        this.releaseWakeLock();
      }
    };

    this.recognition.onend = () => {
      // Si todavía está grabando, reiniciar automáticamente
      if (this.isRecording) {
        console.log('Reconocimiento terminó, reiniciando...');
        try {
          this.recognition.start();
        } catch (error) {
          console.error('Error al reiniciar reconocimiento:', error);
          this.isRecording = false;
          this.releaseWakeLock();
        }
      } else {
        this.releaseWakeLock();
      }
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      this.isRecording = false;
      this.releaseWakeLock();
    }
  }

  stopRecording(): void {
    if (this.recognition && this.isRecording) {
      this.isRecording = false;
      this.recognition.stop();
      this.releaseWakeLock();
    }
  }

  getFullTranscript(): string {
    return this.fullTranscript;
  }

  speak(text: string, onEnd?: () => void): void {
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synthesis.speak(utterance);
  }

  stopSpeaking(): void {
    this.synthesis.cancel();
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  isSupported(): boolean {
    return !!this.recognition && 'speechSynthesis' in window;
  }

  async startAudioRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Error al iniciar grabación de audio:', error);
      throw error;
    }
  }

  async stopAudioRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No hay grabación activa'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = [];
        this.isRecording = false;
        
        if (this.mediaRecorder) {
          this.mediaRecorder.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
        
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  playAudioBlob(blob: Blob): void {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.play();
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
  }
}
