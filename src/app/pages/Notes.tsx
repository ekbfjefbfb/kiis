import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { 
  ArrowLeft, Search, Plus, ChevronRight, FileText, Clock, Sun, Moon
} from "lucide-react";
import { motion } from "motion/react";
import { notesService, BackendNote } from "../../services/notes.service";
import AddClassModal from "../components/AddClassModal";
import { useDarkMode } from "../../hooks/useDarkMode";

export default function NotesPage() {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [notes, setNotes] = useState<BackendNote[]>([]);
  const [search, setSearch] = useState("");
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await notesService.listNotes(50, 0);
      setNotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(n => 
    (n.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (n.summary?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="h-[100dvh] w-full bg-background text-foreground font-sans selection:bg-primary/30 overflow-hidden flex flex-col relative transition-colors duration-300">
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.3em] mb-1 text-left">Archivo_</p>
            <h1 className="text-xl font-bold uppercase italic tracking-tighter leading-none text-foreground">Mis Notas</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform"
          >
            {isDark ? <Sun size={18} className="text-muted-foreground" /> : <Moon size={18} className="text-muted-foreground" />}
          </button>
          <button 
            onClick={() => setIsAddingClass(true)}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform shadow-lg"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      <div className="px-6 py-6 shrink-0">
        <div className="relative group max-w-2xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text"
            placeholder="BUSCAR_EN_ARCHIVO_"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/40 border border-border rounded-[28px] pl-14 pr-6 py-5 text-sm font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/10 transition-all italic"
          />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.25rem)] pr-[env(safe-area-inset-right,1.25rem)] pb-32 max-w-2xl mx-auto w-full space-y-3">
        {loading ? (
          <div className="py-20 text-center opacity-20">
            <Clock size={32} className="mx-auto mb-4 animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Cargando_</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="py-20 text-center opacity-10">
            <FileText size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Vacio_</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Link key={note.id} to={`/note/${note.id}`} className="block group">
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="bg-secondary/40 border border-border rounded-[28px] p-5 flex items-center justify-between transition-all active:bg-secondary"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      {new Date(note.created_at || Date.now()).toLocaleDateString()}
                    </p>
                    <p className="text-base font-bold uppercase italic tracking-tight text-foreground truncate leading-none mb-1.5">
                      {note.title || "Nota"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate italic line-clamp-1">
                      {note.summary || note.transcript || "Detalles_"}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </motion.div>
            </Link>
          ))
        )}
      </main>

      <AddClassModal isOpen={isAddingClass} onClose={() => setIsAddingClass(false)} />
    </div>
  );
}
