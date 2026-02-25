import { useState, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { Link, useNavigate } from "react-router";
import { audioService } from "../../services/audio.service";
import { notesService, BackendNote } from "../../services/notes.service";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recentNotes, setRecentNotes] = useState<BackendNote[]>([]);
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

        const finalTranscript = transcription.trim() || "Transcripción no disponible (audio guardado).";

        await notesService.createFromTranscript(
            finalTranscript,
            "Grabación Rápida",
            true
        );

        setIsProcessing(false);
        setTranscription("");
        navigate("/notes"); // Send user to notes directly after recording for them to see what just got processed
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6 pb-24">
      {/* Header */}
      <header className="mb-8">
        <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">
          {new Date().toLocaleDateString("es-ES", { weekday: "long", month: "long", day: "numeric" })}
        </h2>
        <h1 className="text-2xl font-bold text-gray-900">Grabación Veloz</h1>
      </header>

      {/* Recording Button */}
      <div className="flex flex-col items-center justify-center mb-12">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 size={48} className="text-indigo-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analizando...</h3>
              <p className="text-sm text-gray-500">IA organizando tu nota</p>
            </motion.div>
          ) : (
            <motion.button
              key="record"
              onClick={handleRecord}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all mb-4",
                isRecording 
                  ? "bg-red-500 animate-pulse" 
                  : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              {isRecording ? (
                <Square size={48} className="text-white fill-white" />
              ) : (
                <Mic size={48} className="text-white" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {!isProcessing && (
          <div className="text-center mt-2">
            {isRecording ? (
              <>
                <h3 className="text-lg font-semibold text-red-600 mb-1">GRABANDO</h3>
                <p className="text-2xl font-mono font-bold text-gray-900">{formatTime(recordingTime)}</p>
                <div className="mt-4 pt-4 border-t border-gray-200 w-full">
                   <p className="text-sm text-gray-400 italic font-mono">{transcription || "Escuchando..."}</p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">TOCA PARA GRABAR</h3>
                <p className="text-sm text-gray-500">Inicia grabación de apuntes</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Recent Notes */}
      {!isRecording && !isProcessing && recentNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notas Recientes</h3>
          <div className="space-y-3">
            {recentNotes.map((note) => (
              <Link
                key={note.id}
                to={`/note/${note.id}`}
                className="block"
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 flex-1 truncate">{note.title || "Apunte Sin Título"}</h4>
                    <span className="text-[10px] text-gray-500 ml-2 whitespace-nowrap">{getTimeAgo(note.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                     {note.summary || note.transcript || "Procesando contenido..."}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isRecording && !isProcessing && recentNotes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aún no hay notas</h3>
          <p className="text-sm text-gray-500">Toca el botón arriba para grabar algo</p>
        </div>
      )}
    </div>
  );
}
