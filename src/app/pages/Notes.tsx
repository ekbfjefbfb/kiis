import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { 
  ArrowLeft, Search, Plus, ChevronRight, FileText, Calendar, 
  Trash2, Filter, Layout, Sparkles, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { notesService, BackendNote } from "../../services/notes.service";
import AddClassModal from "../components/AddClassModal";

export default function NotesPage() {
  const navigate = useNavigate();
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
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans selection:bg-white/30 overflow-x-hidden flex flex-col">
      {/* Header Brutalista y Adaptativo */}
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Archivo</p>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Mis Notas</h1>
          </div>
        </div>
        <button 
          onClick={() => setIsAddingClass(true)}
          className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center active:scale-90 transition-transform shadow-xl"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Search Area - Ruido Cero */}
      <div className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-6">
        <div className="relative group max-w-2xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar en el historial_"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/40 border border-white/5 rounded-[24px] pl-14 pr-6 py-5 text-lg font-bold placeholder:text-zinc-800 focus:outline-none focus:border-white/10 transition-all"
          />
        </div>
      </div>

      {/* Main List */}
      <main className="flex-1 px-[env(safe-area-inset-left,1.25rem)] pr-[env(safe-area-inset-right,1.25rem)] py-8 max-w-2xl mx-auto w-full pb-32">
        {loading ? (
          <div className="py-20 text-center opacity-20 animate-pulse">
            <Clock size={48} className="mx-auto mb-4" strokeWidth={1} />
            <p className="text-[11px] font-black uppercase tracking-[0.5em]">Cargando archivo...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="py-20 text-center space-y-6 opacity-20">
            <FileText size={64} className="mx-auto" strokeWidth={1} />
            <p className="text-[11px] font-black uppercase tracking-[0.5em] leading-relaxed">
              {search ? "No hay coincidencias" : "El archivo está vacío"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Link key={note.id} to={`/note/${note.id}`} className="block group">
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="bg-zinc-900/40 border border-white/5 rounded-[28px] p-6 flex items-center justify-between transition-all active:bg-zinc-800"
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">
                        {new Date(note.created_at || Date.now()).toLocaleDateString()}
                      </p>
                      <p className="text-lg font-black uppercase italic tracking-tight leading-tight text-zinc-200 truncate">
                        {note.title || "Nota sin título"}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate mt-1 line-clamp-1 italic">
                        {note.summary || note.transcript || "Ver detalles"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-zinc-800 shrink-0" />
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <AddClassModal isOpen={isAddingClass} onClose={() => setIsAddingClass(false)} />
    </div>
  );
}
