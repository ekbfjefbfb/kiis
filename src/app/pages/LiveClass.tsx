import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, StopCircle, Radio, Brain, Calendar, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";
import { aiService } from "../../services/ai.service";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface ClassSummary {
  summary: string;
  tasks: Task[];
}

export default function LiveClassPage() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<ClassSummary | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<any>(null);

  // Auto-scroll para la transcripción de fondo
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Request Wake Lock para evitar que el teléfono se suspenda
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
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
      
      // Simulación de transcripción en tiempo real (en un entorno real usaríamos WebSockets + VAD)
      const mockInterval = setInterval(() => {
        if (!isRecording) {
          clearInterval(mockInterval);
          return;
        }
        const phrases = [
          "Explicando el contexto histórico...",
          "La importancia de este evento radica en...",
          "No olviden anotar la fecha del examen...",
          "Analizando las causas principales...",
          "El impacto social fue significativo porque..."
        ];
        setTranscript(prev => [...prev, phrases[Math.floor(Math.random() * phrases.length)]]);
      }, 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    releaseWakeLock();
    
    try {
      const audioBlob = await audioService.stopAudioRecording();
      const finalTranscript = await groqService.transcribe(audioBlob, 'es');
      
      // Enviar a IA para resumen y tareas
      const prompt = `Analiza esta transcripción de clase y genera un resumen estructurado y una lista de tareas. 
      Responde en formato JSON: { "summary": "...", "tasks": [{ "id": "1", "title": "...", "dueDate": "...", "completed": false }] }
      Transcripción: ${finalTranscript}`;
      
      let aiResponse = "";
      await aiService.chat(prompt, [], (token) => {
        aiResponse += token;
      });

      // Intentar parsear el JSON de la IA (fallback si no es JSON perfecto)
      try {
        const parsed = JSON.parse(aiResponse.substring(aiResponse.indexOf('{'), aiResponse.lastIndexOf('}') + 1));
        setSummary(parsed);
      } catch (e) {
        setSummary({
          summary: aiResponse,
          tasks: [{ id: "1", title: "Repasar notas de hoy", dueDate: "Mañana", completed: false }]
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTask = (taskId: string) => {
    if (!summary) return;
    setSummary({
      ...summary,
      tasks: summary.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    });
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative">
      {/* Transcripción de Fondo (Efecto Inmersivo) */}
      <div 
        ref={scrollRef}
        className="absolute inset-0 px-8 pt-40 pb-60 overflow-y-auto scrollbar-hide opacity-20 pointer-events-none z-0"
      >
        <div className="space-y-4">
          {transcript.map((text, i) => (
            <motion.p 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black uppercase italic leading-tight tracking-tighter"
            >
              {text}
            </motion.p>
          ))}
          {isRecording && (
            <div className="flex gap-1 items-center pt-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:0.4s]" />
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-black/60 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">Grabación</h1>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Clase en Vivo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={clsx(
            "px-3 py-1.5 rounded-full flex items-center gap-2 border transition-all",
            isRecording ? "bg-red-500/10 border-red-500/20" : "bg-zinc-900 border-white/5"
          )}>
            <div className={clsx("w-2 h-2 rounded-full", isRecording ? "bg-red-500 animate-pulse" : "bg-zinc-700")} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isRecording ? "En Vivo" : "Listo"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto scrollbar-hide z-10 p-6">
        <AnimatePresence mode="wait">
          {!summary && !isProcessing ? (
            <motion.div 
              key="recording-ui"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center space-y-12"
            >
              <div className="relative">
                {isRecording && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-white/10 rounded-full scale-150"
                  />
                )}
                <div className={`w-32 h-32 rounded-[48px] flex items-center justify-center border-2 transition-all duration-500 ${isRecording ? 'bg-white border-white' : 'bg-zinc-900 border-white/10'}`}>
                  {isRecording ? <Radio size={48} className="text-black" /> : <Mic size={48} className="text-white/40" />}
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase italic tracking-tight">
                  {isRecording ? "Escuchando Clase..." : "Iniciar Grabación"}
                </h2>
                <p className="text-xs text-white/30 font-bold uppercase tracking-widest max-w-[200px] mx-auto">
                  {isRecording ? "La transcripción se genera en tiempo real de fondo." : "Toca el botón para empezar a capturar conocimiento."}
                </p>
              </div>
            </motion.div>
          ) : isProcessing ? (
            <motion.div 
              key="processing-ui"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="h-full flex flex-col items-center justify-center space-y-6"
            >
              <Loader2 size={48} className="animate-spin text-white/20" />
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black uppercase italic tracking-tight text-white/60">Procesando Inteligencia</h2>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">Generando resumen y tareas...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="summary-ui"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-32"
            >
              {/* Sección Resumen */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Brain size={20} className="text-white/40" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Resumen de Clase</h3>
                </div>
                <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-6">
                  <p className="text-lg font-bold leading-relaxed text-white/90 italic">
                    {summary.summary}
                  </p>
                </div>
              </section>

              {/* Sección Tareas */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-white/40" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Tareas Identificadas</h3>
                </div>
                <div className="space-y-2">
                  {summary.tasks.map((task) => (
                    <motion.button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      whileTap={{ scale: 0.98 }}
                      className={clsx(
                        "w-full p-5 rounded-[24px] border flex items-center justify-between transition-all",
                        task.completed 
                          ? "bg-emerald-500/10 border-emerald-500/20" 
                          : "bg-zinc-900/60 border-white/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          task.completed ? "bg-emerald-500 border-emerald-500" : "border-white/10"
                        )}>
                          {task.completed && <CheckCircle2 size={14} className="text-black" />}
                        </div>
                        <div className="text-left">
                          <p className={clsx(
                            "text-sm font-bold uppercase italic transition-all",
                            task.completed ? "text-emerald-500 line-through" : "text-white"
                          )}>
                            {task.title}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-1">Vence: {task.dueDate}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="opacity-10" />
                    </motion.button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Action Bar */}
      <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
        <div className="max-w-md mx-auto">
          {!summary && !isProcessing && (
            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              whileTap={{ scale: 0.92 }}
              className={clsx(
                "w-full h-16 rounded-[28px] flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl font-black uppercase italic tracking-tighter",
                isRecording ? "bg-white text-black" : "bg-white text-black"
              )}
            >
              {isRecording ? (
                <>
                  <StopCircle size={24} fill="black" />
                  <span>Finalizar Clase</span>
                </>
              ) : (
                <>
                  <Mic size={24} />
                  <span>Comenzar Grabación</span>
                </>
              )}
            </motion.button>
          )}
          
          {summary && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/dashboard')}
              whileTap={{ scale: 0.92 }}
              className="w-full h-16 bg-zinc-900 border border-white/10 text-white rounded-[28px] flex items-center justify-center gap-4 shadow-2xl font-black uppercase italic tracking-tighter"
            >
              <span>Guardar en Agenda</span>
              <ChevronRight size={20} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
