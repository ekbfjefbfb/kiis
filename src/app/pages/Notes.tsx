import { useState, useEffect } from "react";
import { Search, Filter, Mic, Play, ChevronRight } from "lucide-react";
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

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.className.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === "all" || note.category === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "importante": return "⭐";
      case "resumen": return "📝";
      case "tarea": return "✏️";
      default: return "📄";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "importante": return "bg-red-50 text-red-700 border-red-200";
      case "resumen": return "bg-blue-50 text-blue-700 border-blue-200";
      case "tarea": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Notes</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {[
            { id: "all", label: "All", icon: "📚" },
            { id: "importante", label: "Important", icon: "⭐" },
            { id: "resumen", label: "Summary", icon: "📝" },
            { id: "tarea", label: "Tasks", icon: "✏️" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all flex-shrink-0 text-sm font-medium",
                filterType === filter.id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div className="p-6">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? "Try a different search" : "Start recording to create notes"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note, index) => (
              <Link
                key={note.id}
                to={`/note/${note.id}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx(
                          "text-xs px-2 py-1 rounded-full font-medium border",
                          getCategoryColor(note.category)
                        )}>
                          {getCategoryIcon(note.category)} {note.category}
                        </span>
                        <span className="text-xs text-gray-500">{getTimeAgo(note.createdAt)}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{note.className}</h4>
                    </div>
                    <ChevronRight className="text-gray-300 flex-shrink-0" size={20} />
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{note.content}</p>
                  
                  {note.hasAudio && (
                    <div className="flex items-center gap-1 text-xs text-indigo-600">
                      <Mic size={12} />
                      <span>Audio recording</span>
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
