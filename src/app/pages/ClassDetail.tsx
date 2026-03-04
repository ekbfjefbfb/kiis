import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  ArrowLeft, Brain, History, Radio, ChevronRight, Calendar, 
  Plus, Layout, BookOpen, Clock, MapPin, Mic, StopCircle, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { CLASSES } from "../data/mock";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";
import { aiService } from "../../services/ai.service";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface ClassSession {
  id: string;
  date: string;
  summary: string;
  tasks: Task[];
  topic?: string;
}

export default function ClassDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showGeneralSummary, setShowGeneralSummary] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const wakeLockRef = useRef<any>(null);

  const classInfo = CLASSES.find((c) => c.id === classId);

  useEffect(() => {
    if (classId) {
      loadHistory();
    }
  }, [classId]);

  const loadHistory = () => {
    const historyKey = `class_history_${classId}`;
    const savedSessions = JSON.parse(localStorage.getItem(historyKey) || "[]");
    setSessions([...savedSessions].reverse());
  };

  const startRecording = async () => {
    const ok = await audioService.requestPermissions();
    if (!ok) return;
    try {
      await audioService.startAudioRecording();
      setIsRecording(true);
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (e) { console.error(e); }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    if (wakeLockRef.current) wakeLockRef.current.release();
    
    try {
      const audioBlob = await audioService.stopAudioRecording();
      const text = await groqService.transcribe(audioBlob, 'es');
      
      const prompt = `Analiza esta clase de "${classInfo?.name}" y genera un resumen y tareas. 
      Responde JSON: { "summary": "...", "topic": "...", "tasks": [] }
      Transcripción: ${text}`;
      
      let aiResponse = "";
      await aiService.chat(prompt, [], (token) => { aiResponse += token; });

      const jsonStr = aiResponse.substring(aiResponse.indexOf('{'), aiResponse.lastIndexOf('}') + 1);
      const parsed = JSON.parse(jsonStr);
      
      const newSession: ClassSession = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        topic: parsed.topic,
        summary: parsed.summary,
        tasks: parsed.tasks || []
      };
      
      const historyKey = `class_history_${classId}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      localStorage.setItem(historyKey, JSON.stringify([...existing, newSession]));
      loadHistory();
    } catch (e) { console.error(e); } finally {
      setIsProcessing(false);
    }
  };

  if (!classInfo) return null;

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative selection:bg-white/20">
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1 text-left">Materia_</p>
            <h1 className="text-xl font-extrabold uppercase italic tracking-tighter leading-none">{classInfo.name}</h1>
          </div>
        </div>
        {isRecording && (
          <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Live_</span>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] py-8 max-w-2xl mx-auto w-full space-y-8 pb-32">
        
        {/* Grabación Integrada */}
        <section className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-7 flex flex-col items-center justify-center space-y-6 relative overflow-hidden min-h-[180px]">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-white/20" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Estructurando_</p>
              </motion.div>
            ) : (
              <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 w-full">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={clsx(
                    "w-20 h-20 rounded-[28px] flex items-center justify-center border transition-all duration-500",
                    isRecording ? "bg-white border-white shadow-xl" : "bg-zinc-800 border-white/5 hover:border-white/10"
                  )}
                >
                  {isRecording ? <StopCircle size={28} fill="black" className="text-black" /> : <Mic size={28} className="text-zinc-600" />}
                </motion.button>
                <p className="text-[10px] font-extrabold uppercase italic tracking-widest text-zinc-500">
                  {isRecording ? "Grabando Sesión_" : "Nueva Grabación_"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Acciones */}
        <div className="grid grid-cols-1 gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGeneralSummary(true)}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-[28px] p-6 flex items-center justify-between group relative overflow-hidden"
          >
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                <Brain size={20} className="text-white/60" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-extrabold uppercase italic tracking-tight text-white leading-none">Resumen Global</h3>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Análisis de la materia</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-800" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHistory(true)}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-[28px] p-6 flex items-center justify-between group relative overflow-hidden"
          >
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                <History size={20} className="text-white/60" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-extrabold uppercase italic tracking-tight text-white leading-none">Historial</h3>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{sessions.length} Sesiones</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-800" />
          </motion.button>
        </div>

        {/* Detalles */}
        <section className="bg-zinc-900/20 border border-white/5 rounded-[28px] p-6 grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Profesor_</p>
            <p className="text-xs font-extrabold uppercase italic truncate">{classInfo.professor}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Aula_</p>
            <p className="text-xs font-extrabold uppercase italic truncate">{classInfo.room || "—"}</p>
          </div>
        </section>
      </main>

      {/* Modales */}
      <AnimatePresence>
        {showGeneralSummary && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-20">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-3xl font-extrabold uppercase italic tracking-tighter">Global_</h2>
                <button onClick={() => setShowGeneralSummary(false)} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center"><Plus size={24} className="rotate-45" /></button>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-8">
                <p className="text-lg font-bold leading-relaxed text-zinc-300 italic">
                  {sessions.length > 0 ? "Consolidado de todas las clases grabadas. Analizando patrones y conceptos fundamentales." : "Sin datos suficientes para análisis."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {showHistory && (
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-20">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-3xl font-extrabold uppercase italic tracking-tighter">Archivo_</h2>
                <button onClick={() => setShowHistory(false)} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center"><Plus size={24} className="rotate-45" /></button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
                {sessions.map((s) => (
                  <div key={s.id} className="bg-zinc-900/40 border border-white/5 rounded-[28px] p-6 space-y-3">
                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{s.date}</p>
                    <p className="text-lg font-extrabold uppercase italic text-white leading-none">{s.topic || "Sesión"}</p>
                    <p className="text-xs text-zinc-500 italic leading-relaxed line-clamp-3">{s.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
