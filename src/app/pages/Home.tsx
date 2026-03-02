import { useState, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { Link, useNavigate } from "react-router";
import { audioService } from "../../services/audio.service";
import { notesService, BackendNote } from "../../services/notes.service";
import { intelligentProcessor, ProcessedTranscript } from "../../services/intelligent-processor";
import IntelligentAnalysis from "../components/IntelligentAnalysis";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recentNotes, setRecentNotes] = useState<BackendNote[]>([]);
  const [analysis, setAnalysis] = useState<ProcessedTranscript | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentNotes();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const loadRecentNotes = async () => {
    try {
      const backendNotes = await notesService.listNotes(5, 0);
      setRecentNotes(backendNotes);
    } catch (e) {
      console.error("Error loading notes", e);
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      try {
        if ((window as any).__homeRecordInterval) {
          clearInterval((window as any).__homeRecordInterval);
        }

        if (audioService.getIsRecording()) {
          audioService.stopRecording();
        }

        const audioBlob = await audioService.stopAudioRecording();
        setIsRecording(false);
        setIsProcessing(true);
        setShowAnalysis(true);

        const finalTranscript = transcription.trim() || "Transcripción no disponible (audio guardado).";

        // Procesar con sistema inteligente
        const processedData = await intelligentProcessor.processTranscript(
          finalTranscript,
          (progress) => setAnalysisProgress(progress)
        );
        
        setAnalysis(processedData);

        // Guardar en backend
        await notesService.createFromTranscript(
            finalTranscript,
            "Grabación Rápida",
            true
        );

        setIsProcessing(false);
        setTranscription("");
        
        // Esperar 2 segundos para que el usuario vea el análisis
        setTimeout(() => {
          navigate("/notes");
        }, 2000);
      } catch (error) {
        console.error("Error:", error);
        setIsRecording(false);
        setIsProcessing(false);
        alert("Error al guardar la grabación");
      }
    } else {
      const hasPermission = await audioService.requestPermissions();
      if (!hasPermission) {
        alert("Se necesitan permisos de micrófono");
        return;
      }

      try {
        await audioService.startAudioRecording();
        setIsRecording(true);
        setRecordingTime(0);
        setTranscription("Escuchando...");

        if (audioService.isSupported()) {
          audioService.startRecording((txt) => {
             setTranscription(txt);
          });
        }

        const interval = setInterval(() => setRecordingTime((p) => p + 1), 1000);
        (window as any).__homeRecordInterval = interval;
      } catch (error) {
        console.error("Error:", error);
        alert("Error al iniciar grabación");
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeAgo = (isoDate: string | null) => {
    if (!isoDate) return "Justo ahora";
    const diff = Date.now() - new Date(isoDate).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `Hace ${days}d`;
    if (hours > 0) return `Hace ${hours}h`;
    return "Justo ahora";
  };

  return (
    <div className="min-h-[100dvh] bg-background px-6 pb-32 flex flex-col relative">
      <header className="mb-4 mt-8">
        <h2 className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1">
          {new Date().toLocaleDateString("es-ES", { weekday: "long", month: "long", day: "numeric" })}
        </h2>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Grabación</h1>
      </header>

      {/* Recording Area */}
      <div className="flex flex-col items-center justify-center flex-1 min-h-[45vh]">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 rounded-full border-[2px] border-muted border-t-foreground mb-6" 
              />
              <h3 className="text-lg font-medium text-foreground tracking-tight">Procesando</h3>
            </motion.div>
          ) : (
            <motion.button
              key="record"
              onClick={handleRecord}
              whileTap={{ scale: 0.92 }}
              className={clsx(
                "relative flex items-center justify-center w-32 h-32 rounded-full transition-colors duration-500",
                isRecording ? "bg-destructive text-destructive-foreground shadow-[0_0_40px_-5px_rgba(255,0,0,0.3)]" : "bg-foreground text-background shadow-2xl"
              )}
            >
              {isRecording ? <Square size={36} strokeWidth={2} fill="currentColor" /> : <Mic size={40} strokeWidth={1.5} />}
              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full border border-destructive"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {!isProcessing && (
          <div className="text-center mt-12 h-16 flex flex-col items-center justify-start">
            {isRecording ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <p className="text-4xl font-light tabular-nums tracking-tighter text-foreground mb-2">
                  {formatTime(recordingTime)}
                </p>
                <div className="w-56 overflow-hidden relative h-5">
                    <p className="text-[13px] text-muted-foreground truncate absolute w-full text-center font-medium">{transcription || "..."}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">Tocar para grabar</h3>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Intelligent Analysis */}
      {showAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <IntelligentAnalysis
            analysis={analysis}
            isProcessing={isProcessing}
            progress={analysisProgress}
          />
        </motion.div>
      )}

      {/* Recent Notes */}
      {!isRecording && !isProcessing && !showAnalysis && recentNotes.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mt-4"
        >
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-[13px] font-semibold text-muted-foreground tracking-wide uppercase ml-1">Recientes</h3>
          </div>
          <div className="flex flex-col">
            {recentNotes.map((note) => (
              <Link
                key={note.id}
                to={`/note/${note.id}`}
                className="group py-4 border-b border-border/50 last:border-0 hover:bg-muted/40 px-3 -mx-2 rounded-2xl transition-all duration-300"
              >
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-semibold text-foreground text-[17px] tracking-tight truncate pr-4">{note.title || "Nota"}</h4>
                  <span className="text-[12px] font-medium text-muted-foreground whitespace-nowrap">{getTimeAgo(note.created_at)}</span>
                </div>
                <p className="text-[15px] text-muted-foreground line-clamp-1 leading-relaxed">
                   {note.summary || note.transcript || "Procesando contenido..."}
                </p>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
