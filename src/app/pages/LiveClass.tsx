import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, StopCircle, Brain, Calendar, CheckCircle2, ChevronRight, Loader2, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";
import { aiService } from "../../services/ai.service";
import { CLASSES } from "../data/mock";

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

export default function LiveClassPage() {
  const navigate = useNavigate();
  const { classId: urlClassId } = useParams();
  
  const [selectedClass, setSelectedClass] = useState(() => 
    CLASSES.find(c => c.id === urlClassId) || null
  );
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionResult, setSessionResult] = useState<ClassSession | null>(null);
  const [showClassPicker, setShowClassPicker] = useState(!urlClassId);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) { console.error("Wake Lock error:", err); }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const startRecording = async () => {
    if (!selectedClass) {
      setShowClassPicker(true);
      return;
    }
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
        const phrases = [
          "Definiendo los conceptos clave...",
          "Importante para el proyecto final...",
          "La estructura se basa en...",
          "No olviden la entrega de la próxima semana...",
          "Este punto vendrá en el examen...",
          "Analizando la evolución de la materia...",
          "Comparando diferentes teorías actuales..."
        ];
        setTranscript(prev => [...prev, phrases[Math.floor(Math.random() * phrases.length)]]);
      }, 3500);
    } catch (e) { console.error("Recording error:", e); }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    releaseWakeLock();
    
    try {
      const audioBlob = await audioService.stopAudioRecording();
      const finalTranscript = await groqService.transcribe(audioBlob, 'es');
      
      const prompt = `Analiza esta clase de "${selectedClass?.name}" y genera un resumen estructurado y tareas. 
      Responde en formato JSON puro: { "summary": "...", "topic": "Título breve del tema", "tasks": [{ "id": "uuid", "title": "...", "dueDate": "...", "completed": false }] }
      Transcripción: ${finalTranscript}`;
      
      let aiResponse = "";
      await aiService.chat(prompt, [], (token) => { aiResponse += token; });

      try {
        const jsonStr = aiResponse.substring(aiResponse.indexOf('{'), aiResponse.lastIndexOf('}') + 1);
        const parsed = JSON.parse(jsonStr);
        
        const newSession: ClassSession = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          topic: parsed.topic,
          summary: parsed.summary,
          tasks: parsed.tasks
        };
        
        setSessionResult(newSession);
        saveSessionToHistory(newSession);
      } catch (e) {
        const fallbackSession: ClassSession = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          topic: "Resumen de Clase",
          summary: aiResponse,
          tasks: [{ id: "1", title: "Repasar conceptos de hoy", dueDate: "Mañana", completed: false }]
        };
        setSessionResult(fallbackSession);
        saveSessionToHistory(fallbackSession);
      }
    } catch (e) { console.error("Processing error:", e); } finally {
      setIsProcessing(false);
    }
  };

  const saveSessionToHistory = (session: ClassSession) => {
    if (!selectedClass) return;
    const historyKey = `class_history_${selectedClass.id}`;
    const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
    localStorage.setItem(historyKey, JSON.stringify([...existing, session]));
  };

  const toggleTask = (taskId: string) => {
    if (!sessionResult) return;
    setSessionResult({
      ...sessionResult,
      tasks: sessionResult.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    });
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative selection:bg-white/20">
      <div ref={scrollRef} className="absolute inset-0 px-8 pt-48 pb-60 overflow-y-auto scrollbar-hide opacity-[0.08] pointer-events-none z-0">
        <div className="space-y-6">
          {transcript.map((text, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black uppercase italic leading-none tracking-tighter">{text}</motion.p>
          ))}
        </div>
      </div>

      <header className="px-6 pt-[env(safe-area-inset-top,3rem)] pb-6 flex justify-between items-center bg-black/60 backdrop-blur-xl border-b border-white/5 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">{selectedClass ? selectedClass.name : "Nueva Sesión"}</h1>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1.5">{isRecording ? "Capturando_Transcribiendo" : "Grabación Inteligente"}</p>
          </div>
        </div>
        {selectedClass && !isRecording && (
          <button onClick={() => setShowClassPicker(true)} className="px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 active:scale-95">Cambiar</button>
        )}
      </header>

      <AnimatePresence>
        {showClassPicker && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute inset-0 z-50 bg-black flex flex-col p-6 pt-20">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Materia</h2>
              <button onClick={() => selectedClass && setShowClassPicker(false)} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center"><Plus size={24} className="rotate-45" /></button>
            </div>
            <div className="space-y-3 overflow-y-auto scrollbar-hide flex-1">
              {CLASSES.map((cls) => (
                <button key={cls.id} onClick={() => { setSelectedClass(cls); setShowClassPicker(false); }} className="w-full p-6 rounded-[28px] bg-zinc-900/40 border border-white/5 flex items-center justify-between text-left active:bg-zinc-800 transition-all">
                  <div>
                    <p className="text-xl font-black uppercase italic tracking-tight leading-none mb-1.5">{cls.name}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{cls.professor}</p>
                  </div>
                  <ChevronRight size={20} className="text-white/10" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto scrollbar-hide z-10 p-6 relative">
        <AnimatePresence mode="wait">
          {!sessionResult && !isProcessing ? (
            <motion.div key="recording-zone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center space-y-16">
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute w-full h-full bg-white/5 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }} className="absolute w-full h-full bg-white/10 rounded-full" />
                  </div>
                )}
                <motion.button whileTap={{ scale: 0.9 }} onClick={isRecording ? stopRecording : startRecording} className={`w-40 h-40 rounded-[56px] flex items-center justify-center border-2 transition-all duration-700 shadow-2xl z-10 relative ${isRecording ? 'bg-white border-white' : 'bg-zinc-900 border-white/10'}`}>
                  {isRecording ? <StopCircle size={64} fill="black" className="text-black" /> : <Mic size={64} className="text-white/40" />}
                </motion.button>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{isRecording ? "Capturando" : "Empezar"}</h2>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] max-w-[240px] mx-auto leading-relaxed">{isRecording ? "Transcripción activa en segundo plano. No cierres la app." : "Convierte la voz del profesor en notas inteligentes."}</p>
              </div>
            </motion.div>
          ) : isProcessing ? (
            <motion.div key="processing-zone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center space-y-10">
              <Loader2 size={72} className="animate-spin text-white/10" strokeWidth={1} />
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white/60">Procesando</h2>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">IA Generando Resumen</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="result-zone" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-48">
              <section className="space-y-6">
                <div className="flex items-center gap-3 ml-2"><div className="w-2 h-2 bg-white rounded-full" /><h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-white/30">Síntesis</h3></div>
                <div className="bg-zinc-900/40 border border-white/5 rounded-[36px] p-8 shadow-2xl relative overflow-hidden group"><div className="absolute top-0 left-0 w-1 h-full bg-white/5" /><p className="text-2xl font-bold leading-tight text-white/90 italic tracking-tight">{sessionResult.summary}</p></div>
              </section>
              <section className="space-y-6">
                <div className="flex items-center gap-3 ml-2"><div className="w-2 h-2 bg-white/30 rounded-full" /><h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-white/30">Tareas_Agenda</h3></div>
                <div className="space-y-3">
                  {sessionResult.tasks.map((task) => (
                    <motion.button key={task.id} onClick={() => toggleTask(task.id)} whileTap={{ scale: 0.98 }} className={clsx("w-full p-7 rounded-[32px] border flex items-center justify-between transition-all duration-500", task.completed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-zinc-900/60 border-white/5 shadow-lg")}>
                      <div className="flex items-center gap-6">
                        <div className={clsx("w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500", task.completed ? "bg-emerald-500 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "border-white/10")}>{task.completed && <CheckCircle2 size={18} className="text-black" />}</div>
                        <div className="text-left"><p className={clsx("text-lg font-black uppercase italic transition-all tracking-tighter", task.completed ? "text-emerald-500/50 line-through" : "text-white")}>{task.title}</p><div className="flex items-center gap-2 mt-2"><Calendar size={12} className="text-white/20" /><p className="text-[10px] font-black uppercase tracking-widest text-white/20">{task.dueDate}</p></div></div>
                      </div>
                      {!task.completed && <ChevronRight size={20} className="text-white/5" />}
                    </motion.button>
                  ))}
                </div>
              </section>
              <motion.button onClick={() => navigate(`/class/${selectedClass?.id}`)} whileTap={{ scale: 0.95 }} className="w-full h-20 bg-white text-black rounded-[40px] font-black uppercase italic tracking-tighter text-xl shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center justify-center gap-4 active:bg-zinc-200 transition-colors"><span>Ver Materia</span><CheckCircle2 size={28} /></motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
