import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  ArrowLeft, Brain, History, Radio, ChevronRight, Calendar, 
  Plus, Layout, BookOpen, Clock, MapPin, Mic, StopCircle, Loader2, ListTodo, CheckCircle2, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { CLASSES } from "../data/mock";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";
import { aiService } from "../../services/ai.service";

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
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative selection:bg-white/20">
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1 text-left">Materia_</p>
            <h1 className="text-xl font-extrabold uppercase italic tracking-tighter leading-none">{classInfo.name}</h1>
          </div>
        </div>
        {isRecording && (
          <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Live_</span>
          </div>
        )}
      </header>

      {/* Navegación de Sección */}
      <div className="flex px-6 pt-4 gap-8 border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <button 
          onClick={() => setActiveTab("recording")}
          className={clsx(
            "pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
            activeTab === "recording" ? "text-white" : "text-zinc-600"
          )}
        >
          SALA_
          {activeTab === "recording" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" />}
        </button>
        <button 
          onClick={() => setActiveTab("agenda")}
          className={clsx(
            "pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
            activeTab === "agenda" ? "text-white" : "text-zinc-600"
          )}
        >
          AGENDA_
          {activeTab === "agenda" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" />}
        </button>
      </div>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] py-6 max-w-2xl mx-auto w-full space-y-8 pb-32">
        
        <AnimatePresence mode="wait">
          {activeTab === "recording" ? (
            <motion.div key="rec-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              
              {/* Control de Sesión Activa */}
              <section className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden min-h-[200px]">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-white/20" />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Sintetizando_</p>
                    </motion.div>
                  ) : (
                    <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 w-full">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={isRecording ? stopRecording : startRecording}
                        className={clsx(
                          "w-20 h-20 rounded-[28px] flex items-center justify-center border transition-all duration-500 shadow-2xl relative z-10",
                          isRecording ? "bg-white border-white" : "bg-zinc-800 border-white/5 hover:border-white/10"
                        )}
                      >
                        {isRecording ? <StopCircle size={28} fill="black" className="text-black" /> : <Mic size={28} className="text-zinc-600" />}
                        {isRecording && (
                          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-white/20 rounded-full -z-10" />
                        )}
                      </motion.button>
                      <div className="text-center space-y-1">
                        <p className="text-[11px] font-extrabold uppercase italic tracking-widest text-zinc-400">
                          {isRecording ? "Capturando Clase_" : "Grabar Sesión_"}
                        </p>
                        {isRecording && <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">IA Escuchando_</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Resultado de Sesión Reciente (Inmediato) */}
              <AnimatePresence>
                {lastResult && (
                  <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="flex items-center gap-3 ml-2 text-emerald-500/40">
                      <Sparkles size={16} />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Sesión Generada_</h3>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[40px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/20" />
                      <div>
                        <p className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest mb-2">{lastResult.date}</p>
                        <h4 className="text-2xl font-extrabold uppercase italic text-white tracking-tighter leading-tight mb-4">{lastResult.topic}</h4>
                        <p className="text-lg font-bold leading-relaxed text-zinc-300 italic tracking-tight">{lastResult.summary}</p>
                      </div>
                      {lastResult.tasks.length > 0 && (
                        <div className="pt-4 border-t border-white/5 space-y-3">
                          <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest">Tareas_</p>
                          {lastResult.tasks.map(t => (
                            <div key={t.id} className="flex items-center gap-4 py-2 opacity-70">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                              <p className="text-sm font-extrabold uppercase italic tracking-tight">{t.title}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Accesos Rápidos */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowGeneralSummary(true)}
                  className="bg-zinc-900/30 border border-white/5 rounded-[32px] p-6 flex flex-col items-center gap-4 text-center active:bg-zinc-800 transition-all aspect-square sm:aspect-auto sm:py-8"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shadow-xl">
                    <Brain size={20} className="text-white/40" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Resumen_Global</p>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowHistory(true)}
                  className="bg-zinc-900/30 border border-white/5 rounded-[32px] p-6 flex flex-col items-center gap-4 text-center active:bg-zinc-800 transition-all aspect-square sm:aspect-auto sm:py-8"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shadow-xl">
                    <History size={20} className="text-white/40" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Historial_</p>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="agenda-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3 text-zinc-600">
                  <ListTodo size={16} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] italic text-zinc-600">Compromisos_</h3>
                </div>
                <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest">{allTasks.filter(t => !t.completed).length} Pendientes</span>
              </div>

              <div className="space-y-3">
                {allTasks.length === 0 ? (
                  <div className="bg-zinc-900/10 border border-dashed border-white/5 rounded-[32px] p-12 text-center space-y-4 opacity-10">
                    <Calendar size={40} className="mx-auto" strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin tareas_</p>
                  </div>
                ) : (
                  allTasks.map((task) => (
                    <motion.button
                      key={task.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleTask(task.sessionId, task.id)}
                      className={clsx(
                        "w-full p-6 rounded-[32px] border flex items-center justify-between transition-all",
                        task.completed ? "bg-zinc-900/10 border-white/5 opacity-40 shadow-none" : "bg-zinc-900/40 border-white/10 shadow-xl"
                      )}
                    >
                      <div className="flex items-center gap-5 text-left min-w-0">
                        <div className={clsx(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                          task.completed ? "bg-white border-white" : "border-white/10"
                        )}>
                          {task.completed && <CheckCircle2 size={14} className="text-black" />}
                        </div>
                        <div className="min-w-0">
                          <p className={clsx(
                            "text-sm font-extrabold uppercase italic tracking-tight truncate",
                            task.completed ? "line-through text-zinc-700" : "text-zinc-200"
                          )}>
                            {task.title}
                          </p>
                          <p className="text-[9px] font-black text-zinc-700 uppercase mt-1.5 tracking-widest">{task.dueDate}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Materia */}
        <section className="bg-zinc-900/10 border border-white/5 rounded-[32px] p-6 grid grid-cols-2 gap-6 mt-4">
          <div className="space-y-1.5">
            <p className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">Profesor_</p>
            <p className="text-xs font-extrabold uppercase italic truncate text-zinc-400">{classInfo.professor}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">Aula_</p>
            <p className="text-xs font-extrabold uppercase italic truncate text-zinc-400">{classInfo.room || "—"}</p>
          </div>
        </section>
      </main>

      {/* Modales Inmersivos */}
      <AnimatePresence>
        {showGeneralSummary && (
          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-20">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-3xl font-extrabold uppercase italic tracking-tighter">Global_</h2>
                <button onClick={() => setShowGeneralSummary(false)} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-lg"><Plus size={24} className="rotate-45 text-white/60" /></button>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-white/5" />
                <p className="text-2xl font-bold leading-relaxed text-white/90 italic tracking-tight">
                  SÍNTESIS INTELIGENTE DE TODAS LAS SESIONES DE {classInfo.name.toUpperCase()}. SE HAN IDENTIFICADO LOS EJES TEMÁTICOS Y OBJETIVOS CLAVE PARA ASEGURAR TU DOMINIO DE LA MATERIA.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {showHistory && (
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-20">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-12">
                <h2 className="text-3xl font-extrabold uppercase italic tracking-tighter">Archivo_</h2>
                <button onClick={() => setShowHistory(false)} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-lg"><Plus size={24} className="rotate-45 text-white/60" /></button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-10">
                {sessions.map((s) => (
                  <div key={s.id} className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-10 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-white/5" />
                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">{s.date}</p>
                    <h4 className="text-2xl font-extrabold uppercase italic text-white leading-none tracking-tighter">{s.topic || "Sesión"}</h4>
                    <p className="text-[15px] text-zinc-500 italic leading-relaxed tracking-tight line-clamp-4">{s.summary}</p>
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
