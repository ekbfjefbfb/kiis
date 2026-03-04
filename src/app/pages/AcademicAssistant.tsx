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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      
      await aiService.chat(`${context}\n\nPregunta del Estudiante: ${text}`, [], (token) => {
        aiResponse += token;
      });

      // Lógica de acciones dinámicas
      const suggestedActions: string[] = [];
      const pendingTasks = classManager.getPendingTasks();
      
      if (pendingTasks.length > 3) {
        suggestedActions.push("🎯 Priorizar mi semana");
      }
      
      if (aiResponse.toLowerCase().includes("repas") || aiResponse.toLowerCase().includes("estudi")) {
        suggestedActions.push("📅 Agendar repaso");
      }
      
      if (todayRecordings.length > 0) {
        suggestedActions.push("📝 Resumir clase hoy");
      }

      if (aiResponse.toLowerCase().includes("plan") || aiResponse.toLowerCase().includes("organiza")) {
        suggestedActions.push("� Crear plan de estudio");
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        actions: suggestedActions.length > 0 ? suggestedActions : undefined
      }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col font-['Plus_Jakarta_Sans']">
      <header className="px-7 pt-16 pb-6 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/")} className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-2xl active:scale-90 transition-all">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Asistente IA</h1>
        </div>
        <div className="flex gap-3">
          <div className="px-3 py-1.5 bg-zinc-900 rounded-xl text-xs font-bold text-zinc-400 border border-white/5">📚 {stats.classes} CLASES</div>
          <div className="px-3 py-1.5 bg-red-500/10 rounded-xl text-xs font-bold text-red-500 border border-red-500/10">⚠️ {stats.urgent} URGENTES</div>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-7 py-8 space-y-8">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] ${m.role === 'user' ? 'bg-white text-black px-5 py-3.5 rounded-[1.8rem] rounded-tr-sm font-semibold shadow-lg shadow-white/5' : ''}`}>
              <p className="text-[17px] leading-relaxed font-medium">{m.content}</p>
              {m.actions && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {m.actions.map((action, idx) => (
                    <button key={idx} onClick={() => sendMessage(action)} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-2xl text-sm font-bold text-zinc-300 border border-white/5 transition-all active:scale-95">
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase tracking-widest animate-pulse">
            <Sparkles size={14} className="text-indigo-500" />
            Pensando...
          </div>
        )}
      </main>

      <footer className="px-7 pb-10 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-[2.2rem] px-5 py-3.5 shadow-2xl">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Escribe aquí..."
            className="flex-1 bg-transparent border-none text-white text-[17px] placeholder:text-zinc-600 outline-none font-medium"
          />
          <button 
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isProcessing}
            className="w-11 h-11 bg-white text-black rounded-full flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all shadow-xl"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
