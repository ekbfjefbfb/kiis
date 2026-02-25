export class AudioService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private permissionsGranted = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initSpeechRecognition();
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

    let finalTranscript = '';

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      onResult(finalTranscript + interimTranscript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Error en reconocimiento de voz:', event.error);
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isRecording = false;
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      this.isRecording = false;
    }
  }

  stopRecording(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  /**
   * Obtiene todas las voces disponibles en español en el dispositivo.
   * Retorna un array con el nombre y el lang de cada voz.
   */
  getAvailableVoices(): { name: string; lang: string; voiceURI: string }[] {
    const voices = this.synthesis.getVoices();
    // Filtrar voces en español y agregar algunas en inglés como referencia
    const filtered = voices.filter(v => 
      v.lang.startsWith('es') || v.lang.startsWith('en')
    );

    // Si no hay voces filtradas, retornar todas
    const result = filtered.length > 0 ? filtered : voices;

    return result.map(v => ({
      name: v.name,
      lang: v.lang,
      voiceURI: v.voiceURI,
    }));
  }

  /**
   * Habla texto usando una voz específica seleccionada por nombre.
   */
  speakWithVoice(text: string, voiceName: string | null, rate: number = 1.0, onEnd?: () => void): void {
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceName) {
      const voices = this.synthesis.getVoices();
      const selected = voices.find(v => v.name === voiceName);
      if (selected) {
        utterance.voice = selected;
        utterance.lang = selected.lang;
      } else {
        utterance.lang = 'es-ES';
      }
    } else {
      utterance.lang = 'es-ES';
    }

    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    utterance.onerror = () => {
      onEnd?.();
    };

    this.synthesis.speak(utterance);
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

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  isSupported(): boolean {
    return !!this.recognition && 'speechSynthesis' in window;
  }

  async startAudioRecording(): Promise<void> {
    try {
      // Configuración optimizada para móviles
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Configuración para mejor calidad en móviles
          sampleRate: 44100,
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Detectar el mejor formato para el dispositivo
      const mimeType = this.getBestMimeType();
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000 // 128 kbps para buena calidad
      });
      
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Grabar en chunks de 1 segundo para mejor compatibilidad
      this.mediaRecorder.start(1000);
      this.isRecording = true;
    } catch (error) {
      console.error('Error al iniciar grabación de audio:', error);
      throw error;
    }
  }

  private getBestMimeType(): string {
    // Prioridad de formatos para compatibilidad móvil
    const types = [
      'audio/webm;codecs=opus',  // Mejor para Android
      'audio/webm',              // Fallback Android
      'audio/mp4',               // iOS Safari
      'audio/aac',               // iOS alternativo
      'audio/ogg;codecs=opus',   // Fallback general
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Usando formato:', type);
        return type;
      }
    }

    // Si ninguno funciona, usar el default
    return '';
  }

  async stopAudioRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No hay grabación activa'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        // Usar el tipo MIME que se usó para grabar
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];
        this.isRecording = false;
        
        if (this.mediaRecorder) {
          this.mediaRecorder.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
        
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (error) => {
        console.error('Error al detener grabación:', error);
        reject(error);
      };

      this.mediaRecorder.stop();
    });
  }

  playAudioBlob(blob: Blob): void {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    
    // Configuración para mejor reproducción en móviles
    audio.preload = 'auto';
    
    audio.play().catch(error => {
      console.error('Error al reproducir audio:', error);
      // En iOS puede requerir interacción del usuario
      alert('Toca para reproducir el audio');
    });
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = (error) => {
      console.error('Error en reproducción:', error);
      URL.revokeObjectURL(audioUrl);
    };
  }
}

export const audioService = new AudioService();
