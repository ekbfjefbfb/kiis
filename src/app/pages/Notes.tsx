import { useState, useEffect } from "react";
import { Search, Mic, ChevronRight, ArrowUpDown, Filter } from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { Link } from "react-router";
import { notesService, BackendNote } from "../../services/notes.service";

type SortOption = "recent" | "oldest" | "title";
type FilterOption = "all" | "today" | "week" | "month";

export default function NotesPage() {
  const [notes, setNotes] = useState<BackendNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
       const backendNotes = await notesService.listNotes(100, 0);
       setNotes(backendNotes);
    } catch(e) {
       console.error("Error loading notes", e);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const titleMatch = (note.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = (note.summary || note.transcript || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!titleMatch && !contentMatch) return false;
    
    // Filtro por fecha
    if (filterBy === "all") return true;
    const noteDate = new Date(note.created_at || Date.now());
    const now = new Date();
    if (filterBy === "today") {
      return noteDate.toDateString() === now.toDateString();
    }
    if (filterBy === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return noteDate >= weekAgo;
    }
    if (filterBy === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return noteDate >= monthAgo;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    }
    if (sortBy === "title") {
      return (a.title || "").localeCompare(b.title || "");
    }
    return 0;
  });

  const getTimeAgo = (isoDate: string | null) => {
    if (!isoDate) return "Reciente";
    const diff = Date.now() - new Date(isoDate).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `Hace ${d}d`;
    if (h > 0) return `Hace ${h}h`;
    return "Justo ahora";
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-4 transition-colors duration-300">
      {/* Header */}
      <div className="bg-card/90 backdrop-blur-xl border-b border-border px-5 pt-5 pb-3 sticky top-0 z-10">
        <h1 className="text-xl font-semibold tracking-tight text-foreground mb-3">Mis Notas</h1>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar notas..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
          {/* Sort */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg px-2 py-1.5 flex-shrink-0">
            <ArrowUpDown size={14} className="text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs text-foreground focus:outline-none"
            >
              <option value="recent">Más reciente</option>
              <option value="oldest">Más antiguo</option>
              <option value="title">A-Z</option>
            </select>
          </div>

          {/* Filter buttons */}
          {[
            { value: "all", label: "Todo" },
            { value: "today", label: "Hoy" },
            { value: "week", label: "Semana" },
            { value: "month", label: "Mes" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterBy(opt.value as FilterOption)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-colors",
                filterBy === opt.value
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div className="px-5 pt-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-3 border border-border">
              <Mic size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No hay notas</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Prueba otra búsqueda" : "Empieza a grabar para crear notas geniales"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotes.map((note, i) => (
              <Link key={note.id} to={`/note/${note.id}`} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card p-4 rounded-2xl border border-border shadow-sm hover:border-foreground/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                          {getTimeAgo(note.created_at)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {note.title || "Clase sin título"}
                      </h4>
                    </div>
                    <ChevronRight className="text-muted-foreground flex-shrink-0 ml-2" size={16} />
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                    {note.summary || note.transcript || "Procesando contenido..."}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
