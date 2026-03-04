import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Brain, History, Radio, ChevronRight, Calendar, Plus, Layout, BookOpen, Clock, MapPin } from "lucide-react";
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
      {/* Header Inteligente y Adaptativo */}
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-lg">
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
          className="h-11 px-5 rounded-full bg-white text-black flex items-center gap-2 shadow-xl font-black uppercase italic tracking-tighter text-[12px] active:opacity-90 transition-all"
        >
          <Radio size={18} />
          <span>Nueva Sesión</span>
        </motion.button>
      </header>

      {/* Main Content - Jerarquía Visual Inteligente y Sin Ruido */}
      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] py-8 max-w-2xl mx-auto w-full space-y-10 pb-[max(env(safe-area-inset-bottom,2rem),4rem)]">
        
        {/* Info Materia Compacta */}
        <section className="space-y-5">
          <div className="flex items-center gap-3 ml-2 text-zinc-500">
            <Layout size={16} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Detalles_Materia</h3>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-[36px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                <BookOpen size={24} className="text-zinc-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Profesor Titular</p>
                <p className="text-xl font-bold uppercase italic tracking-tight truncate">{classInfo.professor}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Aula</p>
                  <p className="text-[15px] font-bold uppercase italic text-zinc-200">{classInfo.room || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Horario</p>
                  <p className="text-[15px] font-bold uppercase italic text-zinc-200">{classInfo.time || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Botón Resumen General - Acción Principal de IA */}
        <section className="space-y-5">
          <div className="flex items-center gap-3 ml-2 text-zinc-500">
            <Brain size={18} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Análisis Global</h3>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGeneralSummary(true)}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-[40px] p-10 flex items-center justify-between text-left group relative overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.02)]"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-white/10 group-active:bg-white/20 transition-colors" />
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                <Brain size={32} className="text-white/80" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white leading-none">Resumen General</h3>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-2.5 leading-relaxed">Síntesis inteligente de toda la materia</p>
              </div>
            </div>
            <ChevronRight size={28} className="text-zinc-800 group-active:text-white transition-colors" />
          </motion.button>
        </section>

        {/* Botón Historial de Sesiones - Organización Temporal */}
        <section className="space-y-5">
          <div className="flex items-center gap-3 ml-2 text-zinc-500">
            <History size={18} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Archivo_Sesiones</h3>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHistory(true)}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-[40px] p-10 flex items-center justify-between text-left group relative overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.02)]"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-white/10 group-active:bg-white/20 transition-colors" />
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                <History size={32} className="text-white/80" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white leading-none">Historial Completo</h3>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-2.5 leading-relaxed">{sessions.length} clases grabadas hasta hoy</p>
              </div>
            </div>
            <ChevronRight size={28} className="text-zinc-800 group-active:text-white transition-colors" />
          </motion.button>
        </section>

        {/* Sesiones Recientes (Acceso rápido sin ruido) */}
        {sessions.length > 0 && (
          <section className="pt-4 space-y-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-800 ml-4">Últimas_Clases</h4>
            <div className="space-y-3">
              {sessions.slice(0, 3).map((s) => (
                <motion.button
                  key={s.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedClassSession(s)}
                  className="w-full bg-zinc-900/30 border border-white/5 rounded-[28px] p-6 flex items-center justify-between text-left active:bg-zinc-900/50"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                      <Calendar size={18} className="text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{s.date}</p>
                      <p className="text-lg font-black uppercase italic tracking-tight text-zinc-300">{s.topic || "Sesión de Clase"}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-800" />
                </motion.button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modal Resumen Global - Inmersivo */}
      <AnimatePresence>
        {showGeneralSummary && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]"
          >
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">{classInfo.name}</p>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Resumen Global</h2>
                </div>
                <button onClick={() => setShowGeneralSummary(false)} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-xl"><Plus size={28} className="rotate-45 text-white/60" /></button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
                <div className="bg-zinc-900/40 border border-white/5 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-white/5" />
                  <p className="text-2xl font-bold leading-relaxed text-white/90 italic tracking-tight">
                    {sessions.length > 0 
                      ? `Este es el consolidado inteligente de tu progreso en ${classInfo.name}. Se han analizado profundamente las ${sessions.length} sesiones registradas, extrayendo los conceptos fundamentales, las fechas críticas de entregas y los temas recurrentes para asegurar tu dominio de la materia.`
                      : "No hay sesiones grabadas suficientes para generar un análisis global. Inicia una nueva sesión para comenzar."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal Historial Completo - Deslizamiento Lateral */}
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: "100%" }} 
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]"
          >
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">{classInfo.name}</p>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Historial</h2>
                </div>
                <button onClick={() => setShowHistory(false)} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-xl"><Plus size={28} className="rotate-45 text-white/60" /></button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-10">
                {sessions.length === 0 ? (
                  <div className="py-20 text-center opacity-20"><History size={64} className="mx-auto mb-4" strokeWidth={1} /><p className="text-[11px] font-black uppercase tracking-[0.5em]">Sin historial</p></div>
                ) : (
                  sessions.map((s) => (
                    <motion.div key={s.id} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedClassSession(s); setShowHistory(false); }} className="w-full bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 flex flex-col space-y-5 active:bg-zinc-800 transition-all cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">{s.date}</p>
                          <p className="text-xl font-black uppercase italic tracking-tight text-white leading-none">{s.topic || "Sesión de Clase"}</p>
                        </div>
                        <ChevronRight size={20} className="text-zinc-800" />
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed italic line-clamp-3">{s.summary}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal Detalle Sesión Específica */}
        {selectedSession && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }} 
            className="fixed inset-0 z-[60] bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]"
          >
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">{selectedSession.date}</p>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Resumen Sesión</h2>
                </div>
                <button onClick={() => setSelectedClassSession(null)} className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-xl"><Plus size={28} className="rotate-45 text-white/60" /></button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-12 pb-10">
                <section className="space-y-6">
                  <div className="flex items-center gap-3 text-white/30 ml-2"><Brain size={18} /><h3 className="text-[12px] font-black uppercase tracking-[0.5em]">Síntesis IA</h3></div>
                  <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-white/5" />
                    <p className="text-2xl font-bold leading-relaxed text-white/90 italic tracking-tight">{selectedSession.summary}</p>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
