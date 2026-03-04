import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Brain, History, Radio, ChevronRight, Calendar, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { CLASSES } from "../data/mock";

interface ClassSession {
  id: string;
  date: string;
  summary: string;
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
      {/* Header Inteligente */}
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 text-left">Materia</p>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{classInfo.name}</h1>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(`/live/${classId}`)}
          className="h-11 px-5 rounded-full bg-white text-black flex items-center gap-2 shadow-xl font-black uppercase italic tracking-tighter text-[12px]"
        >
          <Radio size={18} />
          <span>Nueva Sesión</span>
        </motion.button>
      </header>

      {/* Main Content - Jerarquía Inteligente */}
      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] py-8 max-w-2xl mx-auto w-full space-y-6">
        
        {/* Botón Resumen General - Acción Principal por Materia */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowGeneralSummary(true)}
          className="w-full bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 flex items-center justify-between text-left group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-white/5 group-active:bg-white/10 transition-colors" />
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              <Brain size={28} className="text-white/60" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase italic tracking-tight text-white leading-tight">Resumen General</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5 leading-relaxed">Síntesis inteligente de toda la materia</p>
            </div>
          </div>
          <ChevronRight size={24} className="text-zinc-800 group-active:text-white transition-colors" />
        </motion.button>

        {/* Botón Historial de Sesiones - Organización Temporal */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowHistory(true)}
          className="w-full bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 flex items-center justify-between text-left group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-white/5 group-active:bg-white/10 transition-colors" />
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              <History size={28} className="text-white/60" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase italic tracking-tight text-white leading-tight">Historial de Sesiones</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5 leading-relaxed">{sessions.length} clases grabadas hasta hoy</p>
            </div>
          </div>
          <ChevronRight size={24} className="text-zinc-800 group-active:text-white transition-colors" />
        </motion.button>

        {/* Sesiones Recientes (Acceso rápido) */}
        {sessions.length > 0 && (
          <section className="pt-4 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 ml-4">Recientes</h4>
            <div className="space-y-2">
              {sessions.slice(0, 2).map((s) => (
                <motion.button
                  key={s.id}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-zinc-900/20 border border-white/5 rounded-[24px] p-5 flex items-center justify-between text-left active:bg-zinc-900/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                      <Calendar size={16} className="text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{s.date}</p>
                      <p className="text-sm font-black uppercase italic tracking-tight text-zinc-300">{s.topic || "Sesión Grabada"}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-zinc-800" />
                </motion.button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modales Brutalistas (Sin ruido visual) */}
      <AnimatePresence>
        {showGeneralSummary && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">{classInfo.name}</p>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Resumen Global</h2>
                </div>
                <button onClick={() => setShowGeneralSummary(false)} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"><Plus size={28} className="rotate-45 text-white/60" /></button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
                <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-white/5" />
                  <p className="text-2xl font-bold leading-tight text-white/90 italic tracking-tight">
                    {sessions.length > 0 
                      ? `Consolidado inteligente de ${classInfo.name}. Se han identificado patrones clave en las ${sessions.length} sesiones analizadas, destacando temas fundamentales y fechas críticas para tu progreso académico.`
                      : "No hay sesiones suficientes para generar un resumen global."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showHistory && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">{classInfo.name}</p>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Historial</h2>
                </div>
                <button onClick={() => setShowHistory(false)} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"><Plus size={28} className="rotate-45 text-white/60" /></button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-10">
                {sessions.map((s) => (
                  <div key={s.id} className="w-full bg-zinc-900/40 border border-white/5 rounded-[28px] p-6 flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{s.date}</p>
                        <p className="text-lg font-black uppercase italic tracking-tight text-white">{s.topic || "Sesión de Clase"}</p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed italic">{s.summary}</p>
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
