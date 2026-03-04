import { useState, useEffect } from "react";
import {
  Calendar, ChevronRight, Plus, X, BookOpen, Brain, Radio, Zap, User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
    <div className="min-h-[100dvh] bg-black text-white pb-24 font-sans selection:bg-white/30 overflow-x-hidden">
      {/* Header Unificado - Agenda Style */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20">
        <div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1 text-left">Hoy</p>
          <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">{today}</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/calendar" className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <Calendar size={18} className="text-white/70" />
          </Link>
          <Link to="/profile" className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <User size={18} className="text-white/70" />
          </Link>
        </div>
      </div>

      <div className="px-5 space-y-6 pt-6">
        {/* Acciones de Agenda */}
        <div className="grid grid-cols-1 gap-3">
          <Link to="/quick-note" className="block group">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/50 border border-white/5 rounded-[24px] p-5 flex items-center justify-between transition-all active:bg-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-left">
                  <Zap size={20} className="text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black uppercase italic leading-none">Nota rápida</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Graba 10s. Se guarda.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/10" />
            </motion.div>
          </Link>

          <Link to="/live" className="block group">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/50 border border-white/5 rounded-[24px] p-5 flex items-center justify-between transition-all active:bg-zinc-800">
              <div className="flex items-center gap-4 text-left">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Radio size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase italic leading-none">Clase en vivo</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Resumen + Agenda auto.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/10" />
            </motion.div>
          </Link>

          <Link to="/chat" className="block group">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/50 border border-white/5 rounded-[24px] p-5 flex items-center justify-between transition-all active:bg-zinc-800 text-left">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Brain size={20} className="text-white/70" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase italic leading-none text-white">Asistente IA</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">SST + TTS Unificado.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/10" />
            </motion.div>
          </Link>
        </div>

        {/* Notas Recientes */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">Notas recientes</h3>
            <Link to="/notes" className="text-[10px] font-black uppercase tracking-widest text-white/40 active:text-white transition-colors">Ver todo</Link>
          </div>
          {recentNotes.length === 0 ? (
            <Link to="/quick-note" className="block bg-zinc-900/30 border border-dashed border-white/10 rounded-[20px] p-6 text-center active:bg-zinc-900/50 transition-colors">
              <p className="text-xs font-black uppercase italic tracking-widest text-white/30">Graba tu primera nota</p>
            </Link>
          ) : (
            <div className="space-y-2">
              {recentNotes.slice(0, 2).map((n) => (
                <Link key={n.id} to={`/note/${n.id}`} className="block group">
                  <div className="bg-zinc-900/40 border border-white/5 rounded-[20px] p-4 flex items-center justify-between transition-all active:bg-zinc-800 text-left">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-[13px] font-bold uppercase truncate tracking-tight">{n.title || "Nota"}</p>
                      <p className="text-[10px] text-white/30 font-medium truncate mt-0.5 italic">{n.summary || n.transcript || "Sin contenido"}</p>
                    </div>
                    <ChevronRight size={12} className="text-white/10" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Materias */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1 text-left">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">Mis materias</h3>
            <button onClick={() => setIsAddingClass(true)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 active:scale-90 active:bg-white/10 transition-all">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {CLASSES.map((cls) => (
              <Link key={cls.id} to={`/class/${cls.id}`} className="block group">
                <motion.div whileTap={{ scale: 0.99 }} className="bg-zinc-900/40 border border-white/5 rounded-[20px] p-4 flex items-center gap-4 active:bg-zinc-800 transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <BookOpen size={16} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black uppercase italic tracking-tighter truncate leading-none mb-1">{cls.name}</p>
                    <p className="text-[9px] text-white/20 font-black uppercase truncate tracking-widest">{cls.professor}</p>
                  </div>
                  <ChevronRight size={12} className="text-white/10" />
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <AddClassModal 
        isOpen={isAddingClass} 
        onClose={() => setIsAddingClass(false)} 
      />
    </div>
  );
}
