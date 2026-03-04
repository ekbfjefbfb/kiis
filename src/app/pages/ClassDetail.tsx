import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, Calendar, ChevronRight, Brain, ListTodo, History, Radio, Layout, BookOpen, Clock, MapPin } from "lucide-react";
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
  const [showHistory, setShowHistory] = useState(false);
  const [showGeneralSummary, setShowGeneralSummary] = useState(false);

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
      {/* Header Adaptativo */}
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

      {/* Content Area - Minimalismo Extremo */}
      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] py-8 max-w-2xl mx-auto w-full space-y-12">
        
        {/* Info Materia */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 ml-2 text-zinc-500">
            <Layout size={16} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Detalles</h3>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-11 h-11 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-zinc-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Profesor</p>
                <p className="text-lg font-bold uppercase italic tracking-tight">{classInfo.professor}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Aula</p>
                  <p className="text-sm font-bold uppercase italic">{classInfo.room || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Horario</p>
                  <p className="text-sm font-bold uppercase italic">{classInfo.time || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Botones de Acción Claros y Minimalistas */}
        <section className="grid grid-cols-1 gap-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGeneralSummary(true)}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-[28px] p-6 flex items-center justify-between transition-all active:bg-zinc-800"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <Brain size={22} className="text-white/60" />
              </div>
              <div className="text-left">
                <p className="text-[15px] font-black uppercase italic tracking-tight text-white">Resumen General</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Visión global de la materia</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-zinc-800" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHistory(true)}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-[28px] p-6 flex items-center justify-between transition-all active:bg-zinc-800"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <History size={22} className="text-white/60" />
              </div>
              <div className="text-left">
                <p className="text-[15px] font-black uppercase italic tracking-tight text-white">Historial de Sesiones</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{sessions.length} clases grabadas</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-zinc-800" />
          </motion.button>
        </section>
      </main>

      {/* Modal Historial de Sesiones */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">{classInfo.name}</p>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Sesiones</h2>
                </div>
                <button onClick={() => setShowHistory(false)} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                  <Plus size={28} className="rotate-45 text-white/60" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-10">
                {sessions.length === 0 ? (
                  <div className="py-20 text-center opacity-20"><History size={64} className="mx-auto mb-4" strokeWidth={1} /><p className="text-[11px] font-black uppercase tracking-[0.5em]">Sin historial</p></div>
                ) : (
                  sessions.map((s) => (
                    <div key={s.id} className="w-full bg-zinc-900/40 border border-white/5 rounded-[28px] p-6 flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{s.date}</p>
                          <p className="text-lg font-black uppercase italic tracking-tight text-white">{s.topic || "Clase Grabada"}</p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed italic">{s.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Resumen General */}
      <AnimatePresence>
        {showGeneralSummary && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">{classInfo.name}</p>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Resumen Global</h2>
                </div>
                <button onClick={() => setShowGeneralSummary(false)} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                  <Plus size={28} className="rotate-45 text-white/60" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="bg-zinc-900/40 border border-white/5 rounded-[36px] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-white/5" />
                  <p className="text-2xl font-bold leading-tight text-white/90 italic tracking-tight">
                    {sessions.length > 0 
                      ? "Este es el consolidado inteligente de toda la materia hasta hoy. Se analizan los temas recurrentes y puntos clave de cada sesión para darte una visión total de tu progreso en " + classInfo.name + "."
                      : "Aún no hay suficientes datos para generar un resumen global. Inicia tu primera sesión para comenzar el análisis."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
