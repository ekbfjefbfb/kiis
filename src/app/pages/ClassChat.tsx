import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

interface ClassChatProps {
  recordingId: string;
  classRecordingService: any;
  aiService: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ClassChat({ recordingId, classRecordingService, aiService }: ClassChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRecording();
  }, [recordingId]);

  const loadRecording = async () => {
    const data = await classRecordingService.getRecordingById(recordingId);
    setRecording(data);
    
    // Mensaje inicial
    setMessages([{
      role: 'assistant',
      content: '¡Hola! Soy Notdeer. Puedo ayudarte a responder preguntas sobre esta clase. ¿Qué te gustaría saber?'
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !recording) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Crear contexto con la información de la clase
    const context = `
Información de la clase:
- Resumen: ${recording.summary || 'No disponible'}
- Puntos importantes: ${recording.keyPoints?.join(', ') || 'No disponible'}
- Tareas: ${recording.tasks?.map((t: any) => t.description).join(', ') || 'No disponible'}
- Temas: ${recording.topics?.join(', ') || 'No disponible'}
- Apuntes: ${recording.notes || 'No disponible'}

Pregunta del estudiante: ${userMessage}

Responde de forma clara y concisa basándote en la información de la clase.
`;

    try {
      const response = await aiService.chat(context);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Lo siento, hubo un error al procesar tu pregunta. Intenta de nuevo.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!recording) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare size={32} className="text-blue-500" />
        <h1 className="text-3xl font-bold">Chat sobre la Clase</h1>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-lg p-6 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Notdeer está pensando...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregunta algo sobre esta clase..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
