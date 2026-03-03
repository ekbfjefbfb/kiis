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
      <div className="px-6 pt-8 pb-6">
        <div className="flex justify-between items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-xs font-bold text-white/40 mb-1 uppercase tracking-widest">{today}</p>
            <h1 className="text-3xl font-black tracking-tight leading-none">
              Hola,<br/>{(() => { try { const p = JSON.parse(localStorage.getItem('user_profile') || '{}'); return p.name?.split(' ')[0] || authService.getCurrentUser()?.displayName?.split(' ')[0] || 'Estudiante'; } catch { return 'Estudiante'; } })()}
            </h1>
          </motion.div>
          <Link to="/calendar" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <Calendar size={20} className="text-white" />
          </Link>
        </div>
      </div>

      <div className="px-6 space-y-8">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={handleQuickRecord}
            whileTap={{ scale: 0.96 }}
            className={clsx(
              "rounded-[32px] p-6 text-left transition-all duration-500 relative overflow-hidden group",
              isRecording ? "bg-red-600" : "bg-emerald-500"
            )}
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                {isRecording ? <Square size={24} fill="currentColor" /> : <Zap size={24} fill="white" />}
              </div>
              <p className="font-black text-xl tracking-tight uppercase italic mb-1">
                {isRecording ? "Detener" : "Nota Rápida"}
              </p>
              <p className="text-xs text-white/70 font-bold uppercase tracking-tighter">
                {isRecording ? formatTime(recordingTime) : "Graba ya"}
              </p>
            </div>
          </motion.button>

          <Link to="/live" className="block">
            <motion.div
              whileTap={{ scale: 0.96 }}
              className="rounded-[32px] bg-white text-black p-6 text-left h-full relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center mb-4">
                  <Radio size={24} className="text-black" />
                </div>
                <p className="font-black text-xl tracking-tight uppercase italic mb-1">Clase</p>
                <p className="text-xs text-black/40 font-bold uppercase tracking-tighter">IA en vivo</p>
              </div>
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { to: "/chat", icon: Brain, label: "Chat IA", color: "text-orange-400" },
            { to: "/notes", icon: FileText, label: "Notas", color: "text-blue-400" },
            { to: "/profile", icon: Sparkles, label: "Perfil", color: "text-pink-400" },
          ].map((item) => (
            <Link key={item.label} to={item.to}>
              <motion.div 
                whileTap={{ scale: 0.92 }}
                className="bg-zinc-900 rounded-[24px] p-4 flex flex-col items-center justify-center border border-white/5"
              >
                <item.icon size={20} className={clsx("mb-2", item.color)} />
                <p className="text-[10px] font-black uppercase tracking-widest">{item.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white/40 ml-1">Materias</h3>
            <button onClick={() => setIsAddingClass(true)} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center active:scale-90 transition-transform">
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
          <div className="space-y-3">
            {CLASSES.map((cls) => (
              <Link key={cls.id} to={`/class/${cls.id}`}>
                <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900 rounded-[28px] p-5 flex items-center gap-4 border border-white/5 active:scale-95">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                    <BookOpen size={22} className="text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-lg uppercase italic tracking-tight truncate leading-none mb-1">{cls.name}</p>
                    <p className="text-sm text-white/40 font-medium truncate">{cls.professor}</p>
                  </div>
                  <ChevronRight size={18} className="text-white/20" />
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isAddingClass && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-40" onClick={() => setIsAddingClass(false)} />
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[40px] z-50 p-8 pb-12 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black uppercase italic">Nueva Materia</h2>
                <button onClick={() => setIsAddingClass(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateClass} className="space-y-5">
                <input type="text" required value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="MATERIA" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-white transition-all uppercase" />
                <input type="text" required value={newClassProfessor} onChange={(e) => setNewClassProfessor(e.target.value)} placeholder="PROFESOR" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-white transition-all uppercase" />
                <button type="submit" className="w-full bg-white text-black rounded-[24px] py-5 text-xl font-black uppercase italic tracking-tight mt-4">Guardar</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
