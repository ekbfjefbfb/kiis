export class AudioService {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.permissionsGranted = false;
        this.synthesis = window.speechSynthesis;
        this.initSpeechRecognition();
    }
    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'es-ES';
        }
    }
    async requestPermissions() {
        if (this.permissionsGranted)
            return true;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            this.permissionsGranted = true;
            return true;
        }
        catch (error) {
            console.error('Error al solicitar permisos:', error);
            return false;
        }
    }
    startRecording(onResult, onError) {
        if (!this.recognition) {
            onError?.('Tu navegador no soporta reconocimiento de voz');
            return;
        }
        this.isRecording = true;
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            this.isRecording = false;
        };
        this.recognition.onerror = (event) => {
            console.error('Error en reconocimiento de voz:', event.error);
            onError?.(event.error);
            this.isRecording = false;
        };
        this.recognition.onend = () => {
            this.isRecording = false;
        };
        try {
            this.recognition.start();
        }
        catch (error) {
            console.error('Error al iniciar grabación:', error);
            this.isRecording = false;
        }
    }
    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
        }
    }
    speak(text, onEnd) {
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
    stopSpeaking() {
        this.synthesis.cancel();
    }
    getIsRecording() {
        return this.isRecording;
    }
    isSupported() {
        return !!this.recognition && 'speechSynthesis' in window;
    }
    async startAudioRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            this.mediaRecorder.start();
            this.isRecording = true;
        }
        catch (error) {
            console.error('Error al iniciar grabación de audio:', error);
            throw error;
        }
    }
    async stopAudioRecording() {
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
                    this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
                }
                resolve(audioBlob);
            };
            this.mediaRecorder.stop();
        });
    }
    playAudioBlob(blob) {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
        };
    }
}
