import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, Calendar, ChevronRight, Brain, ListTodo, History, Radio, Layout, BookOpen, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { CLASSES } from "../data/mock";

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
  const [selectedSession, setSelectedClassSession] = useState<ClassSession | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const classInfo = CLASSES.find((c) => c.id === classId);

  useEffect(() => {
    if (classId) {
      const historyKey = `class_history_${classId}`;
      const savedSessions = JSON.parse(localStorage.getItem(historyKey) || "[]");
      setSessions([...savedSessions].reverse()); 
    }
  }, [classId]);

  if (!classInfo) return null;

  const totalTasks = sessions.flatMap(s => s.tasks);
  const pendingTasks = totalTasks.filter(t => !t.completed);

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-white/20">
      {/* Header Inteligente y Adaptativo */}
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Materia</p>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{classInfo.name}</h1>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(`/live/${classId}`)}
          className="h-11 px-5 rounded-full bg-white text-black flex items-center gap-2 active:opacity-90 transition-all shadow-xl font-black uppercase italic tracking-tighter text-[12px]"
        >
          <Radio size={18} />
          <span>Nueva Sesión</span>
        </motion.button>
      </header>

      {/* Main Content - Jerarquía Visual Inteligente */}
      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] py-8 max-w-2xl mx-auto w-full space-y-10 pb-32">
        
        {/* Sección Resumen General - Siempre Visible */}
        <section className="space-y-5">
          <div className="flex items-center justify-between px-2 text-zinc-500">
            <div className="flex items-center gap-3">
              <Brain size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Resumen General</h3>
            </div>
            {sessions.length > 0 && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/60 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Actualizado
              </span>
            )}
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-[36px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-white/5 group-hover:bg-white/10 transition-colors" />
            <p className="text-xl font-bold leading-tight text-white/90 italic tracking-tight">
              {sessions.length > 0 
                ? `Consolidado de ${sessions.length} sesiones. Los temas principales giran en torno a ${sessions[0].topic || 'conceptos clave'} y objetivos de la materia.` 
                : "Aún no hay suficientes datos para generar un resumen global. Inicia una sesión para comenzar el análisis."}
            </p>
          </div>
        </section>

        {/* Sesiones Recientes e Historial */}
        <section className="space-y-5">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3 text-zinc-500">
              <History size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Sesiones</h3>
            </div>
            {sessions.length > 3 && (
              <button 
                onClick={() => setShowFullHistory(true)}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-600 active:text-white transition-colors"
              >
                Ver todas
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="py-12 bg-zinc-900/20 border border-dashed border-white/5 rounded-[32px] text-center space-y-4 opacity-30">
                <History size={40} className="mx-auto" strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin historial</p>
              </div>
            ) : (
              sessions.slice(0, 3).map((session) => (
                <motion.button
                  key={session.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedClassSession(session)}
                  className="w-full bg-zinc-900/40 border border-white/5 rounded-[28px] p-6 flex items-center justify-between text-left active:bg-zinc-800 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                      <Calendar size={18} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">{session.date}</p>
                      <p className="text-lg font-black uppercase italic tracking-tight leading-tight text-zinc-200 group-active:text-white truncate max-w-[180px]">
                        {session.topic || "Resumen de Sesión"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-zinc-800" />
                </motion.button>
              ))
            )}
          </div>
        </section>

        {/* Tareas Pendientes de la Materia */}
        <section className="space-y-5">
          <div className="flex items-center gap-3 ml-2 text-zinc-500">
            <ListTodo size={18} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Compromisos</h3>
          </div>
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="py-12 bg-zinc-900/20 border border-dashed border-white/5 rounded-[32px] text-center space-y-4 opacity-30">
                <CheckCircle2 size={40} className="mx-auto" strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Al día</p>
              </div>
            ) : (
              pendingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="w-full bg-zinc-900/40 border border-white/5 rounded-[28px] p-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-7 h-7 rounded-full border-2 border-white/10 flex items-center justify-center shrink-0">
                      {task.completed && <CheckCircle2 size={14} className="text-emerald-500" />}
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-black uppercase italic tracking-tight text-white">{task.title}</p>
                      <p className="text-[9px] font-black text-zinc-600 uppercase mt-1.5 tracking-widest">Vence: {task.dueDate}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Modal Detalle de Sesión */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">{selectedSession.date}</p>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Resumen Sesión</h2>
                </div>
                <button onClick={() => setSelectedClassSession(null)} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                  <Plus size={28} className="rotate-45 text-white/60" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-12 pb-10">
                <section className="space-y-6">
                  <div className="flex items-center gap-3 text-white/30 ml-2"><Brain size={18} /><h3 className="text-[12px] font-black uppercase tracking-[0.5em]">Síntesis IA</h3></div>
                  <div className="bg-zinc-900/40 border border-white/5 rounded-[36px] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-white/5" />
                    <p className="text-2xl font-bold leading-tight text-white/90 italic tracking-tight">{selectedSession.summary}</p>
                  </div>
                </section>
                {selectedSession.tasks.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-white/30 ml-2"><ListTodo size={18} /><h3 className="text-[12px] font-black uppercase tracking-[0.5em]">Tareas</h3></div>
                    <div className="space-y-3">
                      {selectedSession.tasks.map(t => (
                        <div key={t.id} className="p-6 rounded-[28px] bg-zinc-900/60 border border-white/5 flex items-center gap-5">
                          <div className={clsx("w-6 h-6 rounded-full border-2", t.completed ? "bg-emerald-500 border-emerald-500" : "border-white/5")} />
                          <p className={clsx("text-[15px] font-black uppercase italic", t.completed ? "text-zinc-600 line-through" : "text-white")}>{t.title}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Historial Completo */}
      <AnimatePresence>
        {showFullHistory && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Historial</h2>
                <button onClick={() => setShowFullHistory(false)} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                  <Plus size={28} className="rotate-45 text-white/60" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-10">
                {sessions.map((s) => (
                  <button key={s.id} onClick={() => { setSelectedClassSession(s); setShowFullHistory(false); }} className="w-full bg-zinc-900/40 border border-white/5 rounded-[28px] p-6 flex items-center justify-between text-left active:bg-zinc-800 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0"><Calendar size={18} className="text-zinc-500" /></div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{s.date}</p>
                        <p className="text-lg font-black uppercase italic tracking-tight leading-none text-zinc-200">{s.topic || "Resumen de Sesión"}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-zinc-800" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
