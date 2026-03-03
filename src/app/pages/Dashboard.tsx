import { useState, useEffect } from "react";
import {
  Mic, Square, Calendar, ChevronRight, Clock, Sparkles, Plus, X, Zap, Radio, FileText, BookOpen, Brain
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { Link } from "react-router";
import { CLASSES, addClass } from "../data/mock";
import { audioService } from "../../services/audio.service";
import { notesService, BackendNote } from "../../services/notes.service";
import { authService } from "../../services/auth.service";
import { groqService } from "../../services/groq.service";

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentNotes, setRecentNotes] = useState<BackendNote[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassProfessor, setNewClassProfessor] = useState("");

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const upcomingTasks = tasks.filter((t) => !t.completed).slice(0, 3);

  useEffect(() => {
    loadRecentNotes();
    loadRecentSessions();
    loadTasks();
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

  const loadRecentSessions = async () => {
    try {
      const stored = localStorage.getItem('recent_sessions');
      if (stored) {
        const sessions = JSON.parse(stored);
        setRecentSessions(sessions.slice(0, 5));
      }
    } catch (e) {
      console.error("Error loading sessions", e);
    }
  };

  const loadTasks = async () => {
    try {
      const stored = localStorage.getItem('user_tasks');
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading tasks", e);
    }
  };

  const handleQuickRecord = async () => {
    if (isRecording) {
      try {
        const audioBlob = await audioService.stopAudioRecording();
        setIsRecording(false);
        setIsProcessing(true);
        
        let finalTranscript = "";
        try {
          finalTranscript = await groqService.transcribe(audioBlob, 'es');
        } catch (e) {
          console.error("Transcription failed:", e);
          finalTranscript = "Transcripción no disponible";
        }

        try {
          await notesService.createFromTranscript(finalTranscript, "Nota Rápida", true);
        } catch (e) {
          console.error("Error creating note:", e);
        }

        setIsProcessing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
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
      } catch (e) {
        console.error("Error:", e);
      }
    }
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassProfessor.trim()) return;
    addClass({
      name: newClassName,
      professor: newClassProfessor,
      time: "Por definir",
      room: "Por definir",
      email: "",
      phone: "",
      nextTask: "",
      taskDate: ""
    });
    setIsAddingClass(false);
    setNewClassName("");
    setNewClassProfessor("");
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const getTimeAgo = (isoDate: string | null) => {
    if (!isoDate) return "Ahora";
    const diff = Date.now() - new Date(isoDate).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d`;
    if (h > 0) return `${h}h`;
    return "Ahora";
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white pb-24 font-sans">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-white/60 mb-1">{today}</p>
            <h1 className="text-3xl font-bold">
              Hola, {(() => { try { const p = JSON.parse(localStorage.getItem('user_profile') || '{}'); return p.name?.split(' ')[0] || authService.getCurrentUser()?.displayName?.split(' ')[0] || 'Estudiante'; } catch { return 'Estudiante'; } })()}
            </h1>
          </div>
          <Link
            to="/calendar"
            className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Calendar size={22} className="text-white" />
          </Link>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Recording State */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-red-500 rounded-3xl p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span className="font-semibold text-lg">Grabando...</span>
              </div>
              <span className="text-2xl font-mono">{formatTime(recordingTime)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-blue-500 rounded-3xl p-5 flex items-center gap-3"
            >
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={24} />
              </motion.div>
              <span className="font-semibold text-lg">Procesando con IA...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500 rounded-3xl p-5 flex items-center gap-3"
            >
              <Sparkles size={24} />
              <span className="font-semibold text-lg">¡Nota guardada!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Actions */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            onClick={handleQuickRecord}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              "rounded-3xl p-5 text-left transition-all",
              isRecording 
                ? "bg-red-500 text-white" 
                : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              {isRecording ? <Square size={24} fill="currentColor" /> : <Zap size={24} />}
            </div>
            <p className="font-bold text-lg">
              {isRecording ? "Detener" : "Nota Rápida"}
            </p>
            <p className="text-sm text-white/80">
              {isRecording ? "Toca para guardar" : "Graba y transcribe"}
            </p>
          </motion.button>

          <Link to="/live">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-5 text-left h-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <Radio size={24} />
              </div>
              <p className="font-bold text-lg">Grabar Clase</p>
              <p className="text-sm text-white/80">IA en tiempo real</p>
            </motion.div>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link to="/voice">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl bg-white/10 p-4 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
                <Brain size={20} className="text-orange-400" />
              </div>
              <p className="text-sm font-medium">Chat IA</p>
            </motion.div>
          </Link>
          
          <Link to="/notes">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl bg-white/10 p-4 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <FileText size={20} className="text-blue-400" />
              </div>
              <p className="text-sm font-medium">Mis Notas</p>
            </motion.div>
          </Link>
          
          <Link to="/chat">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl bg-white/10 p-4 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center mx-auto mb-2">
                <Sparkles size={20} className="text-pink-400" />
              </div>
              <p className="text-sm font-medium">Asistente</p>
            </motion.div>
          </Link>
        </div>

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Próximas Tareas</h3>
              <Link to="/calendar" className="text-sm text-white/60">
                Ver todo →
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div 
                  key={task.id}
                  className="bg-white/5 rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-white/60">
                      {new Date(task.date).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Clases Grabadas</h3>
              <Link to="/notes" className="text-sm text-white/60">
                Ver todo →
              </Link>
            </div>
            <div className="space-y-3">
              {recentSessions.slice(0, 3).map((session) => (
                <Link key={session.id} to={`/session/${session.id}`}>
                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                      <Mic size={20} className="text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{session.class_name || "Clase"}</p>
                      <p className="text-sm text-white/60">
                        {new Date(session.session_datetime).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-white/40" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* My Classes */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Mis Materias</h3>
            <button 
              onClick={() => setIsAddingClass(true)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {CLASSES.map((cls) => (
              <Link key={cls.id} to={`/class/${cls.id}`}>
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition-transform"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <BookOpen size={20} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{cls.name}</p>
                    <p className="text-sm text-white/60">{cls.professor}</p>
                  </div>
                  <ChevronRight size={20} className="text-white/40" />
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Notas Recientes</h3>
              <Link to="/notes" className="text-sm text-white/60">
                Ver todo →
              </Link>
            </div>
            <div className="space-y-3">
              {recentNotes.slice(0, 3).map((note) => (
                <Link key={note.id} to={`/note/${note.id}`}>
                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/5 rounded-2xl p-4 active:scale-95 transition-transform"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold flex-1">{note.title || "Nota"}</p>
                      <span className="text-sm text-white/40">{getTimeAgo(note.created_at)}</span>
                    </div>
                    <p className="text-sm text-white/60 line-clamp-2">
                      {note.summary || note.transcript || "Sin contenido"}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Add Class Modal */}
      <AnimatePresence>
        {isAddingClass && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40"
              onClick={() => setIsAddingClass(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl z-50 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Nueva Materia</h2>
                <button onClick={() => setIsAddingClass(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Nombre</label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ej. Matemáticas"
                    className="w-full bg-white/5 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Profesor</label>
                  <input
                    type="text"
                    required
                    value={newClassProfessor}
                    onChange={(e) => setNewClassProfessor(e.target.value)}
                    placeholder="Nombre del profesor"
                    className="w-full bg-white/5 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newClassName.trim() || !newClassProfessor.trim()}
                  className="w-full bg-white text-black rounded-xl py-4 font-bold mt-4 disabled:opacity-50"
                >
                  Guardar
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
