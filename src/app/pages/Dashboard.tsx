import { useState, useEffect } from "react";
import {
  Calendar, ChevronRight, Plus, BookOpen, Brain, Radio, Zap, User
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
    <div className="min-h-[100dvh] w-full bg-black text-white pb-24 font-sans selection:bg-white/30 overflow-x-hidden flex flex-col">
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20">
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

      <main className="flex-1 px-[env(safe-area-inset-left,1.25rem)] pr-[env(safe-area-inset-right,1.25rem)] space-y-8 pt-6 max-w-2xl mx-auto w-full">
        <section className="grid grid-cols-1 gap-3">
          <Link to="/quick-note" className="block group">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/50 border border-white/5 rounded-[24px] p-5 flex items-center justify-between transition-all active:bg-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Zap size={22} className="text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black uppercase italic leading-none">Nota rápida</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5">Graba 10s. Se guarda.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-800" />
            </motion.div>
          </Link>

          <Link to="/live" className="block group">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/50 border border-white/5 rounded-[24px] p-5 flex items-center justify-between transition-all active:bg-zinc-800">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Radio size={22} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase italic leading-none">Clase en vivo</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5">Resumen + Agenda auto.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-800" />
            </motion.div>
          </Link>

          <Link to="/chat" className="block group">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/50 border border-white/5 rounded-[24px] p-5 flex items-center justify-between transition-all active:bg-zinc-800 text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                  <Brain size={22} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase italic leading-none text-white">Asistente IA</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5">SST + TTS Unificado.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-800" />
            </motion.div>
          </Link>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 italic">Notas recientes</h3>
            <Link to="/notes" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 active:text-white transition-colors">Ver todo</Link>
          </div>
          {recentNotes.length === 0 ? (
            <div className="bg-zinc-900/30 border border-dashed border-white/10 rounded-[24px] p-8 text-center active:bg-zinc-900/50 transition-colors">
              <p className="text-xs font-black uppercase italic tracking-widest text-zinc-600">Graba tu primera nota</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentNotes.slice(0, 2).map((n) => (
                <Link key={n.id} to={`/note/${n.id}`} className="block group">
                  <div className="bg-zinc-900/40 border border-white/5 rounded-[22px] p-4 flex items-center justify-between transition-all active:bg-zinc-800 text-left">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-[13px] font-bold uppercase truncate tracking-tight text-zinc-200">{n.title || "Nota"}</p>
                      <p className="text-[10px] text-zinc-600 font-medium truncate mt-1 italic">{n.summary || n.transcript || "Sin contenido"}</p>
                    </div>
                    <ChevronRight size={14} className="text-zinc-800 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-4 px-1 text-left">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 italic">Mis materias</h3>
            <button onClick={() => setIsAddingClass(true)} className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 active:scale-90 active:bg-white/5 transition-all">
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-2.5">
            {CLASSES.map((cls) => (
              <Link key={cls.id} to={`/class/${cls.id}`} className="block group">
                <motion.div whileTap={{ scale: 0.99 }} className="bg-zinc-900/40 border border-white/5 rounded-[22px] p-4 flex items-center gap-4 active:bg-zinc-800 transition-all text-left">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black uppercase italic tracking-tighter truncate leading-none mb-1.5 text-zinc-200">{cls.name}</p>
                    <p className="text-[9px] text-zinc-600 font-black uppercase truncate tracking-[0.15em]">{cls.professor}</p>
                  </div>
                  <ChevronRight size={14} className="text-zinc-800 shrink-0" />
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
