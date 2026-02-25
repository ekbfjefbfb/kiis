import { API_CONFIG } from './config';
import { AuthService } from './auth';

export class AIService {
  private shouldStop = false;
  private authService: AuthService;
  private readonly DEMO_MODE = true;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async chat(message: string, onChunk?: (text: string) => void, files?: File[]): Promise<string> {
    this.shouldStop = false;
    
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('parar') || lowerMessage.includes('detener') || lowerMessage.includes('stop')) {
      return 'Entendido, he detenido la respuesta.';
    }

    if (this.DEMO_MODE) {
      return this.demoChat(message, onChunk);
    }

    try {
      const token = await this.authService.getValidToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const formData = new FormData();
      formData.append('message', message);
      
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('files', file);
        });
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT_URL}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401) {
        const refreshed = await this.authService.refreshAccessToken();
        if (refreshed) {
          return this.chat(message, onChunk, files);
        }
        throw new Error('Sesión expirada');
      }

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      const fullResponse = data.response || 'Sin respuesta';

      if (onChunk) {
        let currentText = '';
        const words = fullResponse.split(' ');
        
        for (let i = 0; i < words.length; i++) {
          if (this.shouldStop) {
            return currentText + ' [Detenido]';
          }
          
          currentText += (i > 0 ? ' ' : '') + words[i];
          onChunk(currentText);
          await this.delay(30);
        }
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Error en chat:', error);
      return 'Error al conectar con el servidor. Por favor intenta de nuevo.';
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

  async searchWeb(query: string, limit: number = 5): Promise<any> {
    if (this.DEMO_MODE) {
      return {
        success: true,
        query,
        search_results: [
          { title: 'Resultado Demo 1', description: 'Descripción de ejemplo', link: '#' },
          { title: 'Resultado Demo 2', description: 'Otra descripción', link: '#' }
        ],
        ai_analysis: 'Análisis demo de la búsqueda',
        total_results: 2
      };
    }

    try {
      const token = await this.authService.getValidToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.SEARCH_URL}/web`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          limit,
          language: 'es',
          ai_analysis: true
        })
      });

      if (!response.ok) {
        throw new Error('Error en búsqueda web');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en búsqueda web:', error);
      return null;
    }
  }

  async summarizeDocument(file: File): Promise<string> {
    if (this.DEMO_MODE) {
      return `Resumen demo del documento "${file.name}": Este es un resumen de ejemplo. Conecta el backend para análisis real con IA.`;
    }

    try {
      const token = await this.authService.getValidToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const formData = new FormData();
      formData.append('message', 'Resume este documento de forma clara y concisa');
      formData.append('files', file);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT_URL}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al resumir documento');
      }

      const data = await response.json();
      return data.response || 'No se pudo generar el resumen';
    } catch (error) {
      console.error('Error al resumir documento:', error);
      return 'Error al procesar el documento';
    }
  }

  stopGeneration(): void {
    this.shouldStop = true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
