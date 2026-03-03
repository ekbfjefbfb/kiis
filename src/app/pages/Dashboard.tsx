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
    <div className="min-h-[100dvh] bg-black text-white pb-24 font-sans selection:bg-white/30">
      {/* Header - Ultra Minimalista y Grande */}
      <div className="px-6 pt-10 pb-8">
        <div className="flex justify-between items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-lg font-medium text-white/40 mb-2 uppercase tracking-widest">{today}</p>
            <h1 className="text-5xl font-black tracking-tight leading-none">
              Hola,<br/>{(() => { try { const p = JSON.parse(localStorage.getItem('user_profile') || '{}'); return p.name?.split(' ')[0] || authService.getCurrentUser()?.displayName?.split(' ')[0] || 'Estudiante'; } catch { return 'Estudiante'; } })()}
            </h1>
          </motion.div>
          <Link
            to="/calendar"
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
          >
            <Calendar size={24} className="text-white" />
          </Link>
        </div>
      </div>

      <div className="px-6 space-y-10">
        {/* Recording States - Llamativos */}
        <AnimatePresence mode="wait">
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-600 rounded-[40px] p-8 flex items-center justify-between shadow-[0_0_50px_-12px_rgba(220,38,38,0.5)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-white animate-ping" />
                <span className="font-black text-2xl uppercase italic">Grabando</span>
              </div>
              <span className="text-4xl font-mono font-black tabular-nums">{formatTime(recordingTime)}</span>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-blue-600 rounded-[40px] p-8 flex items-center gap-5 shadow-[0_0_50px_-12px_rgba(37,99,235,0.5)]"
            >
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={32} />
              </motion.div>
              <span className="font-black text-2xl uppercase italic text-white">IA Analizando...</span>
            </motion.div>
          )}

          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-green-600 rounded-[40px] p-8 flex items-center gap-5 shadow-[0_0_50px_-12px_rgba(22,163,74,0.5)]"
            >
              <Zap size={32} fill="white" />
              <span className="font-black text-2xl uppercase italic">¡Guardado!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons - Diferenciación Real */}
        <div className="flex flex-col gap-5">
          {/* Quick Note - Acción Inmediata */}
          <motion.button
            onClick={handleQuickRecord}
            whileTap={{ scale: 0.96 }}
            className={clsx(
              "w-full rounded-[40px] p-8 text-left transition-all duration-500 flex items-center justify-between relative overflow-hidden group",
              isRecording 
                ? "bg-red-600" 
                : "bg-emerald-500"
            )}
          >
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {isRecording ? <Square size={32} fill="currentColor" /> : <Zap size={32} fill="white" />}
              </div>
              <p className="font-black text-3xl tracking-tight leading-none mb-2 uppercase italic">
                {isRecording ? "Detener" : "Nota Rápida"}
              </p>
              <p className="text-lg text-white/70 font-medium tracking-tight">
                {isRecording ? "Toca para terminar" : "Graba y resume al instante"}
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
               {isRecording ? <Square size={200} fill="white" /> : <Zap size={200} fill="white" />}
            </div>
          </motion.button>

          {/* Record Class - Acción Completa */}
          <Link to="/live" className="block w-full">
            <motion.div
              whileTap={{ scale: 0.96 }}
              className="w-full rounded-[40px] bg-white text-black p-8 text-left relative overflow-hidden group border border-white/10"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-3xl bg-black/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Radio size={32} className="text-black" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-3xl tracking-tight leading-none mb-2 uppercase italic">Grabar Clase</p>
                    <p className="text-lg text-black/50 font-medium tracking-tight">Análisis IA en tiempo real</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Secondary Navigation - Compacta y Elegante */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { to: "/voice", icon: Brain, label: "IA Voz", color: "bg-orange-500", text: "text-orange-400" },
            { to: "/notes", icon: FileText, label: "Notas", color: "bg-blue-500", text: "text-blue-400" },
            { to: "/chat", icon: Sparkles, label: "Chat", color: "bg-pink-500", text: "text-pink-400" },
          ].map((item) => (
            <Link key={item.label} to={item.to}>
              <motion.div 
                whileTap={{ scale: 0.92 }}
                className="bg-white/5 rounded-[32px] p-5 flex flex-col items-center justify-center border border-white/5 group hover:bg-white/10 transition-colors"
              >
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", `${item.color}/20`)}>
                  <item.icon size={24} className={item.text} />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest">{item.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* My Classes - Cards Dinámicas */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white/40">Mis Materias</h3>
            <button 
              onClick={() => setIsAddingClass(true)}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] active:scale-90 transition-transform"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
          <div className="space-y-4">
            {CLASSES.map((cls) => (
              <Link key={cls.id} to={`/class/${cls.id}`}>
                <motion.div 
                  whileTap={{ scale: 0.97 }}
                  className="bg-zinc-900 rounded-[32px] p-6 flex items-center gap-5 border border-white/5 hover:border-white/20 transition-all active:scale-95"
                >
                  <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center shrink-0">
                    <BookOpen size={28} className="text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xl uppercase italic tracking-tight truncate leading-tight">{cls.name}</p>
                    <p className="text-lg text-white/40 font-medium truncate">{cls.professor}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <ChevronRight size={20} className="text-white/20" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Tasks Row - Scroll Horizontal Elegante */}
        {upcomingTasks.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white/40">Pendientes</h3>
              <Link to="/calendar" className="text-white/40 font-bold uppercase text-xs tracking-widest border-b border-white/10 pb-1">Ver todo</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-6 px-6">
              {upcomingTasks.map((task) => (
                <div 
                  key={task.id}
                  className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 min-w-[280px] shrink-0"
                >
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-4">
                    <Clock size={24} className="text-yellow-500" />
                  </div>
                  <p className="font-black text-xl uppercase italic leading-tight mb-2 line-clamp-2">{task.title}</p>
                  <p className="text-lg text-white/40 font-bold uppercase tracking-widest text-sm">
                    {new Date(task.date).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Add Class Modal - Rediseñado */}
      <AnimatePresence>
        {isAddingClass && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-40"
              onClick={() => setIsAddingClass(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[48px] z-50 p-8 pb-12"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black uppercase italic italic">Nueva Materia</h2>
                <button onClick={() => setIsAddingClass(false)} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateClass} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-2">Nombre</label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ej. MATEMÁTICAS"
                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-xl font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-white transition-all uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-2">Profesor</label>
                  <input
                    type="text"
                    required
                    value={newClassProfessor}
                    onChange={(e) => setNewClassProfessor(e.target.value)}
                    placeholder="Nombre del Profe"
                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-xl font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-white transition-all uppercase"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newClassName.trim() || !newClassProfessor.trim()}
                  className="w-full bg-white text-black rounded-[32px] py-6 text-2xl font-black uppercase italic tracking-tight mt-6 disabled:opacity-30 active:scale-95 transition-transform"
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
