import { useState, useEffect } from "react";
import { Search, Mic, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { Link } from "react-router";
import { notesService } from "../../services/notes.service";
import { Note } from "../../services/database.service";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    await notesService.loadNotes();
    setNotes(notesService.getNotes());
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || note.category === filterType;
    return matchesSearch && matchesFilter;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "importante": return "⭐";
      case "resumen": return "📝";
      case "tarea": return "✏️";
      default: return "📄";
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "importante": return "bg-red-50 text-red-700 border-red-200";
      case "resumen": return "bg-blue-50 text-blue-700 border-blue-200";
      case "tarea": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
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
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          {[
            { id: "all", label: "Todas", icon: "📚" },
            { id: "importante", label: "Importantes", icon: "⭐" },
            { id: "resumen", label: "Resúmenes", icon: "📝" },
            { id: "tarea", label: "Tareas", icon: "✏️" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all flex-shrink-0 text-xs font-medium min-h-[32px]",
                filterType === f.id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              <span className="text-[11px]">{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
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
              {searchQuery ? "Prueba otra búsqueda" : "Empieza a grabar para crear notas"}
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
                        <span
                          className={clsx(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium border capitalize",
                            getCategoryColor(note.category)
                          )}
                        >
                          {getCategoryIcon(note.category)} {note.category}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {getTimeAgo(note.createdAt)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {note.className}
                      </h4>
                    </div>
                    <ChevronRight className="text-gray-300 flex-shrink-0 ml-2" size={16} />
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-1.5">
                    {note.content}
                  </p>

                  {note.hasAudio && (
                    <div className="flex items-center gap-1 text-[10px] text-indigo-600">
                      <Mic size={10} />
                      <span>Grabación de audio</span>
                    </div>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
