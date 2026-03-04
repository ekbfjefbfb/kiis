import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Mic, Square, Wifi, WifiOff, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { audioService } from "../../services/audio.service";
import { 
  agendaService, 
  AgendaSession, 
  WSChunkRelevance, 
  WSAgendaState 
} from "../../services/agenda.service";

export default function LiveRecording() {
  const navigate = useNavigate();
  
  // Session state
  const [session, setSession] = useState<AgendaSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // WebSocket state
  const [isConnected, setIsConnected] = useState(false);
  const [lastRelevance, setLastRelevance] = useState<WSChunkRelevance | null>(null);
  const [agendaState, setAgendaState] = useState<WSAgendaState | null>(null);
  
  // Transcription
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");
  
  // Audio chunks for periodic upload
  const audioChunksRef = useRef<Blob[]>([]);
  const lastUploadTimeRef = useRef<number>(Date.now());
  const UPLOAD_INTERVAL_MS = 10000; // 10 segundos

  useEffect(() => {
    initializeSession();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        checkAndUploadAudio();
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const initializeSession = async () => {
    try {
      // Crear sesión
      const newSession = await agendaService.createSession({
        class_name: "Grabación en Vivo",
        topic_hint: "Clase grabada desde PWA"
      });
      
      setSession(newSession);
      
      // Conectar WebSocket
      agendaService.connectWebSocket(newSession.id, {
        onChunkRelevance: (data) => {
          console.log('📊 Relevancia:', data.relevance);
          setLastRelevance(data);
        },
        onAgendaState: (data) => {
          console.log('📝 Estado actualizado:', data.state);
          setAgendaState(data);
        },
        onConnected: () => {
          console.log('✅ Conectado al backend');
          setIsConnected(true);
        },
        onDisconnected: () => {
          console.log('❌ Desconectado del backend');
          setIsConnected(false);
        },
        onError: (error) => {
          console.error('Error WebSocket:', error);
        }
      });
    } catch (error) {
      console.error('Error inicializando sesión:', error);
      alert('Error al conectar con el servidor');
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    const hasPermission = await audioService.requestPermissions();
    if (!hasPermission) {
      alert("Se necesitan permisos de micrófono");
      return;
    }

    try {
      // Iniciar grabación de audio
      await audioService.startAudioRecording();
      
      // Iniciar STT del navegador para preview
      if (audioService.isSupported()) {
        audioService.startRecording((text) => {
          setCurrentTranscript(text);
          setFullTranscript(text);
        });
      }

      setIsRecording(true);
      setRecordingTime(0);
      lastUploadTimeRef.current = Date.now();
    } catch (error) {
      console.error("Error al iniciar grabación:", error);
      alert("Error al iniciar grabación");
    }
  };

  const stopRecording = async () => {
    try {
      // Detener STT del navegador
      if (audioService.getIsRecording()) {
        audioService.stopRecording();
      }

      // Detener grabación de audio
      const audioBlob = await audioService.stopAudioRecording();
      
      setIsRecording(false);

      // Subir último chunk de audio
      if (audioBlob.size > 0) {
        await uploadAudioChunk(audioBlob);
      }

      // Finalizar sesión
      if (session) {
        const finalized = await agendaService.finalizeSession(session.id);
        
        // Guardar en localStorage para Dashboard
        const stored = localStorage.getItem('recent_sessions');
        const sessions = stored ? JSON.parse(stored) : [];
        sessions.unshift({
          id: session.id,
          class_name: session.class_name,
          session_datetime: session.session_datetime,
          summary: agendaState?.state.summary || '',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('recent_sessions', JSON.stringify(sessions.slice(0, 10)));
        
        // Desconectar WebSocket
        agendaService.disconnect();
        
        // Navegar a detalle de sesión
        navigate(`/session/${session.id}`);
      }
    } catch (error) {
      console.error("Error al detener grabación:", error);
    }
  };

  const checkAndUploadAudio = async () => {
    const now = Date.now();
    if (now - lastUploadTimeRef.current >= UPLOAD_INTERVAL_MS) {
      // Obtener audio acumulado
      try {
        const audioBlob = await audioService.stopAudioRecording();
        if (audioBlob.size > 0) {
          await uploadAudioChunk(audioBlob);
        }
        // Reiniciar grabación
        await audioService.startAudioRecording();
        lastUploadTimeRef.current = now;
      } catch (error) {
        console.error('Error en upload periódico:', error);
      }
    }
  };

  const uploadAudioChunk = async (audioBlob: Blob) => {
    if (!session || !isConnected) return;

    try {
      // Transcribir con Groq
      const result = await agendaService.transcribeAudio(audioBlob);
      
      if (result.text && result.text.trim()) {
        // Enviar al WebSocket para clasificación y extracción
        agendaService.sendTranscriptChunk(result.text, {
          min_ai_interval_sec: 6
        });
      }
    } catch (error) {
      console.error('Error subiendo audio:', error);
    }
  };

  const cleanup = () => {
    if (audioService.getIsRecording()) {
      audioService.stopRecording();
    }
    agendaService.disconnect();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRelevanceColor = (label?: string) => {
    switch (label) {
      case 'IMPORTANTE': return 'text-green-600 bg-green-500/10';
      case 'SECUNDARIO': return 'text-yellow-600 bg-yellow-500/10';
      case 'IRRELEVANTE': return 'text-red-600 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted/30';
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background px-6 pb-32 flex flex-col">
      {/* Header */}
      <header className="mb-6 mt-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Grabar
          </h1>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {isConnected ? 'Listo' : 'Sin conexión'}
        </p>
      </header>

      {/* Recording Button */}
      <div className="flex flex-col items-center justify-center flex-1 min-h-[40vh]">
        <motion.button
          onClick={handleRecord}
          whileTap={{ scale: 0.92 }}
          className={clsx(
            "relative flex items-center justify-center w-32 h-32 rounded-full transition-colors duration-500",
            isRecording 
              ? "bg-destructive text-destructive-foreground shadow-[0_0_40px_-5px_rgba(255,0,0,0.3)]" 
              : "bg-foreground text-background shadow-2xl"
          )}
        >
          {isRecording ? (
            <Square size={36} strokeWidth={2} fill="currentColor" />
          ) : (
            <Mic size={40} strokeWidth={1.5} />
          )}
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full border border-destructive"
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.button>

        {/* Timer & Transcript */}
        <div className="text-center mt-12 w-full max-w-md">
          {isRecording && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-4xl font-light tabular-nums tracking-tighter text-foreground mb-4">
                {formatTime(recordingTime)}
              </p>
              <div className="bg-muted/30 rounded-2xl p-4 min-h-[80px] max-h-[120px] overflow-y-auto">
                <p className="text-sm text-foreground leading-relaxed">
                  {currentTranscript || "Escuchando..."}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Real-time Analysis */}
      {isRecording && agendaState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 mt-6"
        >
          {/* Summary Card */}
          {agendaState.state.summary && (
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-5 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Resumen</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {agendaState.state.summary}
              </p>
            </div>
          )}

          {/* Last Relevance Indicator */}
          {lastRelevance && (
            <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Último fragmento
                </span>
                <div className={clsx(
                  "px-2.5 py-1 rounded-full text-xs font-bold",
                  getRelevanceColor(lastRelevance.relevance.relevance_label)
                )}>
                  {lastRelevance.relevance.relevance_label}
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                {lastRelevance.relevance.relevance_reason}
              </p>
            </div>
          )}

          {/* Lecture Notes (Markdown) */}
          {agendaState.state.lecture_notes && (
            <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-foreground">Apuntes de Clase</h3>
              </div>
              <div className="prose prose-sm max-w-none text-foreground">
                <div className="text-sm leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {agendaState.state.lecture_notes}
                </div>
              </div>
            </div>
          )}

          {/* Tasks */}
          {agendaState.state.tasks.length > 0 && (
            <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  Tareas ({agendaState.state.tasks.length})
                </h3>
              </div>
              <div className="space-y-2">
                {agendaState.state.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-xl border border-border/30">
                    <div className={clsx(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      task.priority === 3 ? "bg-red-500" :
                      task.priority === 2 ? "bg-yellow-500" : "bg-green-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium">{task.text}</p>
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📅 {task.due_date}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Points */}
          {agendaState.state.key_points.length > 0 && (
            <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  Puntos Clave ({agendaState.state.key_points.length})
                </h3>
              </div>
              <div className="space-y-2">
                {agendaState.state.key_points.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-xl border border-border/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Signals */}
          {agendaState.state.relevance.important_signals.length > 0 && (
            <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Señales Importantes
              </h3>
              <div className="flex flex-wrap gap-2">
                {agendaState.state.relevance.important_signals.map((signal, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-red-500/10 text-red-600 text-xs font-medium rounded-full border border-red-500/20">
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State when recording but no data yet */}
      {isRecording && !agendaState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-muted-foreground animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">
            Analizando contenido...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Los datos aparecerán en unos segundos
          </p>
        </motion.div>
      )}
    </div>
  );
}
