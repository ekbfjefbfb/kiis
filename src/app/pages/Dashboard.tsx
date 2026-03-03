import { useState, useEffect } from "react";
import {
  Mic, Square, Loader2, Calendar, ChevronRight, Bookmark,
  Clock, Sparkles, Star, BookOpen, Plus, X, Zap, Play
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { Link, useNavigate } from "react-router";
import { CLASSES, TASKS, AI_SUMMARIES, addClass } from "../data/mock";
import { audioService } from "../../services/audio.service";
import { notesService, BackendNote } from "../../services/notes.service";
import { authService } from "../../services/auth.service";
import { groqService } from "../../services/groq.service";
import { aiService } from "../../services/ai.service";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentNotes, setRecentNotes] = useState<BackendNote[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

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

  const upcomingTasks = tasks.filter((t) => !t.completed).slice(0, 4);

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
        
        // Transcribir con Groq
        let finalTranscript = "";
        try {
          finalTranscript = await groqService.transcribe(audioBlob, 'es');
        } catch (e) {
          console.error("Transcription failed:", e);
          finalTranscript = "Transcripción no disponible";
        }

        // Crear nota en backend
        try {
          await notesService.createFromTranscript(finalTranscript, "Nota Rápida", true);
        } catch (e) {
          console.error("Error creating note:", e);
        }

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
    <div className="min-h-[100dvh] pb-6 bg-background text-foreground relative font-sans">
      {/* Header - Minimalista */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {today}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Hola, {(() => { try { const p = JSON.parse(localStorage.getItem('user_profile') || '{}'); return p.name?.split(' ')[0] || authService.getCurrentUser()?.displayName?.split(' ')[0] || 'Estudiante'; } catch { return 'Estudiante'; } })()}
            </h1>
          </div>
          <Link
            to="/calendar"
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <Calendar size={22} />
          </Link>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Quick Actions - Minimalistas y grandes */}
        <div className="grid grid-cols-2 gap-4">
          {/* Quick Record */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={async () => {
              const ok = await audioService.requestPermissions();
              if (!ok) {
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
            }}
            className="relative overflow-hidden rounded-3xl bg-emerald-500 p-5 text-white text-left active:scale-95 transition-transform"
          >
            <Zap size={28} className="mb-3" />
            <span className="font-semibold text-lg block">Nota Rápida</span>
            <span className="text-white/70 text-sm">Graba al instante</span>
          </motion.button>

          {/* Full Recording */}
          <Link to="/live">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-indigo-600 p-5 text-white text-left h-full active:scale-95 transition-transform"
            >
              <Sparkles size={28} className="mb-3" />
              <span className="font-semibold text-lg block">Grabar Clase</span>
              <span className="text-white/70 text-sm">Análisis con IA</span>
            </motion.div>
          </Link>
        </div>

        {/* Upcoming Tasks - Minimalista */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-foreground">
              Próximos
            </h3>
            <Link
              to="/calendar"
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todo →
            </Link>
          </div>

          <div className="overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide flex gap-4">
            {upcomingTasks.length === 0 ? (
              <div className="w-full text-center py-8 bg-card rounded-3xl">
                <p className="text-lg text-muted-foreground">No hay tareas próximas</p>
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
                  className="flex-shrink-0 w-56 bg-card p-5 rounded-3xl border border-border"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="text-base font-medium text-muted-foreground">
                      {new Date(task.date).toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-lg leading-tight line-clamp-2 mb-2">
                    {task.title}
                  </h4>
                  <p className="text-base text-muted-foreground">
                    {cls?.name}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* My Classes - Minimalista */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground">
              Clases Grabadas
            </h3>
            <Link
              to="/notes"
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todo →
            </Link>
          </div>
          
          {recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link to={`/session/${session.id}`} className="block">
                    <div className="bg-card p-5 rounded-3xl border border-border active:scale-[0.98] transition-transform">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shrink-0">
                          <Sparkles size={28} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xl mb-1 truncate">
                            {session.class_name || "Clase"}
                          </h4>
                          <p className="text-base text-muted-foreground">
                            {new Date(session.session_datetime).toLocaleDateString("es-ES", {
                              weekday: "long",
                              month: "short",
                              day: "numeric"
                            })}
                          </p>
                        </div>
                        <ChevronRight size={28} className="text-muted-foreground shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <Mic size={32} className="text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                No hay clases grabadas
              </p>
              <Link
                to="/live"
                className="inline-flex items-center gap-2 text-lg font-medium text-indigo-600"
              >
                <Sparkles size={20} />
                Grabar primera clase
              </Link>
            </div>
          )}
        </section>

        {/* My Classes / Materias - Minimalista */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground">
              Mis Materias
            </h3>
            <button
              onClick={() => setIsAddingClass(true)}
              className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-3">
            {CLASSES.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link to={`/class/${cls.id}`} className="block">
                  <div className="bg-card p-4 rounded-2xl border border-border active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <cls.icon size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg truncate">
                          {cls.name}
                        </h4>
                        <p className="text-base text-muted-foreground mt-1">
                          {cls.professor}
                        </p>
                      </div>
                      <ChevronRight size={24} className="text-muted-foreground shrink-0" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Notes - Minimalista */}
        {recentNotes.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-foreground">
                Notas Recientes
              </h3>
              <Link
                to="/notes"
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver todo →
              </Link>
            </div>
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <Link key={note.id} to={`/note/${note.id}`} className="block">
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="bg-card p-5 rounded-3xl border border-border active:scale-[0.98] transition-transform"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg truncate flex-1">
                        {note.title || "Apunte Sin Título"}
                      </h4>
                      <span className="text-base text-muted-foreground ml-2 whitespace-nowrap">
                        {getTimeAgo(note.created_at)}
                      </span>
                    </div>
                    <p className="text-base text-muted-foreground line-clamp-2">
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
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setIsAddingClass(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 rounded-t-3xl z-50 p-6 shadow-xl border-t border-border safe-bottom max-w-md mx-auto bg-card text-card-foreground"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold">Añadir Nueva Clase</h2>
                <button
                  onClick={() => setIsAddingClass(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Nombre de Materia</label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ej. Programación Avanzada"
                    className="w-full bg-transparent border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-ring focus:outline-none transition-all placeholder:text-muted-foreground text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Profesor</label>
                  <input
                    type="text"
                    required
                    value={newClassProfessor}
                    onChange={(e) => setNewClassProfessor(e.target.value)}
                    placeholder="Nombre del Profesor"
                    className="w-full bg-transparent border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-ring focus:outline-none transition-all placeholder:text-muted-foreground text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Horario</label>
                    <input
                      type="text"
                      value={newClassTime}
                      onChange={(e) => setNewClassTime(e.target.value)}
                      placeholder="Ej. Mar, Jue 10:00 AM"
                      className="w-full bg-transparent border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-ring focus:outline-none transition-all placeholder:text-muted-foreground text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Aula</label>
                    <input
                      type="text"
                      value={newClassRoom}
                      onChange={(e) => setNewClassRoom(e.target.value)}
                      placeholder="Ej. Lab 2"
                      className="w-full bg-transparent border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-ring focus:outline-none transition-all placeholder:text-muted-foreground text-foreground"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newClassName.trim() || !newClassProfessor.trim()}
                  className="w-full bg-foreground text-background rounded-xl py-4 font-bold mt-2 disabled:opacity-50 hover:bg-foreground/90 active:scale-[0.98] transition-all flex items-center justify-center h-14"
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
