import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, StopCircle, Brain, Calendar, CheckCircle2, ChevronRight, Loader2, Plus, BookOpen } from "lucide-react";
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
  
  // Si viene de una materia, la preselecciona, si no, es null
  const [selectedClass, setSelectedClass] = useState(() => 
    CLASSES.find(c => c.id === urlClassId) || null
  );
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionResult, setSessionResult] = useState<ClassSession | null>(null);
  const [showSavePicker, setShowSavePicker] = useState(false);
  
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
          "Capturando puntos clave...",
          "Analizando contexto...",
          "Registrando ideas principales...",
          "IA escuchando clase...",
          "Procesando voz a texto..."
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
      
      const prompt = `Analiza esta clase y genera un resumen estructurado y tareas. 
      Responde en formato JSON puro: { "summary": "...", "topic": "Título breve", "tasks": [{ "id": "uuid", "title": "...", "dueDate": "...", "completed": false }] }
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
        // Si no hay materia seleccionada, pedimos que elija una para guardar
        if (!selectedClass) {
          setShowSavePicker(true);
        } else {
          saveSessionToHistory(newSession, selectedClass.id);
        }
      } catch (e) {
        const fallbackSession: ClassSession = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          topic: "Resumen de Clase",
          summary: aiResponse,
          tasks: [{ id: "1", title: "Repasar conceptos", dueDate: "Mañana", completed: false }]
        };
        setSessionResult(fallbackSession);
        if (!selectedClass) {
          setShowSavePicker(true);
        } else {
          saveSessionToHistory(fallbackSession, selectedClass.id);
        }
      }
    } catch (e) { console.error("Processing error:", e); } finally {
      setIsProcessing(false);
    }
  };

  const saveSessionToHistory = (session: ClassSession, classId: string) => {
    const historyKey = `class_history_${classId}`;
    const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
    localStorage.setItem(historyKey, JSON.stringify([...existing, session]));
  };

  const handleFinalize = (classId: string) => {
    if (sessionResult) {
      saveSessionToHistory(sessionResult, classId);
      navigate(`/class/${classId}`);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative selection:bg-white/20">
      {/* Fondo Transcripción Inmersiva */}
      <div ref={scrollRef} className="absolute inset-0 px-8 pt-48 pb-60 overflow-y-auto scrollbar-hide opacity-[0.05] pointer-events-none z-0">
        <div className="space-y-6">
          {transcript.map((text, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black uppercase italic leading-none tracking-tighter">{text}</motion.p>
          ))}
        </div>
      </div>

      <header className="px-6 pt-[env(safe-area-inset-top,3rem)] pb-6 flex justify-between items-center bg-black/60 backdrop-blur-xl border-b border-white/5 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-lg text-white/60"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">Grabación</h1>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1.5">{selectedClass ? selectedClass.name : "Agilidad Brutal"}</p>
          </div>
        </div>
        {isRecording && (
          <div className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Rec</span>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide z-10 p-6 relative">
        <AnimatePresence mode="wait">
          {!sessionResult && !isProcessing ? (
            <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center space-y-16">
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute w-full h-full bg-white/5 rounded-full" />
                  </div>
                )}
                <motion.button whileTap={{ scale: 0.9 }} onClick={isRecording ? stopRecording : startRecording} className={`w-40 h-40 rounded-[56px] flex items-center justify-center border-2 transition-all duration-700 shadow-2xl z-10 relative ${isRecording ? 'bg-white border-white' : 'bg-zinc-900 border-white/10'}`}>
                  {isRecording ? <StopCircle size={64} fill="black" className="text-black" /> : <Mic size={64} className="text-white/40" />}
                </motion.button>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{isRecording ? "Capturando" : "Toca para grabar"}</h2>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] max-w-[240px] mx-auto leading-relaxed">No te preocupes por la materia ahora. Solo graba y clasifica al final.</p>
              </div>
            </motion.div>
          ) : isProcessing ? (
            <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center space-y-10">
              <Loader2 size={72} className="animate-spin text-white/10" strokeWidth={1} />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white/60">Estructurando</h2>
            </motion.div>
          ) : (
            <motion.div key="res" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-48">
              <section className="space-y-6">
                <div className="flex items-center gap-3 ml-2 text-white/30"><Brain size={18} /><h3 className="text-[11px] font-black uppercase tracking-[0.5em]">Síntesis</h3></div>
                <div className="bg-zinc-900/40 border border-white/5 rounded-[36px] p-10 shadow-2xl relative overflow-hidden"><div className="absolute top-0 left-0 w-1.5 h-full bg-white/5" /><p className="text-2xl font-bold leading-tight text-white/90 italic tracking-tight">{sessionResult.summary}</p></div>
              </section>
              {selectedClass && (
                <motion.button onClick={() => navigate(`/class/${selectedClass.id}`)} whileTap={{ scale: 0.95 }} className="w-full h-20 bg-white text-black rounded-[40px] font-black uppercase italic tracking-tighter text-xl shadow-2xl flex items-center justify-center gap-4 transition-all"><span>Guardar en {selectedClass.name}</span><CheckCircle2 size={28} /></motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Picker de Materia al Final (Agilidad Brutal) */}
      <AnimatePresence>
        {showSavePicker && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed inset-0 z-[100] bg-black flex flex-col p-6 pt-24">
            <div className="flex justify-between items-center mb-12">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">Clasificación</p>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">¿A qué materia pertenece?</h2>
              </div>
            </div>
            <div className="space-y-3 overflow-y-auto scrollbar-hide flex-1">
              {CLASSES.map((cls) => (
                <button key={cls.id} onClick={() => handleFinalize(cls.id)} className="w-full p-8 rounded-[36px] bg-zinc-900/40 border border-white/5 flex items-center justify-between text-left active:bg-zinc-800 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 text-zinc-600"><BookOpen size={24} /></div>
                    <p className="text-2xl font-black uppercase italic tracking-tight leading-none text-zinc-200">{cls.name}</p>
                  </div>
                  <ChevronRight size={24} className="text-zinc-800" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
