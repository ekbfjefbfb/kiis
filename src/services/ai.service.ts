import { apiService } from './api.service';
import { groqService } from './groq.service';

interface ChatMessage {
  role: "user" | "ai" | "system";
  content: string;
}

interface ChatResponse {
  success?: boolean;
  response?: string;
  message?: string;
}

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

export const aiService = {
  /**
   * Procesa audio usando Groq Whisper Large V3 Turbo para transcripción real.
   * @param audioBlob - El blob de audio capturado por MediaRecorder
   * @returns El texto transcrito por Whisper
   */
  async processAudio(audioBlob: Blob): Promise<{ text: string }> {
    const text = await groqService.transcribe(audioBlob, 'es');
    return { text };
  },

  async summarizeNotes(text: string, onToken?: (token: string) => void): Promise<string> {
    if (onToken) {
      onToken("La funcionalidad de resumen local fue deprecada en favor del backend.");
    }
    return "La funcionalidad de resumen local fue deprecada en favor del backend.";
  },

  async chat(message: string, history: ChatMessage[] = [], onToken?: (token: string) => void): Promise<string> {
    try {
      const response = await apiService.post<ChatResponse>('/unified-chat/message', {
        message,
      });

      const finalMsg =
        response?.response ||
        response?.message ||
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
      throw new Error("Hubo un error al conectar con el asistente.");
    }
  }
};
