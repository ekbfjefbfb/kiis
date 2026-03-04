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
  const [tasks, setTasks] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassProfessor, setNewClassProfessor] = useState("");

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long", month: "long", day: "numeric",
  });

  useEffect(() => {
    loadRecentNotes();
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
    } catch (e) { console.error(e); }
  };

  const loadTasks = async () => {
    try {
      const stored = localStorage.getItem('user_tasks');
      if (stored) setTasks(JSON.parse(stored));
    } catch (e) { console.error(e); }
  };

  const handleQuickRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      try {
        const audioBlob = await audioService.stopAudioRecording();
        const transcript = await groqService.transcribe(audioBlob, 'es');
        await notesService.createFromTranscript(transcript, "Nota Rápida", true);
        setIsProcessing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        await loadRecentNotes();
      } catch (error) {
        console.error(error);
        setIsProcessing(false);
      }
    } else {
      const ok = await audioService.requestPermissions();
      if (!ok) return;
      try {
        await audioService.startAudioRecording();
        setIsRecording(true);
      } catch (e) { console.error(e); }
    }
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassProfessor.trim()) return;
    addClass({
      name: newClassName, professor: newClassProfessor,
      time: "Por definir", room: "Por definir", email: "", phone: "", nextTask: "", taskDate: ""
    });
    setIsAddingClass(false);
    setNewClassName("");
    setNewClassProfessor("");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-[100dvh] bg-black text-white pb-24 font-sans selection:bg-white/30">
      <div className="px-6 pt-8 pb-6 flex justify-between items-start">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-[10px] font-black text-white/40 mb-1 uppercase tracking-[0.2em]">{today}</p>
          <h1 className="text-3xl font-black tracking-tighter leading-none uppercase italic">Notdeer</h1>
        </motion.div>
        <Link to="/calendar" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
          <Calendar size={18} />
        </Link>
      </div>

      <div className="px-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={handleQuickRecord}
            whileTap={{ scale: 0.96 }}
            className={clsx(
              "rounded-[24px] p-4 text-left transition-all duration-500 relative overflow-hidden",
              isRecording ? "bg-red-600" : "bg-zinc-900 border border-white/5"
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-2">
              {isRecording ? <Square size={18} fill="currentColor" /> : <Zap size={18} className="text-emerald-400" />}
            </div>
            <p className="font-black text-base uppercase italic leading-none mb-1">Nota Rápida</p>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest leading-tight">
              {isRecording ? formatTime(recordingTime) : "CAPTURAR IDEA"}
            </p>
          </motion.button>

          <Link to="/live">
            <motion.div whileTap={{ scale: 0.96 }} className="rounded-[24px] bg-zinc-900 border border-white/5 p-4 text-left h-full">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center mb-2">
                <Radio size={18} className="text-purple-400" />
              </div>
              <p className="font-black text-base uppercase italic leading-none mb-1">Clase en Vivo</p>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest leading-tight">ANÁLISIS PROFUNDO</p>
            </motion.div>
          </Link>
        </div>

        <Link to="/chat">
          <motion.div whileTap={{ scale: 0.98 }} className="bg-white text-black rounded-[24px] p-4 flex items-center justify-between group shadow-xl active:scale-95 transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center">
                <Brain size={20} />
              </div>
              <div>
                <p className="font-black text-lg uppercase italic leading-none">Pregunta a la IA</p>
                <p className="text-[9px] text-black/40 font-bold uppercase tracking-widest">CHAT & VOZ UNIFICADO</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-black/20 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </Link>

        <section>
          <div className="flex justify-between items-end mb-3 px-1">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Materias</h3>
            <button onClick={() => setIsAddingClass(true)} className="text-white/30 hover:text-white transition-colors"><Plus size={16} /></button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {CLASSES.map((cls) => (
              <Link key={cls.id} to={`/class/${cls.id}`}>
                <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/50 rounded-xl p-3 flex items-center gap-3 border border-white/5 active:scale-95 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <BookOpen size={16} className="text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs uppercase tracking-tight truncate leading-none mb-1">{cls.name}</p>
                    <p className="text-[9px] text-white/30 font-bold uppercase truncate">{cls.professor}</p>
                  </div>
                  <ChevronRight size={12} className="text-white/10" />
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 left-6 right-6 z-40">
            <div className="bg-blue-600 rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
              <Sparkles size={18} className="animate-pulse" />
              <p className="font-black text-[10px] uppercase tracking-widest italic">La IA está pensando...</p>
            </div>
          </motion.div>
        )}
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 left-6 right-6 z-40">
            <div className="bg-emerald-600 rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
              <Zap size={18} fill="white" />
              <p className="font-black text-[10px] uppercase tracking-widest italic">Captura guardada</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingClass && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-40" onClick={() => setIsAddingClass(false)} />
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[32px] z-50 p-8 pb-12 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Nueva Materia</h2>
                <button onClick={() => setIsAddingClass(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <input type="text" required value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="NOMBRE" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase" />
                <input type="text" required value={newClassProfessor} onChange={(e) => setNewClassProfessor(e.target.value)} placeholder="PROFESOR" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase" />
                <button type="submit" className="w-full bg-white text-black rounded-xl py-4 text-lg font-black uppercase italic tracking-tight mt-2">Guardar</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
