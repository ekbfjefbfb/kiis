import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Send, Bot, StopCircle, ArrowLeft, Loader2, Play, Wifi, WifiOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { useNavigate } from "react-router";
import { aiService, chatWebSocket } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";

interface ChatMessage {
  id?: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsConnecting, setWsConnecting] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const pendingResponseRef = useRef<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const [currentTranscript, setCurrentTranscript] = useState("");

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Conectar WebSocket al montar
  useEffect(() => {
    // Usar ID anónimo si no hay usuario
    const userId = localStorage.getItem('user_id') || 'anonymous_user';
    
    console.log('🔌 Chat: Conectando WebSocket...');
    
    chatWebSocket.connect(userId, {
      onMessage: (data) => {
        console.log('📨 Chat: Mensaje recibido:', data);
        
        // Si hay un mensaje pendiente, actualizarlo
        if (pendingResponseRef.current) {
          const aiResponseId = pendingResponseRef.current;
          const cleanedText = handleNavigationCommand(data.response);
          
          setMessages((prev) => 
            prev.map((m) => m.id === aiResponseId ? { ...m, content: cleanedText } : m)
          );
          
          pendingResponseRef.current = null;
          setIsTyping(false);
          
          // Auto-speak si está habilitado
          if (autoSpeak && cleanedText) {
            setIsSpeaking(true);
            audioService.speak(cleanedText, () => setIsSpeaking(false));
          }
        }
      },
      onConnect: () => {
        console.log('✅ Chat: WebSocket conectado');
        setWsConnected(true);
        setWsConnecting(false);
      },
      onError: (err) => {
        console.error('❌ Chat: WebSocket error:', err);
        setWsConnected(false);
        setWsConnecting(false);
      },
      onClose: () => {
        console.log('🔌 Chat: WebSocket desconectado');
        setWsConnected(false);
      },
    });

    // Cleanup
    return () => {
      console.log('🧹 Chat: Desconectando WebSocket...');
      chatWebSocket.disconnect();
      audioService.stopSpeaking();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [autoSpeak]);

  const handleNavigationCommand = useCallback((text: string) => {
    const navMatch = text.match(/\[NAVIGATE:(.*?)\]/);
    if (navMatch && navMatch[1]) {
      const route = navMatch[1].trim();
      setTimeout(() => navigate(route), 1500);
      return text.replace(/\[NAVIGATE:.*?\]/g, "").trim();
    }
    return text;
  }, [navigate]);

  // Fallback HTTP cuando WebSocket no está disponible
  const sendViaHttp = async (userMessage: string, aiResponseId: string) => {
    try {
      let finalResponse = "";
      
      await aiService.chat(userMessage, [], (token) => {
        finalResponse += token;
        setMessages((prev) => 
          prev.map((m) => m.id === aiResponseId ? { ...m, content: finalResponse } : m)
        );
      });

      setMessages((prev) => 
        prev.map((m) => {
          if (m.id === aiResponseId) {
            const cleanedText = handleNavigationCommand(finalResponse);
            return { ...m, content: cleanedText };
          }
          return m;
        })
      );
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content: "Lo siento, hubo un problema al procesar tu solicitud. Intenta de nuevo.",
        timestamp: Date.now(),
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const userMessage = input.trim();
    setInput("");

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    const aiResponseId = (Date.now() + 1).toString();
    
    setMessages((prev) => [
      ...prev,
      { id: aiResponseId, role: "ai", content: "", timestamp: Date.now() }
    ]);

    // Usar WebSocket si está conectado, sino HTTP
    if (chatWebSocket.isConnected()) {
      console.log('📤 Chat: Enviando vía WebSocket...');
      pendingResponseRef.current = aiResponseId;
      chatWebSocket.sendMessage(userMessage);
      
      // Timeout de seguridad: si no hay respuesta en 30s, fallback a HTTP
      setTimeout(() => {
        if (pendingResponseRef.current === aiResponseId) {
          console.log('⏱️ Chat: Timeout WebSocket, usando HTTP...');
          pendingResponseRef.current = null;
          sendViaHttp(userMessage, aiResponseId).finally(() => setIsTyping(false));
        }
      }, 30000);
    } else {
      console.log('📤 Chat: WebSocket offline, usando HTTP...');
      await sendViaHttp(userMessage, aiResponseId);
      setIsTyping(false);
    }
  };

  // Audio level visualization
  const startAudioVisualization = useCallback(async (stream: MediaStream) => {
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
      setAudioLevel(avg / 128);
      animFrameRef.current = requestAnimationFrame(updateLevel);
    };
    updateLevel();
  }, []);

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      cancelAnimationFrame(animFrameRef.current);
      setAudioLevel(0);
      setIsRecording(false);
      setIsProcessing(true);
      
      try {
        const audioBlob = await audioService.stopAudioRecording();
        
        // Transcribir con Groq
        const transcript = await groqService.transcribe(audioBlob, 'es');
        setCurrentTranscript(transcript);
        
        // Agregar mensaje del usuario
        const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: "user",
          content: transcript,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsProcessing(false);
        
        // Enviar a IA
        setIsTyping(true);
        const aiResponseId = (Date.now() + 1).toString();
        
        setMessages(prev => [
          ...prev,
          { id: aiResponseId, role: "ai", content: "", timestamp: Date.now() }
        ]);

        // Enviar vía WebSocket o HTTP
        if (chatWebSocket.isConnected()) {
          pendingResponseRef.current = aiResponseId;
          chatWebSocket.sendMessage(transcript);
          
          setTimeout(() => {
            if (pendingResponseRef.current === aiResponseId) {
              pendingResponseRef.current = null;
              sendViaHttp(transcript, aiResponseId).finally(() => setIsTyping(false));
            }
          }, 30000);
        } else {
          await sendViaHttp(transcript, aiResponseId);
          setIsTyping(false);
        }
        
        setCurrentTranscript("");
      } catch (error: any) {
        console.error("Transcription error:", error);
        setIsProcessing(false);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "ai",
          content: `⚠️ Error al transcribir: ${error.message || "Intenta de nuevo."}`,
          timestamp: Date.now()
        }]);
      }
    } else {
      const ok = await audioService.requestPermissions();
      if (!ok) return alert("Se necesitan permisos de micrófono");
      try {
        await audioService.startAudioRecording();
        setIsRecording(true);
        setCurrentTranscript("");
        
        // Obtener stream para visualización
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startAudioVisualization(stream);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const stopSpeaking = () => {
    audioService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handlePlayVoice = async (text: string, id: string) => {
    if (currentlyPlayingId === id) {
      audioService.stopSpeaking();
      setCurrentlyPlayingId(null);
      return;
    }
    try {
      setCurrentlyPlayingId(id);
      audioService.speak(text, () => setCurrentlyPlayingId(null));
    } catch {
      setCurrentlyPlayingId(null);
    }
  };

  const suggestions = [
    "Llévame a mi perfil",
    "¿Qué tareas tengo pendientes?",
    "Abre el calendario de la escuela",
    "Ver mis notas importantes"
  ];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="bg-card/90 backdrop-blur-xl border-b border-border px-4 pt-3 pb-2 sticky top-0 z-10 flex items-center">
        <div className="flex-1" />
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-0.5 relative bg-secondary border border-border">
            <Bot size={18} className="text-foreground" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-foreground border-2 border-card rounded-full" />
          </div>
          <h1 className="text-xs font-bold leading-none text-foreground">Chat</h1>
          <div className="flex items-center gap-1">
            <p className="text-[10px] font-medium text-muted-foreground">Pregúntame lo que sea</p>
            {wsConnecting ? (
              <Loader2 size={10} className="animate-spin text-muted-foreground" />
            ) : wsConnected ? (
              <Wifi size={10} className="text-green-500" />
            ) : (
              <WifiOff size={10} className="text-destructive" />
            )}
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          {isRecording && (
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center pt-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-secondary border border-border">
              <Bot size={24} className="text-muted-foreground" />
            </div>
            <h2 className="text-base font-bold mb-1.5 text-foreground">¡Hola!</h2>
            <p className="text-xs text-center max-w-[220px] leading-relaxed mb-6 text-muted-foreground">
              Puedo organizar tus tareas, resumir tus clases, y moverme por la app.
            </p>
            
            {/* Estado de conexión */}
            <div className={clsx(
              "px-3 py-1.5 rounded-full text-[10px] font-medium mb-4 flex items-center gap-1.5",
              wsConnected ? "bg-green-100 text-green-700" : 
              wsConnecting ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
            )}>
              {wsConnecting ? (
                <><Loader2 size={10} className="animate-spin" /> Conectando...</>
              ) : wsConnected ? (
                <><Wifi size={10} /> En tiempo real</>
              ) : (
                <><WifiOff size={10} /> Modo offline (HTTP)</>
              )}
            </div>
            
            <div className="w-full max-w-[260px] space-y-1.5">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-2">Sugerencias</p>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => setInput(sug)}
                  className="w-full bg-card hover:bg-secondary text-left px-3 py-2 rounded-xl text-xs text-foreground transition-colors border border-border"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "flex w-full",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
              key={msg.id || i}
            >
              <div
                className={clsx(
                  "max-w-[85%] p-3 leading-relaxed",
                  msg.role === "user"
                    ? "bg-foreground text-background rounded-xl rounded-tr-[4px]"
                    : "bg-card text-foreground rounded-xl rounded-tl-[4px] border border-border"
                )}
              >
                <p className="text-sm">{msg.content}</p>
                {msg.role === "ai" && msg.content && (
                  <button
                    onClick={() => handlePlayVoice(msg.content, msg.id!)}
                    className="mt-2 text-muted-foreground hover:text-foreground w-7 h-7 bg-secondary rounded-full flex items-center justify-center border border-border transition-colors"
                  >
                    {currentlyPlayingId === msg.id ? <StopCircle size={14} /> : <Play size={14} className="ml-0.5" />}
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}

        {isTyping && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-secondary p-4 rounded-2xl rounded-tl-[4px] flex items-center gap-1.5 border border-border">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 w-full max-w-md bg-card/90 backdrop-blur-xl border-t border-border p-2.5 pb-4 safe-bottom z-20" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 16px), 72px)" }}>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoiceRecording}
            className={clsx(
              "w-11 h-11 rounded-2xl flex flex-shrink-0 items-center justify-center transition-all",
              isRecording
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : isProcessing
                ? "bg-secondary text-muted-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            )}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isRecording ? (
              <StopCircle size={20} />
            ) : (
              <Mic size={20} />
            )}
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isRecording ? "Grabando..." : wsConnected ? "En tiempo real..." : "Escribe tu duda..."}
              disabled={isRecording || isProcessing}
              className="w-full bg-secondary border border-border rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background text-foreground transition-all placeholder:text-muted-foreground"
            />
            <AnimatePresence>
              {input.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleSend}
                  disabled={isProcessing}
                  className="absolute right-1.5 top-1.5 bottom-1.5 w-9 bg-foreground text-background rounded-xl flex items-center justify-center hover:bg-foreground/90 transition-colors"
                >
                  <Send size={16} className="ml-0.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
