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

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${((s % 60).toString().padStart(2, "0"))}`;

  return (
    <div className="min-h-[100dvh] bg-black text-white pb-24 font-sans selection:bg-white/30 overflow-x-hidden">
      {/* Header Compacto - Mobile Scaled */}
      <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-black/80 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Notdeer</h1>
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">{today}</p>
        </motion.div>
        <Link to="/calendar" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
          <Calendar size={16} />
        </Link>
      </div>

      <div className="px-5 space-y-5 pt-4">
        {/* Acciones de Valor - Escala Compacta */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={handleQuickRecord}
            whileTap={{ scale: 0.96 }}
            className={clsx(
              "rounded-[20px] p-4 text-left transition-all duration-500 relative overflow-hidden",
              isRecording ? "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]" : "bg-zinc-900 border border-white/5"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-2">
              {isRecording ? <Square size={16} fill="currentColor" /> : <Zap size={16} className="text-emerald-400" />}
            </div>
            <p className="font-black text-sm uppercase italic leading-tight">Nota Rápida</p>
            <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
              {isRecording ? formatTime(recordingTime) : "CAPTURAR IDEA"}
            </p>
          </motion.button>

          <Link to="/live">
            <motion.div whileTap={{ scale: 0.96 }} className="rounded-[20px] bg-zinc-900 border border-white/5 p-4 text-left h-full active:bg-zinc-800 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2">
                <Radio size={16} className="text-purple-400" />
              </div>
              <p className="font-black text-sm uppercase italic leading-tight">Clase en Vivo</p>
              <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-0.5">ANÁLISIS IA</p>
            </motion.div>
          </Link>
        </div>

        {/* IA Unificada - Foco del valor */}
        <Link to="/chat">
          <motion.div whileTap={{ scale: 0.98 }} className="bg-white text-black rounded-[20px] p-4 flex items-center justify-between group active:scale-95 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center">
                <Brain size={18} />
              </div>
              <div>
                <p className="font-black text-base uppercase italic leading-none">Asistente IA</p>
                <p className="text-[8px] text-black/40 font-bold uppercase tracking-widest mt-1">CHAT & VOZ UNIFICADO</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-black/20" />
          </motion.div>
        </Link>

        {/* Listado de Materias - Compacto */}
        <section className="pt-2">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Mis Materias</h3>
            <button onClick={() => setIsAddingClass(true)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 active:scale-90 transition-transform"><Plus size={14} /></button>
          </div>
          <div className="space-y-2">
            {CLASSES.map((cls) => (
              <Link key={cls.id} to={`/class/${cls.id}`}>
                <motion.div whileTap={{ scale: 0.98 }} className="bg-zinc-900/40 rounded-xl p-3 flex items-center gap-3 border border-white/5 active:bg-zinc-800 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <BookOpen size={14} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] uppercase tracking-tight truncate leading-none mb-1">{cls.name}</p>
                    <p className="text-[9px] text-white/20 font-bold uppercase truncate">{cls.professor}</p>
                  </div>
                  <ChevronRight size={10} className="text-white/10" />
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Overlays de Estado */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-20 left-4 right-4 z-40">
            <div className="bg-blue-600 rounded-xl p-3 flex items-center gap-2 shadow-2xl">
              <Loader2 size={14} className="animate-spin" />
              <p className="font-black text-[9px] uppercase tracking-widest italic">La IA está analizando...</p>
            </div>
          </motion.div>
        )}
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-20 left-4 right-4 z-40">
            <div className="bg-emerald-600 rounded-xl p-3 flex items-center gap-2 shadow-2xl">
              <Zap size={14} fill="white" />
              <p className="font-black text-[9px] uppercase tracking-widest italic">Nota guardada</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nueva Materia - Fit Móvil */}
      <AnimatePresence>
        {isAddingClass && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-40" onClick={() => setIsAddingClass(false)} />
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[24px] z-50 p-6 pb-10 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Nueva Materia</h2>
                <button onClick={() => setIsAddingClass(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateClass} className="space-y-3">
                <input type="text" required value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="NOMBRE" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase" />
                <input type="text" required value={newClassProfessor} onChange={(e) => setNewClassProfessor(e.target.value)} placeholder="PROFESOR" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase" />
                <button type="submit" className="w-full bg-white text-black rounded-xl py-3.5 text-base font-black uppercase italic tracking-tight mt-2 active:scale-95 transition-transform">Guardar</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
