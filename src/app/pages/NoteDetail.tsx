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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin" />
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
    <div className="min-h-[100dvh] bg-background text-foreground pb-24 font-sans">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 pt-12 pb-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/notes"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div className="flex gap-2">
            <button
               onClick={handleExportPDF}
               className="w-10 h-10 flex items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors"
             >
               <Download size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">{note.title || "Sin Título"}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={14} />
          <span className="capitalize">{formatDate(note.created_at)}</span>
        </div>
      </div>

      {/* Audio Player */}
      <div className="px-6 pt-8">
        <button
          onClick={handleSpeechPlay}
          className="w-full flex items-center justify-center gap-3 bg-foreground text-background py-4 rounded-2xl hover:bg-foreground/90 transition-all shadow-xl active:scale-[0.98]"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          <span className="text-[15px] font-bold tracking-wide uppercase">
            {isPlaying ? "Detener" : "Reproducir"}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pt-10 space-y-12">
        {/* IA Summary */}
        {note.summary && (
           <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-muted-foreground border-b border-border/50 pb-2 mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-foreground" />
                Resumen
              </h3>
              <p className="text-lg text-foreground leading-relaxed font-light">
                 {note.summary}
              </p>
            </motion.div>
        )}

        {/* Key Points */}
        {note.key_points && note.key_points.length > 0 && (
           <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-muted-foreground border-b border-border/50 pb-2 mb-4 flex items-center gap-2">
                <BookOpen size={14} className="text-foreground" />
                Puntos Clave
              </h3>
              <ul className="space-y-4">
                 {note.key_points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-foreground/90">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5">{String(idx + 1).padStart(2, '0')}</span>
                       <span className="leading-relaxed text-[17px]">{point}</span>
                    </li>
                 ))}
              </ul>
            </motion.div>
        )}

        {/* Tasks */}
         {note.tasks && note.tasks.length > 0 && (
           <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-muted-foreground border-b border-border/50 pb-2 mb-4 flex items-center gap-2">
                Tareas Registradas
              </h3>
              <ul className="space-y-3">
                 {note.tasks.map((t, idx) => (
                    <li key={idx} className="flex flex-col gap-1 p-4 rounded-xl bg-muted/40 border border-border/50">
                       <span className="leading-relaxed text-[15px] font-medium text-foreground">{t.text}</span>
                       {t.due_date && <span className="text-[12px] font-mono text-muted-foreground uppercase">{t.due_date.substring(0,10)}</span>}
                    </li>
                 ))}
              </ul>
            </motion.div>
        )}

        {/* Transcript Raw */}
        {note.transcript && (
          <div className="pt-8">
             <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-muted-foreground border-b border-border/50 pb-2 mb-4 flex items-center gap-2">
                Transcripción Cruda
             </h3>
             <p className="text-[15px] text-muted-foreground whitespace-pre-wrap leading-loose font-mono opacity-60">
                {note.transcript}
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
