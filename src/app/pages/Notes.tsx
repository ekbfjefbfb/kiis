import { useState, useEffect } from "react";
import { Search, ChevronRight, ArrowUpDown, ArrowLeft, Loader2, FileText, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { useNavigate, Link } from "react-router";
import { notesService, BackendNote } from "../../services/notes.service";
import AddClassModal from "../components/AddClassModal";

type SortOption = "recent" | "oldest" | "title";

export default function NotesPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<BackendNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [loading, setLoading] = useState(true);
  const [isAddingClass, setIsAddingClass] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
       const backendNotes = await notesService.listNotes(100, 0);
       setNotes(backendNotes);
    } catch(e) {
       console.error("Error loading notes", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const titleMatch = (note.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = (note.summary || note.transcript || "").toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || contentMatch;
  }).sort((a, b) => {
    if (sortBy === "recent") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    if (sortBy === "oldest") return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
    return 0;
  });

  const getTimeAgo = (isoDate: string | null) => {
    if (!isoDate) return "Reciente";
    const diff = Date.now() - new Date(isoDate).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d`;
    if (h > 0) return `${h}h`;
    return "Ahora";
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-sans selection:bg-white/30">
      {/* Header Compacto */}
      <div className="px-6 pt-10 pb-6 flex items-center justify-between border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">Mis Notas</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingClass(true)}
            className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <BookOpen size={16} />
          </button>
          <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
            <ArrowUpDown size={12} className="text-white/30" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-white/70"
            >
              <option value="recent">Recientes</option>
              <option value="title">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR NOTAS..."
            className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-11 pr-4 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase text-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
              <X size={16} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-white/20" size={24} />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-zinc-900/40 border border-white/5 rounded-[24px] p-10 text-center">
            <FileText size={32} className="mx-auto text-white/10 mb-4" />
            <p className="text-[13px] font-black uppercase italic tracking-tight text-white/60">No hay notas</p>
            <Link to="/quick-note" className="inline-block mt-4 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/10 pb-1">Grabar algo ahora</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/note/${note.id}`} className="block group">
                  <div className="bg-zinc-900/40 border border-white/5 rounded-[20px] p-5 flex items-center justify-between transition-all active:bg-zinc-800">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                          {getTimeAgo(note.created_at)}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-black uppercase italic tracking-tight truncate leading-none text-white/90">
                        {note.title || "Nota sin título"}
                      </h4>
                      <p className="text-[11px] text-white/30 font-medium line-clamp-1 mt-2 leading-tight">
                        {note.summary || note.transcript || "Procesando contenido..."}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-white/10 group-active:text-white/30 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AddClassModal 
        isOpen={isAddingClass} 
        onClose={() => setIsAddingClass(false)} 
      />
    </div>
  );
}
