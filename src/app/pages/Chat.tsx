import { useState, useRef, useEffect } from "react";
import { Mic, Send, Bot, StopCircle, ArrowLeft, Loader2, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { useNavigate } from "react-router";
import { aiService } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleNavigationCommand = (text: string) => {
    const navMatch = text.match(/\[NAVIGATE:(.*?)\]/);
    if (navMatch && navMatch[1]) {
      const route = navMatch[1].trim();
      setTimeout(() => navigate(route), 1500); // 1.5s delay so user sees message
      return text.replace(/\[NAVIGATE:.*?\]/g, "").trim();
    }
    return text;
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const userMessage = input.trim();
    setInput("");
    
    // Convert current messages state to the format aiService expects
    const historyForAi = messages.map(m => ({
      role: m.role as "user" | "ai" | "system",
      content: m.content
    }));

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);
    
    try {
      let finalResponse = "";
      const aiResponseId = (Date.now() + 1).toString();
      
      setMessages((prev) => [
        ...prev,
        { id: aiResponseId, role: "ai", content: "", timestamp: Date.now() }
      ]);

      await aiService.chat(userMessage, historyForAi, (token) => {
        finalResponse += token;
        setMessages((prev) => 
          prev.map((m) => m.id === aiResponseId ? { ...m, content: finalResponse } : m)
        );
      });

      // Cleanup response text and check for navigation commands
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
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      try {
        const audioBlob = await audioService.stopAudioRecording();
        setIsRecording(false);
        setIsProcessing(true);
        
        // Transcripción real con Groq Whisper Large V3 Turbo
        const { text } = await aiService.processAudio(audioBlob);
        setInput(text);
        setIsProcessing(false);
      } catch (error: any) {
        console.error("Transcription error:", error);
        setIsRecording(false);
        setIsProcessing(false);
        // Mostrar error al usuario en lugar de fallar silenciosamente
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
      } catch (error) {
        console.error(error);
      }
    }
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
          <p className="text-[10px] font-medium text-muted-foreground">Pregúntame lo que sea</p>
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
              placeholder={isRecording ? "Grabando..." : "Escribe tu duda o dile dónde ir..."}
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
