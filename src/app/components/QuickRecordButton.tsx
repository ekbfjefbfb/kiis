import { useState } from "react";
import { Mic, Square, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { useNavigate } from "react-router";
import { audioService } from "../../services/audio.service";
import { notesService } from "../../services/notes.service";

export function QuickRecordButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const [liveTranscript, setLiveTranscript] = useState("");

  const startRecording = async () => {
    try {
      const hasPermission = await audioService.requestPermissions();
      if (!hasPermission) {
        alert("Necesitas dar permiso al micrófono para grabar");
        return;
      }

      await audioService.startAudioRecording();
      setIsRecording(true);
      setRecordingTime(0);
      setLiveTranscript("Escuchando...");

      if (audioService.isSupported()) {
        audioService.startRecording((txt) => {
           setLiveTranscript(txt);
        });
      }
      
      // Timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Guardar el interval en el estado para limpiarlo después
      (window as any).recordingInterval = interval;
    } catch (error) {
      console.error("Error al iniciar grabación:", error);
      alert("Error al iniciar la grabación");
    }
  };

  const stopRecording = async () => {
    try {
      // Limpiar timer
      if ((window as any).recordingInterval) {
        clearInterval((window as any).recordingInterval);
        (window as any).recordingInterval = null;
      }

      if (audioService.getIsRecording()) {
         audioService.stopRecording();
      }

      const audioBlob = await audioService.stopAudioRecording();
      
      const finalTranscript = liveTranscript.trim() || "Transcripción no disponible (audio guardado).";

      setIsRecording(false);
      setRecordingTime(0);

      // Crear nota usando el endpoint real (envía transcripción)
      await notesService.createFromTranscript(
         finalTranscript,
         "Clase Rápida",
         true
      );

      // Mostrar éxito
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setLiveTranscript("");
        // Navegar a notas
        navigate("/notes");
      }, 1500);

    } catch (error) {
      console.error("Error al detener grabación:", error);
      alert("Error al guardar la grabación");
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        onClick={isRecording ? stopRecording : startRecording}
        className={clsx(
          "fixed bottom-24 right-6 z-40 rounded-full shadow-2xl flex items-center justify-center transition-all",
          isRecording 
            ? "bg-red-500 w-16 h-16 animate-pulse" 
            : "bg-indigo-600 w-16 h-16 hover:bg-indigo-700 active:bg-indigo-800"
        )}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {isRecording ? (
          <Square size={28} className="text-white fill-white" />
        ) : (
          <Mic size={28} className="text-white" />
        )}
      </motion.button>

      {/* Timer de grabación */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-44 right-6 z-40 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg font-mono text-sm font-bold"
          >
            {formatTime(recordingTime)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje de éxito */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Check size={24} />
            </div>
            <div>
              <p className="font-bold">¡Grabación guardada!</p>
              <p className="text-sm opacity-90">Abriendo notas...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay cuando está grabando */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-500/10 backdrop-blur-[2px] z-30 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </>
  );
}
