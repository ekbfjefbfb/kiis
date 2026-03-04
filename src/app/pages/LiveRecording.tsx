import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Mic, StopCircle, Loader2, Sparkles, ArrowLeft, 
  CheckCircle2, AlertCircle, BookOpen, ChevronRight
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
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<SessionResult | null>(null);
  const [selectedClassId, setSelectedClassId] = useState("");
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
      setTranscript(text);
      
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
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <header className="px-6 pt-12 pb-6 flex justify-between items-center border-b border-zinc-800 bg-black sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {isRecording ? 'Grabando_' : isProcessing ? 'Procesando_' : 'Finalizado_'}
          </span>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          {isRecording && (
            <motion.div 
              key="recording"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center gap-12"
            >
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-white/10 rounded-full -z-10"
                />
                <button 
                  onClick={stopRecording}
                  className="w-32 h-32 rounded-[48px] bg-white flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                >
                  <StopCircle size={48} className="text-black" fill="currentColor" />
                </button>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Capturando_</h2>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.4em]">La IA está procesando el audio...</p>
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-8"
            >
              <Loader2 size={48} className="text-white animate-spin" />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold uppercase italic tracking-tighter">Sintetizando_</h2>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Generando resumen y tareas...</p>
              </div>
            </motion.div>
          )}

          {result && showClassSelector && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md space-y-8 py-10"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-[40px] p-8 space-y-6">
                <div className="flex items-center gap-3 text-white/40">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Resultado_</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{result.topic}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed italic">{result.summary}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] px-4">Asignar a materia_</p>
                <div className="grid grid-cols-1 gap-2">
                  {CLASSES.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => saveToClass(cls.id)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-[28px] flex items-center justify-between active:bg-white active:text-black transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <BookOpen size={18} className="group-active:text-black text-zinc-500" />
                        <span className="font-bold uppercase italic tracking-tight">{cls.name}</span>
                      </div>
                      <ChevronRight size={18} className="text-zinc-700" />
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
