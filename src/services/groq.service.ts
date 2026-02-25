/**
 * Groq Speech-to-Text Service
 * Usa Whisper Large V3 Turbo para transcripción de audio real.
 * API: https://api.groq.com/openai/v1/audio/transcriptions
 */

const GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY as string | undefined;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export interface GroqTranscription {
  text: string;
}

export const groqService = {

  /**
   * Transcribe audio usando Whisper Large V3 Turbo de Groq.
   * @param audioBlob - El blob de audio grabado (webm, mp4, ogg, etc.)
   * @param language - Código de idioma ISO (default: 'es' para español)
   * @returns El texto transcrito
   */
  async transcribe(audioBlob: Blob, language: string = 'es'): Promise<string> {
    if (!GROQ_API_KEY || !GROQ_API_KEY.trim()) {
      throw new Error('Groq API Key no configurada. Define VITE_GROQ_API_KEY en tu .env');
    }
    // Determinar extensión correcta basada en el MIME type
    const ext = this.getExtensionFromMime(audioBlob.type);
    const fileName = `recording.${ext}`;

    const formData = new FormData();
    formData.append('file', audioBlob, fileName);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', language);
    formData.append('response_format', 'json');
    formData.append('temperature', '0');

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Groq API Error:', response.status, errorBody);
        throw new Error(`Error de transcripción (${response.status}): ${errorBody}`);
      }

      const data: GroqTranscription = await response.json();
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('No se detectó habla en el audio.');
      }

      return data.text.trim();
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw new Error('Error de red. Verifica tu conexión a internet.');
      }
      throw error;
    }
  },

  /**
   * Retorna la extensión de archivo apropiada según el MIME type
   */
  getExtensionFromMime(mimeType: string): string {
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('wav')) return 'wav';
    if (mimeType.includes('aac')) return 'aac';
    if (mimeType.includes('mpeg')) return 'mp3';
    if (mimeType.includes('flac')) return 'flac';
    return 'webm'; // Default
  }
};
