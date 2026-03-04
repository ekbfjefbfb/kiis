import { useState, useEffect } from "react";
import {
  Calendar, ChevronRight, Plus, BookOpen, Brain, Radio, Zap, User, Clock, FileText
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { CLASSES } from "../data/mock";
import { notesService, BackendNote } from "../../services/notes.service";
import AddClassModal from "../components/AddClassModal";

export default function Dashboard() {
  const [recentNotes, setRecentNotes] = useState<BackendNote[]>([]);
  const [isAddingClass, setIsAddingClass] = useState(false);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long", month: "long", day: "numeric",
  });

  useEffect(() => {
    loadRecentNotes();
  }, []);

  const loadRecentNotes = async () => {
    try {
       const backendNotes = await notesService.listNotes(3, 0);
       setRecentNotes(backendNotes);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white pb-24 font-sans selection:bg-white/30 overflow-x-hidden flex flex-col relative">
      {/* Header Adaptativo - Agenda Style */}
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 text-left">Hoy</p>
          <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">{today}</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/calendar" className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <Calendar size={20} className="text-zinc-400" />
          </Link>
          <Link to="/profile" className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <User size={20} className="text-zinc-400" />
          </Link>
        </div>
      </header>

      {/* Contenido Principal con Spacing Inteligente */}
      <main className="flex-1 px-[env(safe-area-inset-left,1.25rem)] pr-[env(safe-area-inset-right,1.25rem)] space-y-10 pt-6 max-w-2xl mx-auto w-full pb-[max(env(safe-area-inset-bottom,2rem),2rem)]">
        
        {/* Acciones de Agenda - El centro del sistema */}
        <section className="grid grid-cols-1 gap-3">
          <Link to="/quick-note" className="block group">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 flex items-center justify-between transition-all active:bg-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20" />
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Zap size={24} className="text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black uppercase italic leading-none tracking-tight">Nota rápida</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5 leading-relaxed">Captura una idea en 10s</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-zinc-800" />
            </motion.div>
          </Link>

          <Link to="/live" className="block group">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 flex items-center justify-between transition-all active:bg-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/20" />
              <div className="flex items-center gap-5 text-left">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Radio size={24} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-lg font-black uppercase italic leading-none tracking-tight">Clase en vivo</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5 leading-relaxed">Grabación + Resumen IA</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-zinc-800" />
            </motion.div>
          </Link>

          <Link to="/chat" className="block group">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 flex items-center justify-between transition-all active:bg-zinc-800 text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-white/5" />
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <Brain size={24} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-lg font-black uppercase italic leading-none text-white tracking-tight">Asistente IA</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5 leading-relaxed">SST + TTS Unificado</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-zinc-800" />
            </motion.div>
          </Link>
        </section>

        {/* Notas Recientes - Archivo dinámico */}
        <section className="space-y-5">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3 text-zinc-500">
              <FileText size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] italic">Recientes</h3>
            </div>
            <Link to="/notes" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 active:text-white transition-colors">Ver todo</Link>
          </div>
          {recentNotes.length === 0 ? (
            <div className="bg-zinc-900/20 border border-dashed border-white/5 rounded-[32px] p-10 text-center space-y-4 opacity-30">
              <Clock size={40} className="mx-auto" strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin actividad reciente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.slice(0, 2).map((n) => (
                <Link key={n.id} to={`/note/${n.id}`} className="block group">
                  <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/40 border border-white/5 rounded-[28px] p-5 flex items-center justify-between transition-all active:bg-zinc-800 text-left">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-[14px] font-bold uppercase truncate tracking-tight text-zinc-200">{n.title || "Nota"}</p>
                      <p className="text-[10px] text-zinc-600 font-medium truncate mt-1.5 italic">{n.summary || n.transcript || "Ver detalles"}</p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-800 shrink-0" />
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Materias - Gestión de largo plazo */}
        <section className="space-y-5">
          <div className="flex justify-between items-center px-2 text-left">
            <div className="flex items-center gap-3 text-zinc-500">
              <BookOpen size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] italic">Materias</h3>
            </div>
            <button onClick={() => setIsAddingClass(true)} className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 active:scale-90 active:bg-white/5 transition-all shadow-lg">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {CLASSES.map((cls) => (
              <Link key={cls.id} to={`/class/${cls.id}`} className="block group">
                <motion.div whileTap={{ scale: 0.99 }} className="bg-zinc-900/40 border border-white/5 rounded-[28px] p-6 flex items-center gap-5 active:bg-zinc-800 transition-all text-left relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                    <BookOpen size={20} className="text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black uppercase italic tracking-tight truncate leading-none mb-1.5 text-zinc-200">{cls.name}</p>
                    <p className="text-[10px] text-zinc-600 font-black uppercase truncate tracking-[0.15em]">{cls.professor}</p>
                  </div>
                  <ChevronRight size={20} className="text-zinc-800 shrink-0" />
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <AddClassModal 
        isOpen={isAddingClass} 
        onClose={() => setIsAddingClass(false)} 
      />
    </div>
  );
}
