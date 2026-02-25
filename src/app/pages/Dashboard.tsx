import { useState, useEffect } from "react";
import {
  Mic, Square, Loader2, Calendar, ChevronRight, Bookmark,
  Clock, Sparkles, Star, BookOpen, Plus, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { Link } from "react-router";
import { CLASSES, TASKS, AI_SUMMARIES, addClass } from "../data/mock";
import { audioService } from "../../services/audio.service";
import { notesService, BackendNote } from "../../services/notes.service";
import { authService } from "../../services/auth.service";

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentNotes, setRecentNotes] = useState<BackendNote[]>([]);

  // Add class state
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassProfessor, setNewClassProfessor] = useState("");
  const [newClassTime, setNewClassTime] = useState("");
  const [newClassRoom, setNewClassRoom] = useState("");

  const today = new Date().toLocaleDateString("es-ES", {
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
    try {
       const backendNotes = await notesService.listNotes(3, 0);
       setRecentNotes(backendNotes);
    } catch (e) {
       console.error("Error loading notes", e);
    }
  };

  const [liveTranscript, setLiveTranscript] = useState("");

  const handleRecord = async () => {
    if (isRecording) {
      try {
        if ((window as any).__dbRecordInterval) {
          clearInterval((window as any).__dbRecordInterval);
        }

        if (audioService.getIsRecording()) {
          audioService.stopRecording();
        }

        const audioBlob = await audioService.stopAudioRecording();
        setIsRecording(false);
        setIsProcessing(true);
        
        // Use live transcript if available, otherwise a default string (fallback if speech recognition failed)
        const finalTranscript = liveTranscript.trim() || "Transcripción no disponible (audio guardado).";

        // Send transcript to backend directly
        await notesService.createFromTranscript(
            finalTranscript,
            "Grabación Rápida",
            true
        );

        setIsProcessing(false);
        setLiveTranscript("");
        await loadRecentNotes();
      } catch (error) {
        console.error("Error:", error);
        setIsRecording(false);
        setIsProcessing(false);
      }
    } else {
      const hasPermission = await audioService.requestPermissions();
      if (!hasPermission) {
        alert("Se necesitan permisos de micrófono");
        return;
      }
      try {
        await audioService.startAudioRecording();
        setIsRecording(true);
        setRecordingTime(0);
        setLiveTranscript("Escuchando...");

        if (audioService.isSupported()) {
          audioService.startRecording((txt) => {
             setLiveTranscript(txt);
          });
        }

        const interval = setInterval(() => setRecordingTime((p) => p + 1), 1000);
        (window as any).__dbRecordInterval = interval;
      } catch (error) {
        console.error("Error al iniciar:", error);
      }
    }
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassProfessor.trim()) return;
    addClass({
      name: newClassName,
      professor: newClassProfessor,
      time: newClassTime || "Horario por definir",
      room: newClassRoom || "Aula por definir",
      email: "",
      phone: "",
      nextTask: "",
      taskDate: ""
    });
    setIsAddingClass(false);
    setNewClassName("");
    setNewClassProfessor("");
    setNewClassTime("");
    setNewClassRoom("");
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const getTimeAgo = (isoDate: string | null) => {
    if (!isoDate) return "Reciente";
    const diff = Date.now() - new Date(isoDate).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `Hace ${d}d`;
    if (h > 0) return `Hace ${h}h`;
    return "Justo ahora";
  };

  return (
    <div className="min-h-screen pb-4 relative" style={{ background: "var(--bg-secondary)" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-5" style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border-primary)" }}>
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-0.5 capitalize" style={{ color: "var(--text-tertiary)" }}>
              {today}
            </p>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Hola, {(() => { try { const p = JSON.parse(localStorage.getItem('user_profile') || '{}'); return p.name?.split(' ')[0] || authService.getCurrentUser()?.displayName?.split(' ')[0] || 'Estudiante'; } catch { return 'Estudiante'; } })()} 👋
            </h1>
          </div>
          <Link
            to="/calendar"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "var(--primary-light)", color: "var(--primary)" }}
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
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-5 text-white shadow-xl shadow-indigo-300/30"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-6 -mb-6" />

          <div className="relative flex items-center justify-between">
            <div className="flex-1 mr-4">
              <h3 className="font-semibold text-lg mb-1">
                {isRecording ? "Grabando..." : isProcessing ? "Procesando..." : "Grabación Rápida"}
              </h3>
              <p className="text-indigo-200 text-sm">
                {isRecording
                  ? formatTime(recordingTime)
                  : isProcessing
                  ? "La IA procesa tu clase en backend"
                  : "Toca para grabar tu clase al instante"}
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
              Próximos
            </h3>
            <Link
              to="/calendar"
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              Ver Todo
            </Link>
          </div>

          <div className="overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide flex gap-3">
            {upcomingTasks.length === 0 ? (
              <div className="w-full text-center py-4 bg-white rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-400">No hay tareas próximas</p>
              </div>
            ) : upcomingTasks.map((task, i) => {
              const cls = CLASSES.find((c) => c.id === task.classId);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-shrink-0 w-52 bg-white p-4 rounded-2xl border border-gray-100/80 shadow-sm card-premium"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-[11px] font-medium text-gray-500">
                      {new Date(task.date).toLocaleDateString("es-ES", {
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Mis Clases
            </h3>
            <button
              onClick={() => setIsAddingClass(true)}
              className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="space-y-2.5">
            {CLASSES.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link to={`/class/${cls.id}`} className="block group">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100/80 shadow-sm card-premium">
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
                          <span className="truncate max-w-[80px]">{cls.time}</span>
                          <span className="w-0.5 h-0.5 bg-gray-300 rounded-full shrink-0" />
                          <span className="truncate">{cls.professor}</span>
                        </p>
                        {/* Important Topics Preview */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {cls.importantTopics.slice(0, 2).map((topic) => (
                            <span
                              key={topic}
                              className="text-[9px] font-medium px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full flex items-center gap-0.5"
                            >
                              <Star size={7} className="fill-amber-400 text-amber-400 shrink-0" />
                              <span className="truncate max-w-[100px]">{topic}</span>
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
                        className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0 pl-1"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Notas Recientes
              </h3>
              <Link
                to="/notes"
                className="text-xs font-medium text-indigo-600 hover:underline"
              >
                Todas
              </Link>
            </div>
            <div className="space-y-2.5">
              {recentNotes.map((note) => (
                <Link key={note.id} to={`/note/${note.id}`} className="block">
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="bg-white p-4 rounded-2xl border border-gray-100/80 shadow-sm card-premium"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm truncate flex-1">
                        {note.title || "Apunte Sin Título"}
                      </h4>
                      <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                        {getTimeAgo(note.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                       {note.summary || note.transcript || "Procesando contenido..."}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Add Class Modal Overlay */}
      <AnimatePresence>
        {isAddingClass && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setIsAddingClass(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 rounded-t-3xl z-50 p-6 shadow-2xl safe-bottom max-w-md mx-auto"
              style={{ background: "var(--bg-primary)" }}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Añadir Nueva Clase</h2>
                <button
                  onClick={() => setIsAddingClass(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Nombre de Materia</label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ej. Programación Avanzada"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Profesor</label>
                  <input
                    type="text"
                    required
                    value={newClassProfessor}
                    onChange={(e) => setNewClassProfessor(e.target.value)}
                    placeholder="Nombre del Profesor"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Horario</label>
                    <input
                      type="text"
                      value={newClassTime}
                      onChange={(e) => setNewClassTime(e.target.value)}
                      placeholder="Ej. Mar, Jue 10:00 AM"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Aula</label>
                    <input
                      type="text"
                      value={newClassRoom}
                      onChange={(e) => setNewClassRoom(e.target.value)}
                      placeholder="Ej. Lab 2"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newClassName.trim() || !newClassProfessor.trim()}
                  className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-semibold mt-2 disabled:opacity-50 active:bg-indigo-700 transition-colors"
                >
                  Guardar Clase
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
