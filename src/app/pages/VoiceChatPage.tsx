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
    if (isTranscribing) return "Transcribiendo con Whisper...";
    if (isThinking) return "La IA está pensando...";
    if (isSpeaking) return "Hablando...";
    return "Toca el micrófono para hablar";
  };

  const getStatusColor = () => {
    if (isRecording) return "text-red-500";
    if (isTranscribing) return "text-amber-500";
    if (isThinking) return "text-indigo-500";
    if (isSpeaking) return "text-emerald-500";
    return "text-gray-400";
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100/80 px-4 pt-5 pb-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link
            to="/chat"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-1 shadow-lg shadow-indigo-200">
              <AudioLines size={22} className="text-white" />
            </div>
            <h1 className="text-sm font-bold text-gray-900">Chat de Voz</h1>
            <p className="text-[10px] text-gray-400 font-medium">Whisper V3 Turbo + IA</p>
          </div>
          <button
            onClick={() => setShowVoiceSelector(!showVoiceSelector)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Settings2 size={18} />
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
            className="bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                  Voz del Asistente
                </label>
                <div className="relative">
                  <select
                    value={selectedVoice || ""}
                    onChange={(e) => setSelectedVoice(e.target.value || null)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200 pr-8"
                  >
                    <option value="">Voz por defecto</option>
                    {availableVoices.map((v) => (
                      <option key={v.voiceURI} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                  Velocidad: {speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Lectura automática</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSpeak}
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Modo continuo (manos libres)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={continuousMode}
                    onChange={(e) => setContinuousMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>

              <button
                onClick={() => {
                  audioService.speakWithVoice("Hola, soy tu asistente. Así sueno con esta voz.", selectedVoice, speechRate);
                }}
                className="w-full bg-indigo-50 text-indigo-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
              >
                <Volume2 size={16} />
                Probar voz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-48">
        {messages.length === 0 && !isRecording && !isTranscribing && (
          <div className="h-full flex flex-col items-center justify-center pt-8">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
              <AudioLines size={40} className="text-indigo-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Chat de Voz IA</h2>
            <p className="text-sm text-gray-500 text-center max-w-[260px] leading-relaxed mb-4">
              Mantén presionado el botón de micrófono para hablar. Tu voz será transcrita por <strong>Whisper</strong> y la IA te responderá.
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              <span className="text-[10px] bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full font-medium">
                Whisper V3 Turbo
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium">
                {availableVoices.length} voces disponibles
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-medium">
                Español
              </span>
            </div>
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
                "max-w-[85%] p-3.5 shadow-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-2xl rounded-tr-[4px]"
                  : "bg-white text-gray-800 rounded-2xl rounded-tl-[4px] border border-gray-100"
              )}
            >
              {msg.role === "user" && (
                <div className="flex items-center gap-1 mb-1 opacity-70">
                  <Mic size={10} />
                  <span className="text-[10px]">Voz</span>
                </div>
              )}
              <p className="text-sm">{msg.text}</p>
              {msg.role === "ai" && msg.text && (
                <button
                  onClick={() => replaySpeech(msg.text)}
                  className="mt-2 text-indigo-500 hover:text-indigo-700 w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center"
                >
                  <Repeat size={12} />
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
            <div className="max-w-[85%] p-3 bg-indigo-100 text-indigo-800 rounded-2xl rounded-tr-[4px] text-sm italic">
              {currentTranscript}
            </div>
          </motion.div>
        )}

        {/* Typing indicator */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-[4px] flex items-center gap-1.5 shadow-sm border border-gray-100">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
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
            className="fixed bottom-52 left-4 right-4 max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-2xl z-30"
          >
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold text-red-400">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Recording Area */}
      <div className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-100/80 z-20 safe-bottom" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 20px), 80px)" }}>
        {/* Status */}
        <div className="text-center pt-3 pb-2">
          <p className={clsx("text-xs font-medium transition-colors", getStatusColor())}>
            {getStatusLabel()}
          </p>
        </div>

        {/* Waveform & Button */}
        <div className="flex flex-col items-center pb-4">
          {/* Animated waveform during recording */}
          {isRecording && (
            <div className="flex items-end gap-1 h-10 mb-3">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [4, Math.max(4, audioLevel * 20 + Math.random() * 16), 4],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.4 + Math.random() * 0.3,
                    delay: i * 0.02,
                  }}
                  className="w-1 bg-gradient-to-t from-red-500 to-red-300 rounded-full"
                  style={{ minHeight: 4 }}
                />
              ))}
            </div>
          )}

          {/* Processing indicator */}
          {(isTranscribing || isThinking) && (
            <div className="mb-3 flex items-center gap-2">
              <Loader2 size={18} className={clsx("animate-spin", isTranscribing ? "text-amber-500" : "text-indigo-500")} />
              <span className="text-xs text-gray-500 font-medium">
                {isTranscribing ? "Transcribiendo..." : "Procesando..."}
              </span>
            </div>
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex items-end gap-0.5 h-8 mb-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [3, 12 + Math.random() * 10, 3],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5 + Math.random() * 0.3,
                    delay: i * 0.05,
                  }}
                  className="w-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-full"
                  style={{ minHeight: 3 }}
                />
              ))}
            </div>
          )}

          {/* Main controls */}
          <div className="flex items-center gap-4">
            {/* Mute/unmute speaking */}
            {isSpeaking && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={stopSpeaking}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shadow-sm"
              >
                <VolumeX size={20} />
              </motion.button>
            )}

            {/* Main mic button */}
            <motion.button
              onMouseDown={startRecording}
              onMouseUp={stopRecordingAndProcess}
              onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
              onTouchEnd={(e) => { e.preventDefault(); stopRecordingAndProcess(); }}
              disabled={isTranscribing || isThinking}
              whileTap={{ scale: 0.9 }}
              className={clsx(
                "w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all select-none touch-none",
                isRecording
                  ? "bg-red-500 shadow-red-200 scale-110"
                  : isTranscribing || isThinking
                  ? "bg-gray-200 text-gray-400 shadow-gray-100"
                  : "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-indigo-200 hover:shadow-indigo-300 active:shadow-indigo-400"
              )}
            >
              {isTranscribing || isThinking ? (
                <Loader2 size={32} className="text-gray-400 animate-spin" />
              ) : isRecording ? (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <MicOff size={32} className="text-white" />
                </motion.div>
              ) : (
                <Mic size={32} className="text-white" />
              )}
            </motion.button>

            {/* Continuous mode indicator */}
            {continuousMode && !isRecording && !isTranscribing && !isThinking && !isSpeaking && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"
              >
                <Repeat size={18} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
