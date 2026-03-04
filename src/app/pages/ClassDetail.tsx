import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, Calendar, ChevronRight, Brain, ListTodo, History, Radio } from "lucide-react";
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
      setSessions(savedSessions.reverse()); // Mostrar más recientes primero
    }
  }, [classId]);

  if (!classInfo) return null;

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-white/20">
      {/* Header Brutalista */}
      <header className="px-6 pt-[env(safe-area-inset-top,3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Materia</p>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{classInfo.name}</h1>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/live/${classId}`)}
          className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center active:scale-90 transition-transform shadow-xl"
        >
          <Radio size={20} />
        </button>
      </header>

      {/* Tabs Minimalistas */}
      <div className="px-6 pt-6 flex gap-8 border-b border-white/[0.03]">
        <button 
          onClick={() => setActiveTab("sessions")}
          className={clsx(
            "pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all",
            activeTab === "sessions" ? "text-white border-b-2 border-white" : "text-zinc-600"
          )}
        >
          Sesiones
        </button>
        <button 
          onClick={() => setActiveTab("tasks")}
          className={clsx(
            "pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all",
            activeTab === "tasks" ? "text-white border-b-2 border-white" : "text-zinc-600"
          )}
        >
          Tareas
        </button>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto scrollbar-hide p-6 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === "sessions" ? (
            <motion.div 
              key="sessions-list"
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {sessions.length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-20">
                  <History size={48} className="mx-auto" strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin sesiones grabadas</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedClassSession(session)}
                    className="w-full bg-zinc-900/40 border border-white/5 rounded-[28px] p-6 flex items-center justify-between text-left active:bg-zinc-800 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                        <p className="text-[10px] font-black text-white/40">{session.date.split('/')[0]}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{session.date}</p>
                        <p className="text-lg font-black uppercase italic tracking-tight leading-none text-zinc-200 group-active:text-white">
                          {session.topic || "Resumen de Clase"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-zinc-800 group-active:text-white" />
                  </button>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="tasks-list"
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {sessions.flatMap(s => s.tasks).length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-20">
                  <ListTodo size={48} className="mx-auto" strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin tareas pendientes</p>
                </div>
              ) : (
                sessions.flatMap(s => s.tasks).map((task) => (
                  <div 
                    key={task.id}
                    className={clsx(
                      "w-full p-6 rounded-[28px] border flex items-center justify-between transition-all",
                      task.completed ? "bg-emerald-500/5 border-emerald-500/10" : "bg-zinc-900/40 border-white/5"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={clsx(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        task.completed ? "bg-emerald-500 border-emerald-500" : "border-white/10"
                      )}>
                        {task.completed && <CheckCircle2 size={12} className="text-black" />}
                      </div>
                      <div className="text-left">
                        <p className={clsx(
                          "text-sm font-black uppercase italic tracking-tight",
                          task.completed ? "text-emerald-500/50 line-through" : "text-white"
                        )}>
                          {task.title}
                        </p>
                        <p className="text-[9px] font-bold text-zinc-600 uppercase mt-1 tracking-widest">Vence: {task.dueDate}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de Detalle de Sesión - Inmersivo */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 z-50 bg-black flex flex-col p-6 pt-20"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">{selectedSession.date}</p>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Resumen Clase</h2>
              </div>
              <button 
                onClick={() => setSelectedClassSession(null)}
                className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 active:scale-90"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-10 pb-20">
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Brain size={18} className="text-zinc-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Síntesis IA</h3>
                </div>
                <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 shadow-2xl">
                  <p className="text-xl font-bold leading-tight text-white/90 italic tracking-tight">
                    {selectedSession.summary}
                  </p>
                </div>
              </section>

              {selectedSession.tasks.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ListTodo size={18} className="text-zinc-600" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Tareas de la sesión</h3>
                  </div>
                  <div className="space-y-2">
                    {selectedSession.tasks.map(t => (
                      <div key={t.id} className="p-5 rounded-[24px] bg-zinc-900/60 border border-white/5 flex items-center gap-4">
                        <div className={clsx(
                          "w-5 h-5 rounded-full border-2",
                          t.completed ? "bg-emerald-500 border-emerald-500" : "border-white/5"
                        )} />
                        <p className={clsx("text-sm font-bold uppercase italic", t.completed && "text-zinc-600 line-through")}>
                          {t.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Nueva Sesión Button (si no hay sesiones) */}
      {!selectedSession && sessions.length === 0 && (
        <div className="absolute bottom-10 inset-x-0 px-10 z-30">
          <button 
            onClick={() => navigate(`/live/${classId}`)}
            className="w-full h-16 bg-white text-black rounded-full font-black uppercase italic tracking-tighter flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
          >
            <span>Iniciar Primera Clase</span>
            <Plus size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
