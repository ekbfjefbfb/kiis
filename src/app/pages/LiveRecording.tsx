import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, StopCircle, Loader2, Sparkles, 
  Mic, BookOpen, ChevronRight, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";
import { aiService } from "../../services/ai.service";
import { CLASSES } from "../data/mock";

interface SessionResult {
  topic: string;
  summary: string;
  tasks: Array<{ id: string; title: string; dueDate: string; completed: boolean }>;
}

export default function LiveRecording() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    startRecording();
    return () => {
      if (isRecording) stopRecording();
    };
  }, []);

  const startRecording = async () => {
    const ok = await audioService.requestPermissions();
    if (!ok) {
      navigate(-1);
      return;
    }
    try {
      await audioService.startAudioRecording();
      setIsRecording(true);
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (e) {
      console.error(e);
      navigate(-1);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    if (wakeLockRef.current) wakeLockRef.current.release();
    
    try {
      const audioBlob = await audioService.stopAudioRecording();
      const text = await groqService.transcribe(audioBlob, 'es');
      
      const prompt = `Analiza esta clase y genera un resumen y tareas. 
      Responde JSON: { "summary": "...", "topic": "...", "tasks": [{"id": "uuid", "title": "...", "dueDate": "...", "completed": false}] }
      Transcripción: ${text}`;
      
      let aiResponse = "";
      await aiService.chat(prompt, [], (token) => { aiResponse += token; });

      const jsonStr = aiResponse.substring(aiResponse.indexOf('{'), aiResponse.lastIndexOf('}') + 1);
      const parsed = JSON.parse(jsonStr);
      setResult(parsed);
      setShowClassSelector(true);
    } catch (e) { 
      console.error(e); 
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToClass = (classId: string) => {
    if (!result) return;
    const newSession = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      topic: result.topic,
      summary: result.summary,
      tasks: result.tasks
    };
    const historyKey = `class_history_${classId}`;
    const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
    localStorage.setItem(historyKey, JSON.stringify([...existing, newSession]));
    navigate(`/class/${classId}`);
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center overflow-hidden" style={{ backgroundColor: '#000000' }}>
      <header className="w-full max-w-2xl px-8 pt-16 pb-8 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-30 shrink-0">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-zinc-400" />
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`} />
          <h1 className="text-sm font-black uppercase italic tracking-[0.2em]">
            {isRecording ? 'Capturando_' : isProcessing ? 'Sintetizando_' : 'Terminal_'}
          </h1>
        </div>
        <div className="w-12" />
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center px-8 relative overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {isRecording && (
            <motion.div 
              key="recording"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center gap-16"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-white/5 rounded-[60px] blur-3xl" />
                <button 
                  onClick={stopRecording}
                  className="relative w-48 h-48 rounded-[64px] bg-white flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.2)] active:scale-[0.95] transition-all"
                >
                  <StopCircle size={64} className="text-black" fill="currentColor" />
                </button>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Graba_Ahora_</h2>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.5em] animate-pulse">Escuchando_Terminal_</p>
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-10"
            >
              <Loader2 size={64} className="text-white animate-spin" strokeWidth={1.5} />
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Procesando_</h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">IA_Neural_Engine_Sync_</p>
              </div>
            </motion.div>
          )}

          {result && showClassSelector && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-12 py-10"
            >
              <div className="bg-zinc-900/40 border border-white/[0.03] rounded-[48px] p-10 space-y-8 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-zinc-400">Análisis_Global_</span>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-tight text-white">{result.topic}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed italic opacity-80">{result.summary}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-zinc-600 px-4">
                  <Zap size={14} className="opacity-40" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.6em]">Asignar_Materia_</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {CLASSES.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => saveToClass(cls.id)}
                      className="w-full bg-zinc-900/30 border border-white/[0.03] p-6 rounded-[36px] flex items-center justify-between group active:bg-zinc-800/40 transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-[18px] bg-zinc-900/50 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                          <BookOpen size={20} />
                        </div>
                        <span className="text-lg font-bold uppercase italic tracking-tight text-zinc-200">{cls.name}</span>
                      </div>
                      <ChevronRight size={20} className="text-zinc-800 group-hover:text-zinc-500 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
