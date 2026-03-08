import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Trash2, Zap, FileText } from "lucide-react";
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
      const data = await notesService.getNoteById(noteId);
      setNote(data);
    } catch {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !confirm("¿Eliminar este registro de memoria?")) return;
    try {
      await notesService.deleteNote(note.id!);
      navigate("/notes", { replace: true });
    } catch {
      // Silently handle error
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/5 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!note) return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center px-10 text-center">
      <h1 className="text-3xl font-extrabold tracking-tighter italic mb-6">No encontrado.</h1>
      <button onClick={() => navigate(-1)} className="w-full h-18 bg-white text-black rounded-[2rem] font-bold">Volver</button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      <header className="px-8 pt-16 pb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <button onClick={handleDelete} className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full active:bg-white/10 text-red-500 transition-colors">
          <Trash2 size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-8 pt-4 pb-32 space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Memoria de Agenda</span>
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-[10px] font-bold text-zinc-500">{new Date(note.created_at || "").toLocaleDateString("es-ES", { day: 'numeric', month: 'short' })}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter leading-tight italic">{note.title || "Sin título"}</h1>
        </div>

        <section className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Zap size={40} />
          </div>
          <div className="relative z-10">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-4">Resumen Inteligente</h2>
            <p className="text-xl text-white/90 leading-relaxed font-medium italic">
              "{note.summary || "Generando síntesis..."}"
            </p>
          </div>
        </section>

        {note.transcript && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <FileText size={14} className="text-zinc-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Transcripción</h2>
            </div>
            <div className="bg-zinc-900/10 border border-white/5 rounded-[2rem] p-6">
              <p className="text-base text-zinc-400 leading-relaxed font-medium">
                {note.transcript}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
