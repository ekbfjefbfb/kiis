import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Trash2, Clock, Calendar, FileText, Zap, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { notesService, BackendNote } from "../../services/notes.service";

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<BackendNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadNote(id);
  }, [id]);

  const loadNote = async (noteId: string) => {
    setLoading(true);
    try {
      const data = await notesService.getNote(noteId);
      setNote(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !confirm("¿Eliminar esta nota?")) return;
    try {
      await notesService.deleteNote(note.id);
      navigate("/notes", { replace: true });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!note) return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center">
      <p className="text-white/40 uppercase font-black text-xs tracking-widest mb-4">Error</p>
      <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Nota no encontrada</h1>
      <button onClick={() => navigate(-1)} className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase italic tracking-tight">Volver</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/30 pb-20">
      {/* Header Fijo */}
      <div className="px-6 pt-10 pb-6 flex items-center justify-between border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-xl z-20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 active:scale-90 transition-transform">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="px-6 pt-8 space-y-8">
        {/* Título y Meta */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Nota</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              • {new Date(note.created_at || "").toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-[1.1] text-white">
            {note.title || "Nota sin título"}
          </h1>
        </motion.div>

        {/* Resumen Inteligente */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-white/10 rounded-[32px] p-7 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-emerald-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Resumen IA</p>
            </div>
            <p className="text-lg text-white/90 leading-relaxed font-medium">
              {note.summary || "No hay resumen disponible para esta nota."}
            </p>
          </div>
        </motion.div>

        {/* Transcripción Completa */}
        {note.transcript && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="space-y-4 pb-10"
          >
            <div className="flex items-center gap-2 px-1">
              <FileText size={14} className="text-white/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">Transcripción completa</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-[24px] p-6">
              <p className="text-[15px] text-white/60 leading-relaxed font-medium whitespace-pre-wrap">
                {note.transcript}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
