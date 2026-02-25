import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Play, Pause, Trash2, Calendar, Sparkles, BookOpen, Download } from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { notesService, BackendNote } from "../../services/notes.service";

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<BackendNote | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsUtterance, setTtsUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    loadNote();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [id]);

  const loadNote = async () => {
    if (!id) return;
    try {
      const foundNote = await notesService.getNoteById(id);
      setNote(foundNote);
    } catch {
      navigate("/notes"); // Not found or error
    }
  };

  const handleSpeechPlay = () => {
    if (!note) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    // Prepare full text reading
    const sections = [];
    if (note.title) sections.push(`Título de la nota: ${note.title}.`);
    if (note.summary) sections.push(`Resumen de IA: ${note.summary}`);
    if (note.key_points && note.key_points.length > 0) {
       sections.push(`Puntos Clave: ${note.key_points.join(". ")}`);
    }

    const textToRead = sections.join(" ");
    
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "es-ES";
    utterance.rate = 1.0;
    
    utterance.onend = () => {
      setIsPlaying(false);
      setTtsUtterance(null);
    };

    setTtsUtterance(utterance);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleExportPDF = async () => {
    if (!note) return;
    try {
       const blob = await notesService.generateApa7Pdf({
          title: note.title || "Apunte de Clase",
          author: "Estudiante",
          paragraphs: [note.summary || note.transcript || "Sin resumen"],
       });
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement("a");
       a.href = url;
       a.download = `Nota_${note.title || "Clase"}.pdf`;
       a.click();
       window.URL.revokeObjectURL(url);
    } catch (e) {
       console.error("Error exporting PDF:", e);
       alert("Hubo un error al exportar como PDF.");
    }
  };

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return "Desconocida";
    return new Date(isoStr).toLocaleDateString("es-ES", {
      weekday: "short",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-100/60 px-5 pt-5 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <Link
            to="/notes"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex gap-2">
            <button
               onClick={handleExportPDF}
               className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
             >
               <Download size={16} />
            </button>
          </div>
        </div>

        <h1 className="text-lg font-bold text-gray-900 mb-1">{note.title || "Sin Título"}</h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar size={12} />
          <span className="capitalize">{formatDate(note.created_at)}</span>
        </div>

        {note.summary && (
          <div className="flex items-center gap-1.5 mt-2">
            <Sparkles size={12} className="text-indigo-500" />
            <span className="text-[10px] font-medium text-indigo-600">Procesado por IA</span>
          </div>
        )}
      </div>

      {/* Audio Player */}
      <div className="px-5 pt-4">
        <button
          onClick={handleSpeechPlay}
          className="w-full flex items-center justify-center gap-2.5 bg-indigo-600 text-white py-3.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-sm active:scale-[0.98]"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          <span className="text-sm font-medium">
            {isPlaying ? "Pausar Lectura IA" : "Leer Resumen con IA"}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="px-5 pt-4 space-y-3">
        {/* IA Summary */}
        {note.summary && (
           <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx("rounded-2xl p-4 border bg-blue-50 border-blue-200")}
            >
              <h3 className="text-sm font-bold mb-2.5 flex items-center gap-2 text-blue-900">
                <span>📝</span>
                <span>Resumen</span>
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                 {note.summary}
              </p>
            </motion.div>
        )}

        {/* Key Points */}
        {note.key_points && note.key_points.length > 0 && (
           <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={clsx("rounded-2xl p-4 border bg-emerald-50 border-emerald-200")}
            >
              <h3 className="text-sm font-bold mb-2.5 flex items-center gap-2 text-emerald-900">
                <span>💡</span>
                <span>Puntos Clave</span>
              </h3>
              <ul className="space-y-1.5">
                 {note.key_points.map((point, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2 text-emerald-800">
                       <span className="mt-1.5 text-emerald-300">•</span>
                       <span className="leading-relaxed">{point}</span>
                    </li>
                 ))}
              </ul>
            </motion.div>
        )}

        {/* Tasks */}
         {note.tasks && note.tasks.length > 0 && (
           <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={clsx("rounded-2xl p-4 border bg-amber-50 border-amber-200")}
            >
              <h3 className="text-sm font-bold mb-2.5 flex items-center gap-2 text-amber-900">
                <span>✏️</span>
                <span>Tareas Registradas</span>
              </h3>
              <ul className="space-y-1.5">
                 {note.tasks.map((t, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2 text-amber-800">
                       <span className="mt-1.5 text-amber-300">•</span>
                       <span className="leading-relaxed">{t.text} {t.due_date ? `(Para: ${t.due_date.substring(0,10)})` : ''}</span>
                    </li>
                 ))}
              </ul>
            </motion.div>
        )}

        {/* Transcript Raw */}
        {note.transcript && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mt-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <BookOpen size={14} /> Transcripción Original
             </h3>
             <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed mt-2 opacity-80">
                {note.transcript}
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
