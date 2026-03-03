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
    <div className="min-h-[100dvh] pb-4 bg-background text-foreground relative font-sans transition-colors duration-300">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-border bg-card">
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest capitalize text-muted-foreground">
              {today}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
              Hola, {(() => { try { const p = JSON.parse(localStorage.getItem('user_profile') || '{}'); return p.name?.split(' ')[0] || authService.getCurrentUser()?.displayName?.split(' ')[0] || 'Estudiante'; } catch { return 'Estudiante'; } })()} 👋
            </h1>
          </div>
          <Link
            to="/calendar"
            className="w-11 h-11 rounded-lg flex items-center justify-center transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <Calendar size={20} />
          </Link>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-5">
        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Quick Record - Grabación rápida */}
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
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-yellow-300" />
              <span className="font-semibold text-sm">Nota Rápida</span>
            </div>
            <p className="text-white/70 text-xs">
              Graba y resume al instante
            </p>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          </motion.button>

          {/* Full Recording - Grabación completa */}
          <Link to="/live">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-4 text-white text-left h-full"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-yellow-300" />
                <span className="font-semibold text-sm">Grabar Clase</span>
              </div>
              <p className="text-white/70 text-xs">
                Análisis completo con IA
              </p>
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            </motion.div>
          </Link>
        </div>

        {/* Upcoming Tasks */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              Próximos
            </h3>
            <Link
              to="/calendar"
              className="text-sm font-medium text-foreground hover:underline underline-offset-4"
            >
              Ver Todo
            </Link>
          </div>

          <div className="overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide flex gap-3">
            {upcomingTasks.length === 0 ? (
              <div className="w-full text-center py-6 bg-card rounded-2xl border border-border">
                <p className="text-base text-muted-foreground">No hay tareas próximas</p>
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
                  className="flex-shrink-0 w-48 bg-card p-4 rounded-2xl border border-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(task.date).toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-card-foreground text-sm leading-tight line-clamp-2 mb-2">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-1">
                    <Bookmark size={9} className="text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground truncate">
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              Clases Grabadas
            </h3>
            <Link
              to="/notes"
              className="text-sm font-medium text-foreground hover:underline underline-offset-4"
            >
              Ver Todas
            </Link>
          </div>
          
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link to={`/session/${session.id}`} className="block group">
                    <div className="bg-card p-4 rounded-2xl border border-border transition-all hover:border-indigo-500/50 hover:shadow-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Sparkles size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground text-base mb-1 truncate">
                            {session.class_name || "Clase"}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(session.session_datetime).toLocaleDateString("es-ES", {
                              weekday: "short",
                              month: "short",
                              day: "numeric"
                            })}
                          </p>
                          {session.summary && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {session.summary}
                            </p>
                          )}
                        </div>
                        <ChevronRight size={20} className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-2xl p-6 text-center border border-border/50">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                <Mic size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                No hay clases grabadas aún
              </p>
              <Link
                to="/live"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                <Sparkles size={16} />
                Grabar primera clase
              </Link>
            </div>
          )}
        </section>

        {/* My Classes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              Mis Materias
            </h3>
            <button
              onClick={() => setIsAddingClass(true)}
              className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Plus size={14} />
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
                  <div className="bg-card p-3 rounded-xl border border-border transition-colors hover:border-foreground/20">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-secondary text-secondary-foreground"
                      >
                        <cls.icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-card-foreground text-sm truncate">
                          {cls.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <span className="truncate max-w-[80px]">{cls.time}</span>
                          <span className="w-0.5 h-0.5 bg-border rounded-full shrink-0" />
                          <span className="truncate">{cls.professor}</span>
                        </p>
                        {/* Important Topics Preview */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {cls.importantTopics.slice(0, 2).map((topic) => (
                            <span
                              key={topic}
                              className="text-[9px] font-medium px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-full flex items-center gap-0.5"
                            >
                              <Star size={7} className="fill-current shrink-0" />
                              <span className="truncate max-w-[100px]">{topic}</span>
                            </span>
                          ))}
                          {cls.importantTopics.length > 2 && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 bg-secondary text-muted-foreground rounded-full">
                              +{cls.importantTopics.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0 pl-1"
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
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Notas Recientes
              </h3>
              <Link
                to="/notes"
                className="text-xs font-medium text-foreground hover:underline underline-offset-4"
              >
                Todas
              </Link>
            </div>
            <div className="space-y-2.5">
              {recentNotes.map((note) => (
                <Link key={note.id} to={`/note/${note.id}`} className="block">
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="bg-card p-4 rounded-2xl border border-border shadow-sm transition-colors hover:border-foreground/20"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-card-foreground text-sm truncate flex-1">
                        {note.title || "Apunte Sin Título"}
                      </h4>
                      <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                        {getTimeAgo(note.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
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
