import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  ArrowLeft, Brain, History, Radio, ChevronRight, Calendar, 
  Plus, Layout, BookOpen, Clock, MapPin, Mic, StopCircle, Loader2, ListTodo, CheckCircle2, Sparkles, Sun, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { CLASSES } from "../data/mock";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";
import { aiService } from "../../services/ai.service";
import { useDarkMode } from "../../hooks/useDarkMode";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface ClassSession {
  id: string;
  date: string;
  summary: string;
  tasks: Task[];
  topic?: string;
}

export default function ClassDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showGeneralSummary, setShowGeneralSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<"recording" | "agenda">("recording");
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ClassSession | null>(null);
  const wakeLockRef = useRef<any>(null);

  const classInfo = CLASSES.find((c) => c.id === classId);

  useEffect(() => {
    if (classId) {
      loadHistory();
    }
  }, [classId]);

  const loadHistory = () => {
    const historyKey = `class_history_${classId}`;
    const savedSessions = JSON.parse(localStorage.getItem(historyKey) || "[]");
    setSessions([...savedSessions].reverse());
  };

  const startRecording = async () => {
    const ok = await audioService.requestPermissions();
    if (!ok) return;
    try {
      await audioService.startAudioRecording();
      setIsRecording(true);
      setLastResult(null);
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (e) { console.error(e); }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    if (wakeLockRef.current) wakeLockRef.current.release();
    
    try {
      const audioBlob = await audioService.stopAudioRecording();
      const text = await groqService.transcribe(audioBlob, 'es');
      
      const prompt = `Analiza esta clase de "${classInfo?.name}" y genera un resumen y tareas. 
      Responde JSON: { "summary": "...", "topic": "...", "tasks": [{"id": "uuid", "title": "...", "dueDate": "...", "completed": false}] }
      Transcripción: ${text}`;
      
      let aiResponse = "";
      await aiService.chat(prompt, [], (token) => { aiResponse += token; });

      const jsonStr = aiResponse.substring(aiResponse.indexOf('{'), aiResponse.lastIndexOf('}') + 1);
      const parsed = JSON.parse(jsonStr);
      
      const newSession: ClassSession = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        topic: parsed.topic,
        summary: parsed.summary,
        tasks: parsed.tasks || []
      };
      
      const historyKey = `class_history_${classId}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      localStorage.setItem(historyKey, JSON.stringify([...existing, newSession]));
      
      setLastResult(newSession);
      loadHistory();
    } catch (e) { console.error(e); } finally {
      setIsProcessing(false);
    }
  };

  const toggleTask = (sessionId: string, taskId: string) => {
    const historyKey = `class_history_${classId}`;
    const existing: ClassSession[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const updated = existing.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          tasks: s.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return s;
    });
    localStorage.setItem(historyKey, JSON.stringify(updated));
    loadHistory();
  };

  if (!classInfo) return null;

  const allTasks = sessions.flatMap(s => s.tasks.map(t => ({ ...t, sessionId: s.id })));

  return (
    <div className="h-[100dvh] w-full bg-background text-foreground font-sans selection:bg-primary/20 overflow-hidden flex flex-col relative transition-colors duration-300">
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1 text-left">Materia_</p>
            <h1 className="text-xl font-bold uppercase italic tracking-tighter leading-none">{classInfo.name}</h1>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform"
          >
            {isDark ? <Sun size={18} className="text-muted-foreground" /> : <Moon size={18} className="text-muted-foreground" />}
          </button>
          {isRecording && (
            <div className="px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <div className="w-1 h-1 rounded-full bg-destructive animate-pulse" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-destructive">Live_</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex px-6 pt-4 gap-8 border-b border-border bg-background/40 backdrop-blur-sm">
        <button 
          onClick={() => setActiveTab("recording")}
          className={clsx(
            "pb-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative",
            activeTab === "recording" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          SALA_
          {activeTab === "recording" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground shadow-[0_0_10px_rgba(255,255,255,0.3)]" />}
        </button>
        <button 
          onClick={() => setActiveTab("agenda")}
          className={clsx(
            "pb-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative",
            activeTab === "agenda" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          AGENDA_
          {activeTab === "agenda" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground shadow-[0_0_10px_rgba(255,255,255,0.3)]" />}
        </button>
      </div>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] py-6 max-w-2xl mx-auto w-full space-y-8 pb-32">
        
        <AnimatePresence mode="wait">
          {activeTab === "recording" ? (
            <motion.div key="rec-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              
              <section className="bg-secondary/40 border border-border rounded-[32px] p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden min-h-[200px]">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-muted-foreground" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground italic">Sintetizando_</p>
                    </motion.div>
                  ) : (
                    <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 w-full">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={isRecording ? stopRecording : startRecording}
                        className={clsx(
                          "w-20 h-20 rounded-[28px] flex items-center justify-center border transition-all duration-500 shadow-2xl relative z-10",
                          isRecording ? "bg-foreground border-foreground" : "bg-secondary border-border hover:bg-secondary/80"
                        )}
                      >
                        {isRecording ? <StopCircle size={28} className="text-background" fill="currentColor" /> : <Mic size={28} className="text-muted-foreground" />}
                        {isRecording && (
                          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-foreground/20 rounded-full -z-10" />
                        )}
                      </motion.button>
                      <div className="text-center space-y-1">
                        <p className="text-[11px] font-bold uppercase italic tracking-widest text-muted-foreground">
                          {isRecording ? "Capturando Clase_" : "Grabar Sesión_"}
                        </p>
                        {isRecording && <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest opacity-60">IA Escuchando_</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <AnimatePresence>
                {lastResult && (
                  <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="flex items-center gap-3 ml-2 text-primary/60">
                      <Sparkles size={16} />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Sesión Generada_</h3>
                    </div>
                    <div className="bg-primary/5 border border-primary/10 rounded-[40px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{lastResult.date}</p>
                        <h4 className="text-2xl font-bold uppercase italic text-foreground tracking-tighter leading-tight mb-4">{lastResult.topic}</h4>
                        <p className="text-lg font-medium leading-relaxed text-muted-foreground italic tracking-tight">{lastResult.summary}</p>
                      </div>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowGeneralSummary(true)}
                  className="bg-secondary/30 border border-border rounded-[32px] p-6 flex flex-col items-center gap-4 text-center active:bg-secondary transition-all aspect-square sm:aspect-auto sm:py-8 shadow-inner"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border shadow-xl">
                    <Brain size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] italic text-muted-foreground">Resumen_Global</p>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowHistory(true)}
                  className="bg-secondary/30 border border-border rounded-[32px] p-6 flex flex-col items-center gap-4 text-center active:bg-secondary transition-all aspect-square sm:aspect-auto sm:py-8 shadow-inner"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border shadow-xl">
                    <History size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] italic text-muted-foreground">Historial_</p>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="agenda-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <ListTodo size={16} />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] italic">Compromisos_</h3>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{allTasks.filter(t => !t.completed).length} Pendientes</span>
              </div>

              <div className="space-y-3">
                {allTasks.length === 0 ? (
                  <div className="bg-secondary/10 border border-dashed border-border rounded-[32px] p-12 text-center space-y-4 opacity-20">
                    <Calendar size={40} className="mx-auto" strokeWidth={1} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Sin tareas_</p>
                  </div>
                ) : (
                  allTasks.map((task) => (
                    <motion.button
                      key={task.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleTask(task.sessionId, task.id)}
                      className={clsx(
                        "w-full p-6 rounded-[32px] border flex items-center justify-between transition-all",
                        task.completed ? "bg-secondary/10 border-border opacity-40 shadow-none" : "bg-secondary/40 border-border shadow-xl"
                      )}
                    >
                      <div className="flex items-center gap-5 text-left min-w-0">
                        <div className={clsx(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                          task.completed ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-border"
                        )}>
                          {task.completed && <CheckCircle2 size={14} className="text-primary-foreground" />}
                        </div>
                        <div className="min-w-0">
                          <p className={clsx(
                            "text-sm font-bold uppercase italic tracking-tight truncate",
                            task.completed ? "line-through text-muted-foreground" : "text-foreground"
                          )}>
                            {task.title}
                          </p>
                          <p className="text-[9px] font-medium text-muted-foreground uppercase mt-1.5 tracking-widest">{task.dueDate}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="bg-secondary/10 border border-border rounded-[32px] p-6 grid grid-cols-2 gap-6 mt-4">
          <div className="space-y-1.5">
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Profesor_</p>
            <p className="text-xs font-bold uppercase italic truncate text-muted-foreground opacity-80">{classInfo.professor}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Aula_</p>
            <p className="text-xs font-bold uppercase italic truncate text-muted-foreground opacity-80">{classInfo.room || "—"}</p>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showGeneralSummary && (
          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} className="fixed inset-0 z-50 bg-background flex flex-col p-6 pt-20">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-3xl font-bold uppercase italic tracking-tighter text-foreground">Global_</h2>
                <button onClick={() => setShowGeneralSummary(false)} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform shadow-lg"><Plus size={24} className="rotate-45 text-muted-foreground" /></button>
              </div>
              <div className="bg-secondary/40 border border-border rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
                <p className="text-2xl font-bold leading-relaxed text-foreground italic tracking-tight">
                  SÍNTESIS INTELIGENTE DE TODAS LAS SESIONES DE {classInfo.name.toUpperCase()}.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {showHistory && (
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed inset-0 z-50 bg-background flex flex-col p-6 pt-20">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-12">
                <h2 className="text-3xl font-bold uppercase italic tracking-tighter text-foreground">Archivo_</h2>
                <button onClick={() => setShowHistory(false)} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform shadow-lg"><Plus size={24} className="rotate-45 text-muted-foreground" /></button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-10">
                {sessions.map((s) => (
                  <div key={s.id} className="bg-secondary/40 border border-border rounded-[40px] p-10 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/10" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.date}</p>
                    <h4 className="text-2xl font-bold uppercase italic text-foreground leading-none tracking-tighter">{s.topic || "Sesión"}</h4>
                    <p className="text-[15px] text-muted-foreground italic leading-relaxed tracking-tight line-clamp-4">{s.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
