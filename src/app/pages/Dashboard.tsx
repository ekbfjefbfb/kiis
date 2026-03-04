import { useState, useEffect } from "react";
import {
  Calendar, ChevronRight, Plus, BookOpen, Brain, Radio, User, Clock, FileText, Moon, Sun
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { CLASSES } from "../data/mock";
import { notesService, BackendNote } from "../../services/notes.service";
import AddClassModal from "../components/AddClassModal";
import { useDarkMode } from "../../hooks/useDarkMode";

export default function Dashboard() {
  const [recentNotes, setRecentNotes] = useState<BackendNote[]>([]);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const { isDark, toggleDarkMode } = useDarkMode();

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
    <div className="h-[100dvh] w-full bg-background text-foreground font-sans selection:bg-primary/30 overflow-hidden flex flex-col relative transition-colors duration-300">
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.3em] mb-1.5 text-left">Hoy_</p>
          <h1 className="text-2xl font-bold uppercase italic tracking-tighter leading-none">{today}</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform"
          >
            {isDark ? <Sun size={18} className="text-muted-foreground" /> : <Moon size={18} className="text-muted-foreground" />}
          </button>
          <Link to="/calendar" className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform">
            <Calendar size={18} className="text-muted-foreground" />
          </Link>
          <Link to="/profile" className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform">
            <User size={18} className="text-muted-foreground" />
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.25rem)] pr-[env(safe-area-inset-right,1.25rem)] pt-8 max-w-2xl mx-auto w-full pb-[max(env(safe-area-inset-bottom,2rem),4rem)] space-y-12">
        
        <section className="grid grid-cols-1 gap-4">
          <Link to="/live" className="block group">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-secondary/40 border border-border rounded-[32px] p-6 flex items-center justify-between transition-all active:bg-secondary relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-active:bg-primary/20 transition-colors" />
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-border shadow-xl">
                  <Radio size={24} className="text-foreground/80" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold uppercase italic leading-none tracking-tight">Grabar_Ahora</p>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest mt-2 leading-relaxed">Captura IA instantánea</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted-foreground group-active:text-foreground transition-colors" />
            </motion.div>
          </Link>

          <Link to="/chat" className="block">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-secondary/20 border border-border rounded-[28px] p-5 flex items-center justify-between transition-all active:bg-secondary relative overflow-hidden group">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border shadow-inner">
                  <Brain size={20} className="text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold uppercase italic leading-none tracking-tight">Asistente_IA</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Consulta inteligente</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground group-active:text-foreground" />
            </motion.div>
          </Link>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center px-2 text-left">
            <div className="flex items-center gap-3 text-muted-foreground">
              <BookOpen size={16} />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] italic">Materias_</h3>
            </div>
            <button onClick={() => setIsAddingClass(true)} className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground active:scale-90 active:bg-secondary/50 transition-all shadow-lg">
              <Plus size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {CLASSES.map((cls) => (
              <Link key={cls.id} to={`/class/${cls.id}`} className="block group">
                <motion.div whileTap={{ scale: 0.99 }} className="bg-secondary/40 border border-border rounded-[32px] p-5 flex items-center gap-5 active:bg-secondary transition-all text-left relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/5 group-active:bg-primary/10 transition-colors" />
                  <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 shadow-inner">
                    <BookOpen size={18} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold uppercase italic tracking-tighter truncate leading-none mb-1">{cls.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase truncate tracking-[0.2em]">{cls.professor}</p>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground shrink-0" />
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3 text-muted-foreground">
              <FileText size={16} />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] italic">Recientes_</h3>
            </div>
            <Link to="/notes" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground active:text-foreground transition-colors">Ver todo</Link>
          </div>
          {recentNotes.length === 0 ? (
            <div className="bg-secondary/10 border border-dashed border-border rounded-[32px] p-10 text-center space-y-4 opacity-20">
              <Clock size={32} className="mx-auto" strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Sin actividad</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.slice(0, 2).map((n) => (
                <Link key={n.id} to={`/note/${n.id}`} className="block group">
                  <motion.div whileTap={{ scale: 0.98 }} className="bg-secondary/30 border border-border rounded-[24px] p-5 flex items-center justify-between transition-all active:bg-secondary text-left">
                    <div className="min-w-0 flex-1 pr-6">
                      <p className="text-[14px] font-bold uppercase italic truncate tracking-tight leading-none mb-2">{n.title || "Nota"}</p>
                      <p className="text-[11px] text-muted-foreground font-medium truncate italic tracking-tight">{n.summary || n.transcript || "Detalles de sesión"}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <AddClassModal 
        isOpen={isAddingClass} 
        onClose={() => setIsAddingClass(false)} 
      />
    </div>
  );
}
