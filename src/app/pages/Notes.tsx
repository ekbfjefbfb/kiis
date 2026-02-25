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
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-100/60 px-5 pt-5 pb-3 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Mis Notas</h1>

        {/* Search */}
        <Link to="/search" className="relative mb-3 block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <div className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-400 text-left transition-all">
            Buscar con IA en toda la web...
          </div>
        </Link>
      </div>

      {/* Notes List */}
      <div className="px-5 pt-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Mic size={24} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No hay notas</h3>
            <p className="text-sm text-gray-400">
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
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-gray-400">
                          {getTimeAgo(note.created_at)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {note.title || "Clase sin título"}
                      </h4>
                    </div>
                    <ChevronRight className="text-gray-300 flex-shrink-0 ml-2" size={16} />
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-1.5">
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
