import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Play, Pause, Trash2, Calendar, Mic, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { notesService } from "../../services/notes.service";
import { databaseService, Note } from "../../services/database.service";

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadNote();
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [id]);

  const loadNote = async () => {
    if (!id) return;
    await notesService.loadNotes();
    const foundNote = notesService.getNoteById(id);
    if (!foundNote) {
      navigate("/notes");
      return;
    }
    setNote(foundNote);

    if (foundNote.hasAudio && foundNote.audioId) {
      const audioBlob = await databaseService.getAudio(foundNote.audioId);
      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        const el = new Audio(url);
        el.addEventListener("ended", () => setIsPlaying(false));
        setAudio(el);
      }
    }
  };

  const togglePlay = () => {
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const handleDelete = async () => {
    if (!note) return;
    if (confirm("Delete this note?")) {
      await notesService.deleteNote(note.id);
      navigate("/notes");
    }
  };

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Parse AI analysis
  const parseContent = (content: string) => {
    const sections = {
      important: [] as string[],
      summary: [] as string[],
      tasks: [] as string[],
      exams: [] as string[],
      keyPoints: [] as string[],
    };
    const lines = content.split("\n");
    let current = "";
    for (const line of lines) {
      if (line.includes("⭐ Important:")) current = "important";
      else if (line.includes("📝 Summary:")) current = "summary";
      else if (line.includes("✏️ Tasks:")) current = "tasks";
      else if (line.includes("📅 Exams:")) current = "exams";
      else if (line.includes("💡 Key Points:")) current = "keyPoints";
      else if (line.trim() && current) {
        const cleaned = line.trim();
        if (cleaned && !cleaned.includes("Recording from")) {
          sections[current as keyof typeof sections].push(cleaned);
        }
      }
    }
    return sections;
  };

  const analysis = parseContent(note.content);
  const hasAnalysis = Object.values(analysis).some((a) => a.length > 0);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const sectionConfig = [
    { key: "important", data: analysis.important, emoji: "⭐", label: "Important", bg: "bg-red-50", border: "border-red-200", title: "text-red-900", text: "text-red-800", bullet: "text-red-300" },
    { key: "summary", data: analysis.summary, emoji: "📝", label: "Summary", bg: "bg-blue-50", border: "border-blue-200", title: "text-blue-900", text: "text-blue-800", bullet: "text-blue-300" },
    { key: "tasks", data: analysis.tasks, emoji: "✏️", label: "Tasks", bg: "bg-amber-50", border: "border-amber-200", title: "text-amber-900", text: "text-amber-800", bullet: "text-amber-300" },
    { key: "exams", data: analysis.exams, emoji: "📅", label: "Exams", bg: "bg-purple-50", border: "border-purple-200", title: "text-purple-900", text: "text-purple-800", bullet: "text-purple-300" },
    { key: "keyPoints", data: analysis.keyPoints, emoji: "💡", label: "Key Points", bg: "bg-emerald-50", border: "border-emerald-200", title: "text-emerald-900", text: "text-emerald-800", bullet: "text-emerald-300" },
  ];

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
          <button
            onClick={handleDelete}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <h1 className="text-lg font-bold text-gray-900 mb-1">{note.className}</h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar size={12} />
          <span>{formatDate(note.createdAt)}</span>
        </div>

        {hasAnalysis && (
          <div className="flex items-center gap-1.5 mt-2">
            <Sparkles size={12} className="text-indigo-500" />
            <span className="text-[10px] font-medium text-indigo-600">AI-Generated Summary</span>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {note.hasAudio && audioUrl && (
        <div className="px-5 pt-4">
          <button
            onClick={togglePlay}
            className="w-full flex items-center justify-center gap-2.5 bg-indigo-600 text-white py-3.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-sm active:scale-[0.98]"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            <span className="text-sm font-medium">
              {isPlaying ? "Pause Recording" : "Play Recording"}
            </span>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="px-5 pt-4 space-y-3">
        {hasAnalysis ? (
          sectionConfig
            .filter((s) => s.data.length > 0)
            .map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={clsx("rounded-2xl p-4 border", s.bg, s.border)}
              >
                <h3
                  className={clsx(
                    "text-sm font-bold mb-2.5 flex items-center gap-2",
                    s.title
                  )}
                >
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                </h3>
                <ul className="space-y-1.5">
                  {s.data.map((item, j) => (
                    <li
                      key={j}
                      className={clsx(
                        "text-sm flex items-start gap-2",
                        s.text
                      )}
                    >
                      <span className={clsx("mt-1.5", s.bullet)}>•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))
        ) : (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {note.content}
            </p>
          </div>
        )}

        {/* Professor Info */}
        {note.professor && note.professor.name && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
              Professor
            </h3>
            <p className="text-sm font-medium text-gray-900">{note.professor.name}</p>
            {note.professor.email && (
              <p className="text-xs text-gray-500 mt-0.5">{note.professor.email}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
