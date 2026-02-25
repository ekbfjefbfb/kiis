import { useState, useEffect } from "react";
import {
  Mic, Square, Loader2, Calendar, ChevronRight, Bookmark,
  Clock, Sparkles, Star, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { Link } from "react-router";
import { CLASSES, TASKS, AI_SUMMARIES, USER } from "../data/mock";
import { audioService } from "../../services/audio.service";
import { notesService } from "../../services/notes.service";
import { databaseService } from "../../services/database.service";

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const upcomingTasks = TASKS.filter((t) => !t.completed).slice(0, 4);

  useEffect(() => {
    loadRecentNotes();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const loadRecentNotes = async () => {
    await notesService.loadNotes();
    setRecentNotes(notesService.getNotes().slice(0, 3));
  };

  const handleRecord = async () => {
    if (isRecording) {
      try {
        const audioBlob = await audioService.stopAudioRecording();
        setIsRecording(false);
        setIsProcessing(true);
        await new Promise((r) => setTimeout(r, 2000));
        const now = new Date();
        const timestamp = now.toLocaleString("en-US", {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        });
        const analysis = {
          subject: "Mathematics",
          important: ["Exam on Friday about derivatives"],
          summary: ["Basic derivatives", "Chain rule", "Composite functions"],
          tasks: ["Do exercises 1-10 page 45"],
        };
        const note = await notesService.createNote(
          `${analysis.subject} - ${timestamp}`,
          analysis.subject,
          { name: "Auto-detected", phone: "", email: "" },
          `Recording from ${timestamp}\n\n⭐ Important:\n${analysis.important.join("\n")}\n\n📝 Summary:\n${analysis.summary.join("\n")}\n\n✏️ Tasks:\n${analysis.tasks.join("\n")}`,
          "importante"
        );
        const audioId = note.id + "_audio";
        await databaseService.saveAudio(audioId, audioBlob);
        await notesService.updateNote(note.id, { hasAudio: true, audioId });
        setIsProcessing(false);
        await loadRecentNotes();
      } catch (error) {
        console.error("Error:", error);
        setIsRecording(false);
        setIsProcessing(false);
      }
    } else {
      const hasPermission = await audioService.requestPermissions();
      if (!hasPermission) {
        alert("Microphone permission needed");
        return;
      }
      try {
        await audioService.startAudioRecording();
        setIsRecording(true);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const getTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-5 border-b border-gray-100/60">
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-0.5">
              {today}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Hello, {USER.name.split(" ")[0]} 👋
            </h1>
          </div>
          <Link
            to="/calendar"
            className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            <Calendar size={20} />
          </Link>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-6">
        {/* Quick Record */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 text-white shadow-lg shadow-indigo-200/50"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-6 -mb-6" />

          <div className="relative flex items-center justify-between">
            <div className="flex-1 mr-4">
              <h3 className="font-semibold text-lg mb-1">
                {isRecording ? "Recording..." : isProcessing ? "Processing..." : "Quick Record"}
              </h3>
              <p className="text-indigo-200 text-sm">
                {isRecording
                  ? formatTime(recordingTime)
                  : isProcessing
                  ? "AI is organizing your note"
                  : "Tap to record your class"}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleRecord}
              disabled={isProcessing}
              className={clsx(
                "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                isRecording
                  ? "bg-red-500 animate-pulse"
                  : isProcessing
                  ? "bg-white/20"
                  : "bg-white/20 hover:bg-white/30 active:bg-white/40"
              )}
            >
              {isProcessing ? (
                <Loader2 size={24} className="animate-spin" />
              ) : isRecording ? (
                <Square size={20} className="fill-white" />
              ) : (
                <Mic size={24} />
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Upcoming
            </h3>
            <Link
              to="/calendar"
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              See All
            </Link>
          </div>

          <div className="overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide flex gap-3">
            {upcomingTasks.map((task, i) => {
              const cls = CLASSES.find((c) => c.id === task.classId);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-shrink-0 w-52 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-[11px] font-medium text-gray-500">
                      {new Date(task.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <Bookmark size={11} className="text-gray-400" />
                    <span className="text-[10px] text-gray-500 truncate">
                      {cls?.name}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* My Classes */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            My Classes
          </h3>
          <div className="space-y-2.5">
            {CLASSES.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link to={`/class/${cls.id}`} className="block group">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={clsx(
                          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                          cls.color
                        )}
                      >
                        <cls.icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {cls.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <span>{cls.time}</span>
                          <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                          <span>{cls.room}</span>
                        </p>
                        {/* Important Topics Preview */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {cls.importantTopics.slice(0, 2).map((topic) => (
                            <span
                              key={topic}
                              className="text-[9px] font-medium px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full flex items-center gap-0.5"
                            >
                              <Star size={7} className="fill-amber-400 text-amber-400" />
                              {topic}
                            </span>
                          ))}
                          {cls.importantTopics.length > 2 && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-full">
                              +{cls.importantTopics.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Summaries */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              AI Summaries
            </h3>
          </div>
          <div className="space-y-2.5">
            {AI_SUMMARIES.map((s, i) => {
              const cls = CLASSES.find((c) => c.id === s.classId);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={clsx(
                        "w-6 h-6 rounded-lg flex items-center justify-center",
                        cls?.color
                      )}
                    >
                      {cls && <cls.icon size={12} />}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {cls?.name}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-auto">
                      {new Date(s.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {s.summary}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Recent Notes
              </h3>
              <Link
                to="/notes"
                className="text-xs font-medium text-indigo-600 hover:underline"
              >
                All Notes
              </Link>
            </div>
            <div className="space-y-2.5">
              {recentNotes.map((note) => (
                <Link key={note.id} to={`/note/${note.id}`}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm truncate flex-1">
                        {note.className}
                      </h4>
                      <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                        {getTimeAgo(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {note.content}
                    </p>
                    {note.hasAudio && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-600">
                        <Mic size={10} />
                        <span>Audio recording</span>
                      </div>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
