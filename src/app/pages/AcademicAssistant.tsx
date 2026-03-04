import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { classManager } from "../../services/class-manager";
import { aiService } from "../../services/ai.service";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: string[];
}

export default function AcademicAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ classes: 0, urgent: 0, week: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isProcessing]);

  useEffect(() => {
    const loadContext = () => {
      const classes = classManager.getClasses();
      const pending = classManager.getPendingTasks();
      const today = new Date().toISOString().split('T')[0];
      
      setStats({
        classes: classes.length,
        urgent: pending.filter(t => t.dueDate === today).length,
        week: pending.filter(t => {
          const due = new Date(t.dueDate);
          const weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return due <= weekFromNow;
        }).length
      });

      if (messages.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Hola. Tienes ${pending.filter(t => t.dueDate === today).length} tareas urgentes hoy. ¿Cómo quieres organizar tu día?`,
          actions: ["🎯 Priorizar", "📋 Plan de estudio", "⏰ Gestión de tiempo"]
        }]);
      }
    };
    loadContext();
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const tasks = classManager.getPendingTasks();
      const recordings = classManager.getAllRecordings();
      const today = new Date().toISOString().split('T')[0];
      const todayRecordings = recordings.filter(r => r.date.startsWith(today));
      
      const context = `
        Contexto Académico Actual:
        - Tareas Pendientes: ${tasks.map(t => `${t.text} (Vence: ${t.dueDate})`).join(', ')}
        - Grabaciones de Hoy: ${todayRecordings.map(r => r.summary).join(' | ')}
        - Clases Totales: ${classManager.getClasses().map(c => c.name).join(', ')}
      `;

      let aiResponse = "";
      
      // Sanitización del prompt
      const prompt = `${context}\n\nPregunta del Estudiante: ${text}`;

      await aiService.chat(prompt, [], (token) => {
        aiResponse += token;
        // Opcional: Actualizar el mensaje de la IA en tiempo real si el servicio lo soporta
      });

      if (!aiResponse) throw new Error("No response from AI");

      // Lógica de acciones dinámicas
      const suggestedActions: string[] = [];
      const pendingTasksList = classManager.getPendingTasks();
      
      if (pendingTasksList.length > 3) {
        suggestedActions.push("🎯 Priorizar mi semana");
      }
      
      if (aiResponse.toLowerCase().includes("repas") || aiResponse.toLowerCase().includes("estudi")) {
        suggestedActions.push("📅 Agendar repaso");
      }
      
      if (todayRecordings.length > 0) {
        suggestedActions.push("📝 Resumir clase hoy");
      }

      if (aiResponse.toLowerCase().includes("plan") || aiResponse.toLowerCase().includes("organiza")) {
        suggestedActions.push("📋 Crear plan de estudio");
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        actions: suggestedActions.length > 0 ? suggestedActions : undefined
      }]);
    } catch (e) {
      console.error("Assistant error:", e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Lo siento, tuve un problema procesando tu pregunta. ¿Podrías intentar de nuevo?"
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] overflow-hidden">
      {/* Header con glassmorphism - Altura fija */}
      <header className="flex-none px-7 pt-12 pb-6 border-b border-white/5 bg-black/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/")} className="w-10 h-10 flex-none flex items-center justify-center bg-zinc-900 rounded-2xl active:scale-90 transition-all border border-white/5">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight truncate">Asistente IA</h1>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          <div className="flex-none px-3 py-1.5 bg-zinc-900 rounded-xl text-[10px] font-bold text-zinc-400 border border-white/5 uppercase tracking-wider">📚 {stats.classes} Clases</div>
          <div className="flex-none px-3 py-1.5 bg-red-500/10 rounded-xl text-[10px] font-bold text-red-500 border border-red-500/10 uppercase tracking-wider">⚠️ {stats.urgent} Urgentes</div>
        </div>
      </header>

      {/* Chat - Área scrollable */}
      <main 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-7 py-8 space-y-8 scroll-smooth no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="min-h-full flex flex-col justify-end">
          <div className="space-y-8 pb-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${m.role === 'user' 
                  ? 'bg-white text-black px-5 py-3.5 rounded-[1.8rem] rounded-tr-sm font-semibold shadow-lg shadow-white/5' 
                  : 'text-white'
                }`}>
                  <p className="text-[17px] leading-relaxed font-medium break-words">{m.content}</p>
                  {m.actions && (
                    <div className="flex flex-wrap gap-2 mt-5">
                      {m.actions.map((action, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => sendMessage(action)} 
                          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-2xl text-[13px] font-bold text-zinc-300 border border-white/5 transition-all active:scale-95"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center gap-2 text-zinc-500 font-bold text-[11px] uppercase tracking-widest animate-pulse px-2">
                <Sparkles size={14} className="text-indigo-500" />
                Analizando contexto...
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer - Área fija abajo */}
      <footer className="flex-none px-7 pb-10 pt-4 bg-gradient-to-t from-black via-black to-transparent z-20">
        <div className="flex items-center gap-3 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.2rem] px-5 py-3.5 shadow-2xl ring-1 ring-white/5">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Escribe aquí..."
            className="flex-1 bg-transparent border-none text-white text-[16px] placeholder:text-zinc-600 outline-none font-medium"
          />
          <button 
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isProcessing}
            className="w-11 h-11 flex-none bg-white text-black rounded-full flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all shadow-xl hover:bg-zinc-100"
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </div>
      </footer>
    </div>
  );
}
