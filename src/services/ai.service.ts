/* 
 * Servicio AI Simulado
 * Soporta modo DEMO para desarrollo si no hay API Key real
 */

const DEMO_MODE = true; // Set to false to use real Gemini API
const GEMINI_API_KEY = "tu_api_key_aqui";

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

Por ejemplo:
Usuario: "Llévame a mi perfil"
Tú: "¡Claro! Te llevo a tu perfil ahora mismo. [NAVIGATE:/profile]"

Usuario: "¿Qué tengo en el calendario?"
Tú: "Vamos a revisar tu calendario. [NAVIGATE:/calendar]"
`;

export const aiService = {
  async processAudio(audioBlob: Blob): Promise<{ text: string }> {
    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 2000));
      return { 
        text: "Este es un texto de prueba transcrito de tu audio. En una app real, aquí se conectaría a la API de Whisper o Gemini 1.5 Pro." 
      };
    }
    throw new Error("API Connection not implemented yet");
  },

  async summarizeNotes(text: string): Promise<string> {
    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 1500));
      return `[RESUMEN GENERADO POR IA]\n\nPuntos Principales:\n- ${text.substring(0, 50)}...\n\nAcciones Sugeridas:\n- Revisar el tema\n- Preparar preguntas para la próxima clase`;
    }
    throw new Error("API Connection not implemented yet");
  },

  async chat(message: string, onToken?: (token: string) => void): Promise<string> {
    if (DEMO_MODE) {
      const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
      const msgLower = message.toLowerCase();
      
      let response = "Interesante pregunta sobre tu clase. ¿Te gustaría que profundicemos más sobre este tema específico o prefieres repasar los apuntes anteriores?";
      
      if (msgLower.includes("perfil") || msgLower.includes("profile")) {
        response = `¡Claro! Te llevo a tu perfil ahora mismo.\n\n[NAVIGATE:/profile]`;
      } else if (msgLower.includes("calendario") || msgLower.includes("calendar")) {
        response = `Vamos a revisar tu calendario para ver las próximas fechas.\n\n[NAVIGATE:/calendar]`;
      } else if (msgLower.includes("inicio") || msgLower.includes("dashboard")) {
        response = `Volvamos al inicio.\n\n[NAVIGATE:/dashboard]`;
      } else if (msgLower.includes("nota")) {
        response = `Te abro tus notas guardadas.\n\n[NAVIGATE:/notes]`;
      } else if (msgLower.includes("tarea") || msgLower.includes("examen")) {
         response = `Claro, te recomiendo revisar el calendario para ver las fechas exactas.\n\n[NAVIGATE:/calendar]`;
      }

      if (onToken) {
        const words = response.split(" ");
        for (const word of words) {
          await wait(50 + Math.random() * 50);
          onToken(word + " ");
        }
      } else {
        await wait(1500);
      }
      return response;
    }
    
    throw new Error("API Connection not implemented yet");
  }
};
