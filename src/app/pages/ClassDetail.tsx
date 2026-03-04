import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  ArrowLeft, Brain, History, Radio, ChevronRight, Calendar, 
  Plus, Layout, BookOpen, Clock, MapPin, Mic, StopCircle, Loader2, CheckCircle2 
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
  
  // Estados de Grabación Integrada
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
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

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) { console.error(err); }
  };

  const startRecording = async () => {
    const ok = await audioService.requestPermissions();
    if (!ok) return;
    try {
      await audioService.startAudioRecording();
      setIsRecording(true);
      await requestWakeLock();
      
      const mockInterval = setInterval(() => {
        if (!isRecording) {
          clearInterval(mockInterval);
          return;
        }
        const phrases = ["Analizando conceptos_", "Capturando voz_", "Digitalizando_", "IA activa_"];
        setTranscript(prev => [...prev.slice(-3), phrases[Math.floor(Math.random() * phrases.length)]]);
      }, 3000);
    } catch (e) { console.error(e); }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    if (wakeLockRef.current) wakeLockRef.current.release();
    
    try {
      const audioBlob = await audioService.stopAudioRecording();
      const finalTranscript = await groqService.transcribe(audioBlob, 'es');
      
      const prompt = `Analiza esta clase de "${classInfo?.name}" y genera un resumen y tareas. 
      Responde JSON: { "summary": "...", "topic": "...", "tasks": [...] }
      Transcripción: ${finalTranscript}`;
      
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
      setTranscript([]);
    } catch (e) { console.error(e); } finally {
      setIsProcessing(false);
    }
  };

  if (!classInfo) return null;

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative selection:bg-white/20">
      {/* Header Brutalista */}
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 text-left">Materia</p>
            <h1 className="text-2xl font-extrabold uppercase italic tracking-tighter leading-none">{classInfo.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Live</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Arquitectura Fluida */}
      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] py-8 max-w-2xl mx-auto w-full space-y-10 pb-40">
        
        {/* Zona de Grabación Integrada - Mínima Fricción */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 ml-2 text-zinc-500">
            <Radio size={16} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Nueva_Sesión</h3>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center space-y-8 relative overflow-hidden min-h-[220px]">
            <AnimatePresence mode="wait">
              {!isProcessing ? (
                <motion.div key="rec-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 w-full">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={clsx(
                      "w-24 h-24 rounded-[32px] flex items-center justify-center border-2 transition-all duration-500 z-10",
                      isRecording ? "bg-white border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-zinc-800 border-white/5 hover:border-white/20"
                    )}
                  >
                    {isRecording ? <StopCircle size={32} fill="black" className="text-black" /> : <Mic size={32} className="text-zinc-500" />}
                  </motion.button>
                  <div className="text-center">
                    <p className="text-sm font-extrabold uppercase italic tracking-tight mb-2">
                      {isRecording ? "Grabando Clase_" : "Toca para Iniciar_"}
                    </p>
                    <div className="flex gap-1.5 justify-center h-4 overflow-hidden">
                      {transcript.map((t, i) => (
                        <motion.span key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.3, y: 0 }} className="text-[9px] font-black uppercase tracking-widest">{t}</motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="proc-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                  <Loader2 size={40} className="animate-spin text-white/20" strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">IA Estructurando_</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Acciones de Análisis */}
        <div className="grid grid-cols-1 gap-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGeneralSummary(true)}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-[32px] p-7 flex items-center justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-white/5" />
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                <Brain size={24} className="text-white/60" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-extrabold uppercase italic tracking-tight text-white leading-none">Resumen Global</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5">Síntesis inteligente</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-zinc-800 group-active:text-white" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHistory(true)}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-[32px] p-7 flex items-center justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-white/5" />
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                <History size={24} className="text-white/60" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-extrabold uppercase italic tracking-tight text-white leading-none">Historial</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5">{sessions.length} Sesiones</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-zinc-800 group-active:text-white" />
          </motion.button>
        </div>

        {/* Info Materia Compacta */}
        <section className="bg-zinc-900/20 border border-white/5 rounded-[36px] p-8 grid grid-cols-2 gap-8 shadow-inner">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Profesor</p>
            <p className="text-sm font-extrabold uppercase italic truncate">{classInfo.professor}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Aula</p>
            <p className="text-sm font-extrabold uppercase italic truncate">{classInfo.room || "—"}</p>
          </div>
        </section>
      </main>

      {/* Modales Inmersivos */}
      <AnimatePresence>
        {showGeneralSummary && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-12">
                <h2 className="text-4xl font-extrabold uppercase italic tracking-tighter">Global_</h2>
                <button onClick={() => setShowGeneralSummary(false)} className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center"><Plus size={28} className="rotate-45" /></button>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-white/5" />
                <p className="text-2xl font-bold leading-relaxed text-white/90 italic tracking-tight">
                  {sessions.length > 0 ? "Consolidado inteligente de toda la materia. Analizando temas clave y objetivos alcanzados." : "Sin datos suficientes."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {showHistory && (
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} className="fixed inset-0 z-50 bg-black flex flex-col p-6 pt-[max(env(safe-area-inset-top,2rem),4rem)]">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex justify-between items-start mb-12">
                <h2 className="text-4xl font-extrabold uppercase italic tracking-tighter">Archivo_</h2>
                <button onClick={() => setShowHistory(false)} className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center"><Plus size={28} className="rotate-45" /></button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
                {sessions.map((s) => (
                  <div key={s.id} className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 space-y-4">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{s.date}</p>
                    <p className="text-xl font-extrabold uppercase italic text-white leading-none">{s.topic || "Sesión"}</p>
                    <p className="text-sm text-zinc-400 italic line-clamp-3 leading-relaxed">{s.summary}</p>
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
