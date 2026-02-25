import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Play, Pause, Trash2, Calendar, Clock } from "lucide-react";
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

    // Load audio if available
    if (foundNote.hasAudio && foundNote.audioId) {
      const audioBlob = await databaseService.getAudio(foundNote.audioId);
      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        const audioElement = new Audio(url);
        audioElement.addEventListener("ended", () => setIsPlaying(false));
        setAudio(audioElement);
      }
    }
  };

  const togglePlayPause = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
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
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Parse AI analysis from content
  const parseContent = (content: string) => {
    const sections = {
      important: [] as string[],
      summary: [] as string[],
      tasks: [] as string[],
      exams: [] as string[],
      keyPoints: [] as string[]
    };

    const lines = content.split("\n");
    let currentSection = "";

    for (const line of lines) {
      if (line.includes("⭐ Important:")) {
        currentSection = "important";
      } else if (line.includes("📝 Summary:")) {
        currentSection = "summary";
      } else if (line.includes("✏️ Tasks:")) {
        currentSection = "tasks";
      } else if (line.includes("📅 Exams:")) {
        currentSection = "exams";
      } else if (line.includes("💡 Key Points:")) {
        currentSection = "keyPoints";
      } else if (line.trim() && currentSection) {
        const cleaned = line.trim();
        if (cleaned && !cleaned.includes("Recording from")) {
          sections[currentSection as keyof typeof sections].push(cleaned);
        }
      }
    }

    return sections;
  };

  const analysis = parseContent(note.content);
  const hasAnalysis = Object.values(analysis).some(arr => arr.length > 0);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <Link to="/notes" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-2"
          >
            <Trash2 size={20} />
          </button>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{note.className}</h1>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(note.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {note.hasAudio && audioUrl && (
        <div className="bg-white border-b border-gray-100 p-6">
          <button
            onClick={togglePlayPause}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause size={20} />
                <span className="font-medium">Pause Recording</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span className="font-medium">Play Recording</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-6">
        {hasAnalysis ? (
          <>
            {/* Important */}
            {analysis.important.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-2 border-red-200 rounded-2xl p-5"
              >
                <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                  <span>⭐</span>
                  <span>Important</span>
                </h3>
                <ul className="space-y-2">
                  {analysis.important.map((item, i) => (
                    <li key={i} className="text-red-800 flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Summary */}
            {analysis.summary.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5"
              >
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span>📝</span>
                  <span>Summary</span>
                </h3>
                <ul className="space-y-2">
                  {analysis.summary.map((item, i) => (
                    <li key={i} className="text-blue-800 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Tasks */}
            {analysis.tasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5"
              >
                <h3 className="text-lg font-bold text-yellow-900 mb-3 flex items-center gap-2">
                  <span>✏️</span>
                  <span>Tasks</span>
                </h3>
                <ul className="space-y-2">
                  {analysis.tasks.map((item, i) => (
                    <li key={i} className="text-yellow-800 flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Exams */}
            {analysis.exams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5"
              >
                <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <span>📅</span>
                  <span>Exams</span>
                </h3>
                <ul className="space-y-2">
                  {analysis.exams.map((item, i) => (
                    <li key={i} className="text-purple-800 flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Key Points */}
            {analysis.keyPoints.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-green-50 border-2 border-green-200 rounded-2xl p-5"
              >
                <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                  <span>💡</span>
                  <span>Key Points</span>
                </h3>
                <ul className="space-y-2">
                  {analysis.keyPoints.map((item, i) => (
                    <li key={i} className="text-green-800 flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
          </div>
        )}

        {/* Professor Info */}
        {note.professor && note.professor.name && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Professor
            </h3>
            <p className="text-gray-900 font-medium">{note.professor.name}</p>
            {note.professor.email && (
              <p className="text-sm text-gray-600 mt-1">{note.professor.email}</p>
            )}
            {note.professor.phone && (
              <p className="text-sm text-gray-600">{note.professor.phone}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
