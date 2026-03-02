import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic, MicOff, Volume2, VolumeX, ArrowLeft, Loader2,
  AudioLines, ChevronDown, Settings2, Repeat
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { Link, useNavigate } from "react-router";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";
import { aiService } from "../../services/ai.service";

interface VoiceMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: number;
}

export default function VoiceChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [continuousMode, setContinuousMode] = useState(false);

  // Voice selection
  const [availableVoices, setAvailableVoices] = useState<{ name: string; lang: string; voiceURI: string }[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  // Recording animation
  const [audioLevel, setAudioLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = audioService.getAvailableVoices();
      setAvailableVoices(voices);
      // Auto-select first Spanish voice
      const spanishVoice = voices.find(v => v.lang.startsWith('es'));
      if (spanishVoice && !selectedVoice) {
        setSelectedVoice(spanishVoice.name);
      }
    };

    loadVoices();
    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      audioService.stopSpeaking();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTranscript]);

  // Audio level visualization
  const startAudioVisualization = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
      setAudioLevel(avg / 128); // Normalize 0-2
      animFrameRef.current = requestAnimationFrame(updateLevel);
    };
    updateLevel();
  }, []);

  // Handle navigation commands from AI
  const handleNavigationCommand = (text: string): string => {
    const navMatch = text.match(/\[NAVIGATE:(.*?)\]/);
    if (navMatch && navMatch[1]) {
      const route = navMatch[1].trim();
      setTimeout(() => navigate(route), 2000);
      return text.replace(/\[NAVIGATE:.*?\]/g, "").trim();
    }
    return text;
  };

  const startRecording = async () => {
    setError(null);
    const ok = await audioService.requestPermissions();
    if (!ok) {
      setError("Se necesitan permisos de micrófono para usar el chat de voz.");
      return;
    }

    try {
      await audioService.startAudioRecording();
      setIsRecording(true);
      setCurrentTranscript("");

      // Get stream for visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startAudioVisualization(stream);
    } catch (err: any) {
      setError("No se pudo iniciar la grabación: " + err.message);
    }
  };

  const stopRecordingAndProcess = async () => {
    if (!isRecording) return;

    // Stop visualization
    cancelAnimationFrame(animFrameRef.current);
    setAudioLevel(0);
    setIsRecording(false);
    setIsTranscribing(true);

    try {
      const audioBlob = await audioService.stopAudioRecording();

      // Step 1: Transcribe with Groq Whisper
      const transcript = await groqService.transcribe(audioBlob, 'es');
      setCurrentTranscript(transcript);

      // Add user message
      const userMsg: VoiceMessage = {
        id: Date.now().toString(),
        role: "user",
        text: transcript,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMsg]);
      setIsTranscribing(false);

      // Step 2: Send to AI
      setIsThinking(true);
      const historyForAi = messages.map(m => ({
        role: m.role as "user" | "ai" | "system",
        content: m.text,
      }));

      let response = "";
      const aiMsgId = (Date.now() + 1).toString();

      setMessages(prev => [
        ...prev,
        { id: aiMsgId, role: "ai", text: "", timestamp: Date.now() },
      ]);

      await aiService.chat(transcript, historyForAi, (token) => {
        response += token;
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, text: response } : m)
        );
      });

      // Clean navigation commands
      const cleaned = handleNavigationCommand(response);
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, text: cleaned } : m)
      );
      setIsThinking(false);

      // Step 3: Speak the response
      if (autoSpeak && cleaned.length > 0) {
        setIsSpeaking(true);
        audioService.speakWithVoice(cleaned, selectedVoice, speechRate, () => {
          setIsSpeaking(false);
          // If continuous mode, restart recording
          if (continuousMode) {
            setTimeout(() => startRecording(), 500);
          }
        });
      } else if (continuousMode) {
        setTimeout(() => startRecording(), 500);
      }

      setCurrentTranscript("");
    } catch (err: any) {
      console.error("Voice processing error:", err);
      setError(err.message || "Error al procesar el audio.");
      setIsTranscribing(false);
      setIsThinking(false);
    }
  };

  const stopSpeaking = () => {
    audioService.stopSpeaking();
    setIsSpeaking(false);
  };

  const replaySpeech = (text: string) => {
    setIsSpeaking(true);
    audioService.speakWithVoice(text, selectedVoice, speechRate, () => {
      setIsSpeaking(false);
    });
  };

  // Get the current status label
  const getStatusLabel = () => {
    if (isRecording) return "Escuchando tu voz...";
    if (isTranscribing) return "Procesando...";
    if (isThinking) return "Pensando...";
    if (isSpeaking) return "Hablando...";
    return "Toca el micrófono para hablar";
  };

  const getStatusColor = () => {
    if (isRecording) return "text-destructive";
    if (isTranscribing) return "text-muted-foreground";
    if (isThinking) return "text-foreground";
    if (isSpeaking) return "text-foreground";
    return "text-muted-foreground";
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 pt-12 pb-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link
            to="/chat"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Voz</h1>
            <p className="text-xs text-muted-foreground font-bold tracking-[0.2em] uppercase mt-1">Siempre disponible</p>
          </div>
          <button
            onClick={() => setShowVoiceSelector(!showVoiceSelector)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            <Settings2 size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Voice Selector Panel */}
      <AnimatePresence>
        {showVoiceSelector && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-background border-b border-border/50 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] block mb-3">
                  Voz
                </label>
                <div className="relative">
                  <select
                    value={selectedVoice || ""}
                    onChange={(e) => setSelectedVoice(e.target.value || null)}
                    className="w-full bg-muted text-foreground border border-border/50 rounded-xl px-4 py-3 text-base appearance-none focus:outline-none focus:ring-1 focus:ring-foreground pr-10"
                  >
                    <option value="">Voz por defecto</option>
                    {availableVoices.map((v) => (
                      <option key={v.voiceURI} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] block mb-3">
                  Velocidad: {speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-foreground"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-base text-foreground font-medium">Lectura automática</span>
                <div className={clsx("w-12 h-6 rounded-full transition-colors flex items-center px-1 border border-border cursor-pointer", autoSpeak ? "bg-foreground" : "bg-muted")} onClick={() => setAutoSpeak(!autoSpeak)}>
                   <motion.div animate={{ x: autoSpeak ? 24 : 0 }} className={clsx("w-4 h-4 rounded-full", autoSpeak ? "bg-background" : "bg-foreground")} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-base text-foreground font-medium">Modo continuo</span>
                <div className={clsx("w-12 h-6 rounded-full transition-colors flex items-center px-1 border border-border cursor-pointer", continuousMode ? "bg-foreground" : "bg-muted")} onClick={() => setContinuousMode(!continuousMode)}>
                   <motion.div animate={{ x: continuousMode ? 24 : 0 }} className={clsx("w-4 h-4 rounded-full", continuousMode ? "bg-background" : "bg-foreground")} />
                </div>
              </div>

              <button
                onClick={() => {
                  audioService.speakWithVoice("Hola, soy tu asistente. Así sueno con esta voz.", selectedVoice, speechRate);
                }}
                className="w-full bg-foreground text-background py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Volume2 size={18} />
                Probar voz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-48">
        {messages.length === 0 && !isRecording && !isTranscribing && (
          <div className="h-full flex flex-col items-center justify-center -mt-10">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 border border-border">
              <AudioLines size={40} className="text-foreground/40" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-3">Empieza a hablar</h2>
            <p className="text-[15px] text-muted-foreground text-center max-w-[280px] leading-relaxed mb-8">
              Mantén pulsado el micrófono para hacerle preguntas sobre tus clases.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "flex w-full",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={clsx(
                "max-w-[85%] p-5 text-base leading-relaxed",
                msg.role === "user"
                  ? "bg-foreground text-background rounded-[24px] rounded-br-md"
                  : "bg-muted/50 text-foreground border border-border/50 rounded-[24px] rounded-bl-md"
              )}
            >
              {msg.role === "user" && (
                <div className="flex items-center gap-1.5 mb-2 opacity-50">
                  <Mic size={12} />
                  <span className="text-xs font-bold tracking-widest uppercase">Tú</span>
                </div>
              )}
              <p>{msg.text}</p>
              {msg.role === "ai" && msg.text && (
                <button
                  onClick={() => replaySpeech(msg.text)}
                  className="mt-4 text-muted-foreground hover:text-foreground w-10 h-10 rounded-full border border-border/50 bg-background flex items-center justify-center transition-colors"
                >
                  <Repeat size={16} />
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {/* Live transcript preview */}
        {(isTranscribing || isThinking) && currentTranscript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <div className="max-w-[85%] p-5 bg-muted text-muted-foreground/80 rounded-[24px] rounded-br-md text-base italic border border-border/50">
              {currentTranscript}
            </div>
          </motion.div>
        )}

        {/* Typing indicator */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-muted p-4 py-5 rounded-[24px] rounded-bl-md flex items-center gap-2 border border-border/50">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-2 bg-foreground/40 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                className="w-2 h-2 bg-foreground/40 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                className="w-2 h-2 bg-foreground/40 rounded-full"
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-48 left-6 right-6 mx-auto bg-destructive text-destructive-foreground text-sm font-medium tracking-wide p-4 rounded-xl z-30 flex justify-between items-center"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold opacity-70 hover:opacity-100 uppercase tracking-widest text-xs">Cerrar</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Recording Area */}
      <div className="fixed bottom-0 w-full max-w-md bg-background/90 backdrop-blur-2xl border-t border-border/40 z-20 safe-bottom pb-8 pt-6">
        {/* Main controls */}
        <div className="flex flex-col items-center">
          {/* Animated waveform during recording */}
          {isRecording && (
            <div className="flex items-center gap-[3px] h-12 mb-4">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [4, Math.max(4, audioLevel * 30 + Math.random() * 20), 4],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.4 + Math.random() * 0.3,
                    delay: i * 0.02,
                  }}
                  className="w-1 bg-destructive rounded-full"
                  style={{ minHeight: 4 }}
                />
              ))}
            </div>
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-[3px] h-10 mb-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [3, 15 + Math.random() * 15, 3],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5 + Math.random() * 0.3,
                    delay: i * 0.05,
                  }}
                  className="w-1 bg-foreground rounded-full"
                  style={{ minHeight: 3 }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-6 relative z-10 w-full px-10">
            {/* Mute/unmute speaking placed uniformly */}
            <div className="w-14 flex justify-end">
               {isSpeaking && (
                 <motion.button
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   onClick={stopSpeaking}
                   className="w-12 h-12 rounded-full border border-border bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                 >
                   <VolumeX size={20} />
                 </motion.button>
               )}
            </div>

            {/* Main mic button */}
            <motion.button
              onMouseDown={startRecording}
              onMouseUp={stopRecordingAndProcess}
              onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
              onTouchEnd={(e) => { e.preventDefault(); stopRecordingAndProcess(); }}
              disabled={isTranscribing || isThinking}
              whileTap={{ scale: 0.92 }}
              className={clsx(
                "w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 select-none touch-none",
                isRecording
                  ? "bg-destructive text-destructive-foreground"
                  : isTranscribing || isThinking
                  ? "bg-muted border border-border/50 text-muted-foreground shadow-none"
                  : "bg-foreground text-background"
              )}
            >
              {isTranscribing || isThinking ? (
                <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                   className="w-8 h-8 rounded-full border-[2px] border-border border-t-muted-foreground" 
                 />
              ) : isRecording ? (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <MicOff size={36} strokeWidth={1.5} />
                </motion.div>
              ) : (
                <Mic size={40} strokeWidth={1.5} />
              )}
            </motion.button>

            {/* Continuous mode indicator */}
            <div className="w-14 flex justify-start">
               {continuousMode && !isRecording && !isTranscribing && !isThinking && !isSpeaking && (
                 <motion.div
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   className="w-12 h-12 rounded-full border border-border bg-background flex items-center justify-center text-foreground"
                 >
                   <Repeat size={18} />
                 </motion.div>
               )}
            </div>
          </div>
        </div>

        {/* Status - MOVED TO BOTTOM */}
        <div className="text-center mt-6">
           <AnimatePresence mode="wait">
             <motion.p 
               key={getStatusLabel()}
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -5 }}
               className={clsx("text-sm font-bold tracking-[0.2em] uppercase transition-colors", 
                 isRecording ? "text-destructive" : getStatusColor()
               )}
             >
               {getStatusLabel()}
             </motion.p>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
