import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, Calendar, ChevronRight, Brain, ListTodo, History, Radio, CheckCircle2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"sessions" | "tasks">("sessions");
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [selectedSession, setSelectedClassSession] = useState<ClassSession | null>(null);

  const classInfo = CLASSES.find((c) => c.id === classId);

  useEffect(() => {
    if (classId) {
      const historyKey = `class_history_${classId}`;
      const savedSessions = JSON.parse(localStorage.getItem(historyKey) || "[]");
      setSessions([...savedSessions].reverse()); 
    }
  }, [classId]);

  if (!classInfo) return null;

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-white/20">
      {/* Header Adaptativo - Safe Areas */}
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

      {/* Tabs Minimalistas - Full Width */}
      <div className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-6 flex gap-8 border-b border-white/[0.03]">
        <button 
          onClick={() => setActiveTab("sessions")}
          className={clsx(
            "pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative",
            activeTab === "sessions" ? "text-white" : "text-zinc-600"
          )}
        >
          Sesiones
          {activeTab === "sessions" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
        </button>
        <button 
          onClick={() => setActiveTab("tasks")}
          className={clsx(
            "pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative",
            activeTab === "tasks" ? "text-white" : "text-zinc-600"
          )}
        >
          Tareas
          {activeTab === "tasks" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
        </button>
      </div>

      {/* Content Area - Intelligent Spacing */}
      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] py-6 max-w-2xl mx-auto w-full pb-[max(env(safe-area-inset-bottom,2rem),2rem)]">
        <AnimatePresence mode="wait">
          {activeTab === "sessions" ? (
            <motion.div 
              key="sessions-list"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {sessions.length === 0 ? (
                <div className="py-20 text-center space-y-6 opacity-20">
                  <History size={64} className="mx-auto" strokeWidth={1} />
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] leading-relaxed">Sin sesiones grabadas en el historial</p>
                </div>
              ) : (
                sessions.map((session) => (
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
                        <p className="text-lg font-black uppercase italic tracking-tight leading-tight text-zinc-200 group-active:text-white">
                          {session.topic || "Resumen de Sesión"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-zinc-800 group-active:text-white" />
                  </motion.button>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="tasks-list"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {sessions.flatMap(s => s.tasks).length === 0 ? (
                <div className="py-20 text-center space-y-6 opacity-20">
                  <ListTodo size={64} className="mx-auto" strokeWidth={1} />
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] leading-relaxed">Sin tareas identificadas actualmente</p>
                </div>
              ) : (
                sessions.flatMap(s => s.tasks).map((task) => (
                  <div 
                    key={task.id}
                    className={clsx(
                      "w-full p-6 rounded-[28px] border flex items-center justify-between transition-all duration-500",
                      task.completed ? "bg-emerald-500/5 border-emerald-500/10" : "bg-zinc-900/40 border-white/5"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={clsx(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                        task.completed ? "bg-emerald-500 border-emerald-500" : "border-white/10"
                      )}>
                        {task.completed && <CheckCircle2 size={14} className="text-black" />}
                      </div>
                      <div className="text-left">
                        <p className={clsx(
                          "text-[15px] font-black uppercase italic tracking-tight transition-all",
                          task.completed ? "text-emerald-500/50 line-through" : "text-white"
                        )}>
                          {task.title}
                        </p>
                        <p className="text-[9px] font-black text-zinc-600 uppercase mt-1.5 tracking-widest">Vence: {task.dueDate}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de Detalle de Sesión - Inmersivo & Adaptativo */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]"
          >
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">{selectedSession.date}</p>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Sesión Detalle</h2>
                </div>
                <button 
                  onClick={() => setSelectedClassSession(null)}
                  className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Plus size={28} className="rotate-45 text-white/60" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-12 pb-[max(env(safe-area-inset-bottom,2rem),4rem)]">
                <section className="space-y-6">
                  <div className="flex items-center gap-3 ml-2">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-white/30">Síntesis Inteligente</h3>
                  </div>
                  <div className="bg-zinc-900/40 border border-white/5 rounded-[36px] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-white/5" />
                    <p className="text-2xl font-bold leading-tight text-white/90 italic tracking-tight">
                      {selectedSession.summary}
                    </p>
                  </div>
                </section>

                {selectedSession.tasks.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 ml-2">
                      <div className="w-2 h-2 bg-white/30 rounded-full" />
                      <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-white/30">Compromisos</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedSession.tasks.map(t => (
                        <div key={t.id} className="p-6 rounded-[28px] bg-zinc-900/60 border border-white/5 flex items-center gap-5">
                          <div className={clsx(
                            "w-6 h-6 rounded-full border-2",
                            t.completed ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "border-white/5"
                          )} />
                          <p className={clsx("text-[15px] font-black uppercase italic tracking-tight", t.completed ? "text-zinc-600 line-through" : "text-white")}>
                            {t.title}
                          </p>
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
    </div>
  );
}
