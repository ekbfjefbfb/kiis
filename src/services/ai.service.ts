import { authService } from './auth.service';

const API_CONFIG = {
  BASE_URL: 'https://kiis-backend.onrender.com',
  CHAT_URL: '/api/unified-chat',
  SEARCH_URL: '/api/search'
};

export class AIService {
  private shouldStop = false;
  private readonly DEMO_MODE = true;

  async chat(message: string, onChunk?: (text: string) => void): Promise<string> {
    this.shouldStop = false;
    
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('parar') || lowerMessage.includes('detener') || lowerMessage.includes('stop')) {
      return 'Entendido, he detenido la respuesta.';
    }

    if (this.DEMO_MODE) {
      return this.demoChat(message, onChunk);
    }

    try {
      const token = await authService.getValidToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const formData = new FormData();
      formData.append('message', message);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT_URL}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      return data.response || 'Sin respuesta';
    } catch (error) {
      console.error('Error en chat:', error);
      return 'Error al conectar con el servidor.';
    }
  }

  private async demoChat(message: string, onChunk?: (text: string) => void): Promise<string> {
    const responses = [
      'Entiendo tu pregunta. En modo demo, puedo ayudarte con información básica.',
      'Esa es una buena pregunta. Cuando conectes el backend, tendré acceso a IA avanzada.',
      'Estoy en modo demo. Conecta el backend para respuestas completas con DeepSeek.',
      'Puedo ayudarte con eso. Actualmente estoy en modo demostración.',
      'Interesante pregunta. El modo completo estará disponible al conectar el backend.'
    ];

    const response = responses[Math.floor(Math.random() * responses.length)] + 
                    ` Tu mensaje fue: "${message}"`;

    if (onChunk) {
      let currentText = '';
      const words = response.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        if (this.shouldStop) {
          return currentText + ' [Detenido]';
        }
        
        currentText += (i > 0 ? ' ' : '') + words[i];
        onChunk(currentText);
        await this.delay(50);
      }
    }

    return response;
  }

  stopGeneration(): void {
    this.shouldStop = true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const aiService = new AIService();
