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

      await aiService.chat(userMessage, (token) => {
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
        const { text } = await aiService.processAudio(audioBlob);
        setInput(text);
        setIsProcessing(false);
      } catch (error) {
        console.error(error);
        setIsRecording(false);
        setIsProcessing(false);
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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100/80 px-4 pt-5 pb-3 sticky top-0 z-10 flex items-center shadow-sm">
        <div className="flex-1" />
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center mb-1 relative shadow-inner">
            <Bot size={22} className="text-indigo-600" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <h1 className="text-sm font-bold text-gray-900 leading-none">Asistente IA</h1>
          <p className="text-[10px] text-gray-400 font-medium">Siempre activo</p>
        </div>
        <div className="flex-1 flex justify-end">
          {isRecording && (
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center pt-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
              <Bot size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">¡Hola! Soy tu asistente</h2>
            <p className="text-sm text-gray-500 text-center max-w-[240px] leading-relaxed mb-8">
              Puedo organizar tus tareas, resumir tus clases, y moverme por la app si me lo pides.
            </p>
            
            <div className="w-full max-w-[280px] space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-3">Sugerencias</p>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => setInput(sug)}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-left px-4 py-3 rounded-2xl text-sm text-gray-700 transition-colors border border-gray-100/50"
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
                  "max-w-[85%] p-3.5 shadow-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-2xl rounded-tr-[4px]"
                    : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-[4px]"
                )}
              >
                <p className="text-sm">{msg.content}</p>
                {msg.role === "ai" && msg.content && (
                  <button
                    onClick={() => handlePlayVoice(msg.content, msg.id!)}
                    className="mt-2 text-indigo-500 hover:text-indigo-700 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm"
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
            <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-[4px] flex items-center gap-1.5 shadow-sm">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-100/80 p-3 pt-4 pb-5 safe-bottom z-20" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 20px), 80px)" }}>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoiceRecording}
            className={clsx(
              "w-11 h-11 rounded-2xl flex flex-shrink-0 items-center justify-center transition-all shadow-sm",
              isRecording
                ? "bg-red-50 text-red-500 animate-pulse border border-red-100"
                : isProcessing
                ? "bg-gray-100 text-gray-400"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm"
            />
            <AnimatePresence>
              {input.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleSend}
                  disabled={isProcessing}
                  className="absolute right-1.5 top-1.5 bottom-1.5 w-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm"
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
