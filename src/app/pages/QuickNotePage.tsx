import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mic, Square, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { audioService } from "../../services/audio.service";
import { notesService } from "../../services/notes.service";
import { groqService } from "../../services/groq.service";

export default function QuickNotePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const toggleRecord = async () => {
    if (isProcessing) return;

    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      try {
        const audioBlob = await audioService.stopAudioRecording();
        const transcript = await groqService.transcribe(audioBlob, "es");
        await notesService.createFromTranscript(transcript, "Nota Rápida", true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1800);
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    const ok = await audioService.requestPermissions();
    if (!ok) return;
    try {
      await audioService.startAudioRecording();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-sans px-5 pt-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-black uppercase italic tracking-tighter leading-none">Nota rápida</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Graba. La IA escribe. Se guarda.</p>
        </div>
      </div>

      <div className="space-y-4">
        <motion.button
          type="button"
          onClick={toggleRecord}
          whileTap={{ scale: 0.99 }}
          className={clsx(
            "w-full rounded-3xl p-5 border transition-colors",
            isRecording ? "bg-red-600 border-red-500/40" : "bg-zinc-900 border-white/5"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={clsx(
                "w-11 h-11 rounded-2xl flex items-center justify-center",
                isRecording ? "bg-white/15" : "bg-emerald-500/15"
              )}>
                {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} className="text-emerald-400" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase italic leading-none">{isRecording ? "Grabando" : "Empezar"}</p>
                <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest mt-1">
                  {isRecording ? formatTime(recordingTime) : "Toca para grabar"}
                </p>
              </div>
            </div>
            <div className="text-[11px] font-black uppercase tracking-widest text-white/70">
              {isRecording ? "Detener" : "Grabar"}
            </div>
          </div>
        </motion.button>

        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-blue-600 rounded-2xl p-4 flex items-center gap-3"
            >
              <Sparkles size={16} className="animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest italic">La IA está guardando...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-emerald-600 rounded-2xl p-4 flex items-center gap-3"
            >
              <Zap size={16} fill="white" />
              <p className="text-[10px] font-black uppercase tracking-widest italic">Guardado</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Link
          to="/notes"
          className="block bg-white text-black rounded-2xl px-4 py-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-black uppercase tracking-tight">Ver mis notas</p>
            <span className="text-black/30">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
