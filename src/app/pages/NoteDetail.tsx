import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, StopCircle, Loader2, Sparkles, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";
import { aiService } from "../../services/ai.service";
import { notesService } from "../../services/notes.service";

export default function QuickNotePage() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ title: string; summary: string } | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) { console.error(err); }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      if (wakeLockRef.current) wakeLockRef.current.release();
      
      try {
        const audioBlob = await audioService.stopAudioRecording();
        const text = await groqService.transcribe(audioBlob, "es");
        setTranscript(text);

        const prompt = `Genera un título ultracorto (3-4 palabras) y un resumen de una oración para esta nota rápida. 
        Responde en JSON: { "title": "...", "summary": "..." }
        Texto: ${text}`;
        
        let aiResponse = "";
        await aiService.chat(prompt, [], (token) => { aiResponse += token; });
        
        const jsonStr = aiResponse.substring(aiResponse.indexOf('{'), aiResponse.lastIndexOf('}') + 1);
        const parsed = JSON.parse(jsonStr);
        
        await notesService.createNote({
          title: parsed.title.toUpperCase(),
          transcript: text,
          summary: parsed.summary
        });

        setResult(parsed);
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    } else {
      const ok = await audioService.requestPermissions();
      if (!ok) return;
      await audioService.startAudioRecording();
      setIsRecording(true);
      await requestWakeLock();
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative selection:bg-white/20">
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1.5 text-left">Acción_Rápida</p>
            <h1 className="text-2xl font-extrabold uppercase italic tracking-tighter leading-none">Nota_Flash</h1>
          </div>
        </div>
        <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Zap size={20} className="text-emerald-500/60" />
        </div>
      </header>

      <main className="flex-1 p-8 flex flex-col items-center justify-center max-w-2xl mx-auto w-full relative">
        <AnimatePresence mode="wait">
          {!result && !isProcessing ? (
            <motion.div key="rec" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center gap-16">
              <div className="relative">
                {isRecording && (
                  <motion.div animate={{ scale: [1, 2.2, 1], opacity: [0.2, 0, 0.2] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute inset-0 bg-white/5 rounded-full" />
                )}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleRecording}
                  className={clsx(
                    "w-48 h-48 rounded-[64px] flex items-center justify-center border-2 transition-all duration-700 shadow-2xl relative z-10",
                    isRecording ? "bg-white border-white" : "bg-zinc-900 border-white/5"
                  )}
                >
                  {isRecording ? <StopCircle size={64} fill="black" className="text-black" /> : <Mic size={64} className="text-zinc-700" />}
                </motion.button>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-extrabold uppercase italic tracking-tighter leading-none">{isRecording ? "Escuchando_" : "Toca_Graba"}</h2>
                <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-[0.4em] max-w-[240px] leading-relaxed">Captura una idea rápida. La IA hará el resto.</p>
              </div>
            </motion.div>
          ) : isProcessing ? (
            <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 text-center">
              <Loader2 size={80} className="animate-spin text-white/5" strokeWidth={1} />
              <h2 className="text-3xl font-extrabold uppercase italic tracking-tighter text-white/40">Sintetizando_</h2>
            </motion.div>
          ) : (
            <motion.div key="res" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-10">
              <div className="bg-zinc-900/40 border border-white/5 rounded-[48px] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/20" />
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-500/40">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">IA_Resultado</span>
                  </div>
                  <h3 className="text-3xl font-extrabold uppercase italic tracking-tighter leading-tight text-white">{result.title}</h3>
                  <p className="text-xl font-bold leading-relaxed text-zinc-400 italic tracking-tight">{result.summary}</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/dashboard')}
                className="w-full h-20 bg-white text-black rounded-[40px] font-extrabold uppercase italic tracking-tighter text-xl shadow-2xl flex items-center justify-center gap-4 active:bg-zinc-200 transition-colors"
              >
                <span>Listo_</span>
                <CheckCircle2 size={28} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
