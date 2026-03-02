import { useState, useEffect } from "react";
import { Search, Mic, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { Link } from "react-router";
import { notesService, BackendNote } from "../../services/notes.service";

export default function NotesPage() {
  const [notes, setNotes] = useState<BackendNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
    return titleMatch || contentMatch;
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
        <Link to="/search" className="relative mb-3 block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <div className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-sm text-muted-foreground text-left transition-all">
            Buscar...
          </div>
        </Link>
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
