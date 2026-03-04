import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X, Calendar, CheckCircle2, BookOpen } from 'lucide-react';
import { classManager, Task, Recording } from '../../services/class-manager';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: ChatAction[];
}

interface ChatAction {
  type: 'complete_task' | 'schedule_reminder' | 'view_recording' | 'create_study_plan';
  label: string;
  data: any;
}

interface SmartChatProps {
  isOpen: boolean;
  onClose: () => void;
  contextClass?: string;
  contextRecording?: Recording;
}

export default function SmartChat({ isOpen, onClose, contextClass, contextRecording }: SmartChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = () => {
    const pendingTasks = classManager.getPendingTasks();
    const recentRecordings = classManager.getAllRecordings().slice(0, 3);
    
    let welcomeMessage = "¡Hola! Soy tu asistente académico. ";
    let suggestions = [];
    
    if (contextRecording) {
      welcomeMessage += `Vi que acabas de grabar ${contextRecording.classId}. `;
      suggestions = [
        "Explícame los puntos clave de esta clase",
        "¿Cómo organizo estas tareas?",
        "Crea un plan de estudio"
      ];
    } else if (pendingTasks.length > 0) {
      welcomeMessage += `Tienes ${pendingTasks.length} tareas pendientes. `;
      suggestions = [
        "¿Cuáles tareas son más urgentes?",
        "Ayúdame a priorizar mi tiempo",
        "¿Cómo estudio para el examen?"
      ];
    } else {
      welcomeMessage += "¿En qué puedo ayudarte hoy?";
      suggestions = [
        "Revisa mis clases de esta semana",
        "¿Qué debería estudiar hoy?",
        "Muéstrame mis grabaciones recientes"
      ];
    }

    const welcomeMsg: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: welcomeMessage,
      timestamp: new Date(),
      suggestions
    };

    setMessages([welcomeMsg]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simular respuesta de IA (aquí conectarías con tu backend)
    const aiResponse = await generateAIResponse(text);
    
    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);
  };

  const generateAIResponse = async (userInput: string): Promise<Message> => {
    // Análisis del contexto del usuario
    const pendingTasks = classManager.getPendingTasks();
    const classes = classManager.getClasses();
    const recentRecordings = classManager.getAllRecordings().slice(0, 5);

    let response = "";
    let actions: ChatAction[] = [];
    let suggestions: string[] = [];

    const input = userInput.toLowerCase();

    if (input.includes('tarea') || input.includes('pendiente') || input.includes('urgente')) {
      const urgentTasks = pendingTasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        const now = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 2;
      });

      if (urgentTasks.length > 0) {
        response = `Tienes ${urgentTasks.length} tareas urgentes:\n\n`;
        urgentTasks.forEach((task, i) => {
          const className = classes.find(c => c.id === task.classId)?.name || 'Clase';
          const dueDate = new Date(task.dueDate).toLocaleDateString('es-ES');
          response += `${i + 1}. **${task.text}** (${className}) - Vence: ${dueDate}\n`;
          
          actions.push({
            type: 'complete_task',
            label: `Marcar como completada`,
            data: { taskId: task.id }
          });
        });

        suggestions = [
          "¿Cómo organizo mi tiempo para estas tareas?",
          "¿Cuál debería hacer primero?",
          "Crea un horario de estudio"
        ];
      } else {
        response = "¡Genial! No tienes tareas urgentes. ¿Quieres revisar las próximas o planificar tiempo de estudio?";
        suggestions = [
          "Muéstrame todas mis tareas",
          "¿Qué debería estudiar hoy?",
          "Revisa mis grabaciones recientes"
        ];
      }
    }
    
    else if (input.includes('estudio') || input.includes('estudiar') || input.includes('plan')) {
      response = "Te ayudo a crear un plan de estudio personalizado:\n\n";
      
      const classesWithTasks = classes.filter(cls => 
        pendingTasks.some(task => task.classId === cls.id)
      );

      if (classesWithTasks.length > 0) {
        response += "**Basado en tus tareas pendientes:**\n";
        classesWithTasks.forEach(cls => {
          const classTasks = pendingTasks.filter(t => t.classId === cls.id);
          response += `• ${cls.name}: ${classTasks.length} tareas\n`;
        });

        actions.push({
          type: 'create_study_plan',
          label: 'Crear plan de estudio detallado',
          data: { classes: classesWithTasks }
        });
      }

      suggestions = [
        "¿Cuánto tiempo debo estudiar cada materia?",
        "¿Qué técnicas de estudio recomiendas?",
        "Ayúdame con horarios de estudio"
      ];
    }
    
    else if (input.includes('grabación') || input.includes('clase') || input.includes('apuntes')) {
      if (recentRecordings.length > 0) {
        response = "Aquí están tus grabaciones recientes:\n\n";
        recentRecordings.forEach((recording, i) => {
          const className = classes.find(c => c.id === recording.classId)?.name || 'Clase';
          const date = new Date(recording.date).toLocaleDateString('es-ES');
          const duration = Math.round(recording.duration / 60);
          response += `${i + 1}. **${className}** - ${date} (${duration} min)\n`;
          
          if (recording.summary) {
            response += `   📋 ${recording.summary.substring(0, 100)}...\n`;
          }

          actions.push({
            type: 'view_recording',
            label: `Ver detalles de ${className}`,
            data: { recordingId: recording.id }
          });
        });

        suggestions = [
          "Explícame los puntos clave de la última clase",
          "¿Qué tareas salieron de estas grabaciones?",
          "Busca algo específico en mis apuntes"
        ];
      } else {
        response = "Aún no tienes grabaciones. ¡Graba tu primera clase para que pueda ayudarte con los apuntes!";
        suggestions = [
          "¿Cómo funciona la grabación?",
          "¿Qué información extrae la IA?",
          "Consejos para grabar clases"
        ];
      }
    }
    
    else if (input.includes('priorizar') || input.includes('organizar') || input.includes('tiempo')) {
      const highPriorityTasks = pendingTasks.filter(t => t.priority === 3);
      const mediumPriorityTasks = pendingTasks.filter(t => t.priority === 2);
      
      response = "Te ayudo a priorizar:\n\n";
      
      if (highPriorityTasks.length > 0) {
        response += "🔴 **ALTA PRIORIDAD** (hacer primero):\n";
        highPriorityTasks.forEach(task => {
          const className = classes.find(c => c.id === task.classId)?.name;
          response += `• ${task.text} (${className})\n`;
        });
        response += "\n";
      }
      
      if (mediumPriorityTasks.length > 0) {
        response += "🟡 **PRIORIDAD MEDIA** (después):\n";
        mediumPriorityTasks.forEach(task => {
          const className = classes.find(c => c.id === task.classId)?.name;
          response += `• ${task.text} (${className})\n`;
        });
      }

      suggestions = [
        "¿Cuánto tiempo necesito para cada tarea?",
        "Crea un horario para hoy",
        "¿Cómo evito procrastinar?"
      ];
    }
    
    else {
      // Respuesta genérica pero contextual
      response = "Puedo ayudarte con:\n\n";
      response += "📋 Organizar y priorizar tus tareas\n";
      response += "📚 Crear planes de estudio personalizados\n";
      response += "🎙️ Revisar y explicar tus grabaciones\n";
      response += "⏰ Gestionar tu tiempo académico\n";

      suggestions = [
        "¿Qué tareas tengo pendientes?",
        "Ayúdame a estudiar para el examen",
        "Explícame mi última grabación"
      ];
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
      suggestions,
      actions
    };
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleAction = (action: ChatAction) => {
    switch (action.type) {
      case 'complete_task':
        classManager.completeTask(action.data.taskId);
        sendMessage("Tarea marcada como completada ✅");
        break;
      case 'create_study_plan':
        sendMessage("Crea un plan de estudio detallado para mis clases");
        break;
      case 'view_recording':
        sendMessage(`Muéstrame los detalles de la grabación ${action.data.recordingId}`);
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
      <div className="bg-zinc-900 rounded-t-2xl w-full max-w-md h-[80vh] flex flex-col border-t border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-semibold">Asistente Académico</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-zinc-800 text-zinc-100'
              }`}>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                
                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleAction(action)}
                        className="w-full text-left bg-zinc-700 hover:bg-zinc-600 rounded-lg p-2 text-xs transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {message.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(suggestion)}
                        className="block w-full text-left text-blue-300 hover:text-blue-200 text-xs transition-colors"
                      >
                        💡 {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 rounded-2xl p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
              placeholder="Pregúntame sobre tus tareas, clases o estudios..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none text-sm"
            />
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 text-white rounded-xl px-4 py-3 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}