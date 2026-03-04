import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, StopCircle, Radio, Brain, Calendar, CheckCircle2, ChevronRight, Loader2, ListTodo, Plus } from "lucide-react";
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
}

interface PersistentClassData {
  classId: string;
  className: string;
  sessions: ClassSession[];
}

export default function LiveClassPage() {
  const navigate = useNavigate();
  const { classId: urlClassId } = useParams();
  
  // Selección de materia inicial o desde URL
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
    } catch (err) { console.error(err); }
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
          "Este punto vendrá en el examen..."
        ];
        setTranscript(prev => [...prev, phrases[Math.floor(Math.random() * phrases.length)]]);
      }, 4000);
    } catch (e) { console.error(e); }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    releaseWakeLock();
    
    try {
      const audioBlob = await audioService.stopAudioRecording();
      const finalTranscript = await groqService.transcribe(audioBlob, 'es');
      
      const prompt = `Analiza esta clase de "${selectedClass?.name}" y genera un resumen estructurado y tareas. 
      Responde en formato JSON puro: { "summary": "...", "tasks": [{ "id": "uuid", "title": "...", "dueDate": "...", "completed": false }] }
      Transcripción: ${finalTranscript}`;
      
      let aiResponse = "";
      await aiService.chat(prompt, [], (token) => { aiResponse += token; });

      try {
        const jsonStr = aiResponse.substring(aiResponse.indexOf('{'), aiResponse.lastIndexOf('}') + 1);
        const parsed = JSON.parse(jsonStr);
        
        const newSession: ClassSession = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          summary: parsed.summary,
          tasks: parsed.tasks
        };
        
        setSessionResult(newSession);
        saveSessionToHistory(newSession);
      } catch (e) {
        const fallbackSession: ClassSession = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          summary: aiResponse,
          tasks: [{ id: "1", title: "Repasar conceptos de hoy", dueDate: "Mañana", completed: false }]
        };
        setSessionResult(fallbackSession);
        saveSessionToHistory(fallbackSession);
      }
    } catch (e) { console.error(e); } finally {
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
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative">
      {/* Background Real-time Transcription */}
      <div 
        ref={scrollRef}
        className="absolute inset-0 px-8 pt-48 pb-60 overflow-y-auto scrollbar-hide opacity-10 pointer-events-none z-0"
      >
        <div className="space-y-6">
          {transcript.map((text, i) => (
            <motion.p 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black uppercase italic leading-none tracking-tighter"
            >
              {text}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-black/60 backdrop-blur-xl border-b border-white/5 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">
              {selectedClass ? selectedClass.name : "Clase en Vivo"}
            </h1>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">
              {isRecording ? "Capturando..." : "Grabación Inteligente"}
            </p>
          </div>
        </div>
        {selectedClass && (
          <button onClick={() => setShowClassPicker(true)} className="px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
            Cambiar
          </button>
        )}
      </header>

      {/* Selector de Materia */}
      <AnimatePresence>
        {showClassPicker && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-0 z-50 bg-black flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Selecciona Materia</h2>
              <button onClick={() => selectedClass && setShowClassPicker(false)} className="text-white/40"><Plus size={24} className="rotate-45" /></button>
            </div>
            <div className="space-y-3 overflow-y-auto scrollbar-hide">
              {CLASSES.map((cls) => (
                <button 
                  key={cls.id}
                  onClick={() => { setSelectedClass(cls); setShowClassPicker(false); }}
                  className="w-full p-5 rounded-[24px] bg-zinc-900/50 border border-white/5 flex items-center justify-between text-left active:bg-zinc-800 transition-all"
                >
                  <div>
                    <p className="text-lg font-black uppercase italic tracking-tight leading-none">{cls.name}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase mt-1 tracking-widest">{cls.professor}</p>
                  </div>
                  <ChevronRight size={18} className="text-white/10" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main UI */}
      <main className="flex-1 overflow-y-auto scrollbar-hide z-10 p-6 relative">
        <AnimatePresence mode="wait">
          {!sessionResult && !isProcessing ? (
            <motion.div 
              key="recording-zone"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center space-y-16"
            >
              <div className="relative">
                {isRecording && (
                  <>
                    <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-white/5 rounded-full scale-150" />
                    <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="absolute inset-0 bg-white/10 rounded-full" />
                  </>
                )}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-36 h-36 rounded-[48px] flex items-center justify-center border-2 transition-all duration-700 shadow-2xl z-10 relative ${isRecording ? 'bg-white border-white' : 'bg-zinc-900 border-white/10'}`}
                >
                  {isRecording ? <StopCircle size={56} fill="black" className="text-black" /> : <Mic size={56} className="text-white/40" />}
                </motion.button>
              </div>
              
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                  {isRecording ? "Capturando..." : "Presiona para grabar"}
                </h2>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] max-w-[220px] mx-auto leading-relaxed">
                  {isRecording ? "La IA transcribe y analiza en segundo plano aunque bloquees el móvil." : "Convierte cada palabra del profesor en conocimiento estructurado."}
                </p>
              </div>
            </motion.div>
          ) : isProcessing ? (
            <motion.div 
              key="processing-zone"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="h-full flex flex-col items-center justify-center space-y-8"
            >
              <Loader2 size={64} className="animate-spin text-white/10" strokeWidth={1} />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white/60">Análisis Inteligente</h2>
                <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em]">Estructurando resumen y tareas...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result-zone"
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10 pb-40"
            >
              {/* Resumen */}
              <section className="space-y-5">
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-1.5 h-4 bg-white rounded-full" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Resumen de Clase</h3>
                </div>
                <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 shadow-2xl">
                  <p className="text-xl font-bold leading-tight text-white/90 italic tracking-tight">
                    {sessionResult.summary}
                  </p>
                </div>
              </section>

              {/* Tareas */}
              <section className="space-y-5">
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-1.5 h-4 bg-white/20 rounded-full" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Tareas y Entregas</h3>
                </div>
                <div className="space-y-3">
                  {sessionResult.tasks.map((task) => (
                    <motion.button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      whileTap={{ scale: 0.98 }}
                      className={clsx(
                        "w-full p-6 rounded-[28px] border flex items-center justify-between transition-all duration-500",
                        task.completed 
                          ? "bg-emerald-500/10 border-emerald-500/20" 
                          : "bg-zinc-900/60 border-white/5 shadow-lg"
                      )}
                    >
                      <div className="flex items-center gap-5">
                        <div className={clsx(
                          "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                          task.completed ? "bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "border-white/10"
                        )}>
                          {task.completed && <CheckCircle2 size={16} className="text-black" />}
                        </div>
                        <div className="text-left">
                          <p className={clsx(
                            "text-[15px] font-black uppercase italic transition-all tracking-tight",
                            task.completed ? "text-emerald-500/60 line-through" : "text-white"
                          )}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Calendar size={10} className="text-white/20" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{task.dueDate}</p>
                          </div>
                        </div>
                      </div>
                      {!task.completed && <ChevronRight size={16} className="text-white/5" />}
                    </motion.button>
                  ))}
                </div>
              </section>

              <motion.button
                onClick={() => navigate('/dashboard')}
                whileTap={{ scale: 0.95 }}
                className="w-full h-16 bg-white text-black rounded-[32px] font-black uppercase italic tracking-tighter text-lg shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
              >
                <span>Finalizar y Salir</span>
                <CheckCircle2 size={24} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
