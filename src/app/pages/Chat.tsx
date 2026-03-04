import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, StopCircle, Volume2, VolumeX, ArrowLeft, Sparkles, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { useNavigate } from "react-router";
import { aiService, chatWebSocket } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";
import AddClassModal from "../components/AddClassModal";

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
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingResponseRef = useRef<string | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || 'anonymous_user';
    chatWebSocket.connect(userId, {
      onMessage: (data) => {
        if (pendingResponseRef.current) {
          const aiResponseId = pendingResponseRef.current;
          const cleanedText = handleNavigationCommand(data.response);
          setMessages((prev) => prev.map((m) => m.id === aiResponseId ? { ...m, content: cleanedText } : m));
          pendingResponseRef.current = null;
          setIsTyping(false);
          if (autoSpeak && cleanedText) {
            audioService.speak(cleanedText, () => {});
          }
        }
      },
      onConnect: () => console.log('✅ Conectado'),
      onError: () => console.log('❌ Error'),
      onClose: () => console.log('🔌 Cerrado'),
    });
    return () => {
      chatWebSocket.disconnect();
      audioService.stopSpeaking();
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

  const sendViaHttp = async (userMessage: string, aiResponseId: string) => {
    try {
      let finalResponse = "";
      await aiService.chat(userMessage, [], (token) => {
        finalResponse += token;
        setMessages((prev) => prev.map((m) => m.id === aiResponseId ? { ...m, content: finalResponse } : m));
      });
      const cleaned = handleNavigationCommand(finalResponse);
      setMessages(prev => prev.map(m => m.id === aiResponseId ? { ...m, content: cleaned } : m));
      if (autoSpeak && cleaned) {
        audioService.speak(cleaned, () => {});
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const userMessage = textOverride || input.trim();
    if (!userMessage || isProcessing) return;
    
    setInput("");
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: "user", content: userMessage, timestamp: Date.now() }]);
    
    setIsTyping(true);
    const aiResponseId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiResponseId, role: "ai", content: "", timestamp: Date.now() }]);

    if (chatWebSocket.isConnected()) {
      pendingResponseRef.current = aiResponseId;
      chatWebSocket.sendMessage(userMessage);
    } else {
      await sendViaHttp(userMessage, aiResponseId);
      setIsTyping(false);
    }
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      try {
        const audioBlob = await audioService.stopAudioRecording();
        const transcript = await groqService.transcribe(audioBlob, 'es');
        await handleSend(transcript);
      } catch (error) {
        console.error(error);
        setIsProcessing(false);
      }
    } else {
      const ok = await audioService.requestPermissions();
      if (!ok) return;
      try {
        audioService.stopSpeaking();
        await audioService.startAudioRecording();
        setIsRecording(true);
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="h-[100dvh] bg-black text-white font-sans flex flex-col overflow-hidden selection:bg-white/20">
      {/* Header Minimalista Extremo */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">Asistente</h1>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Chat + Voz</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsVoiceMode(!isVoiceMode)} 
            className={clsx(
              "px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all",
              isVoiceMode ? "bg-white text-black border-white" : "bg-zinc-900 text-white/40 border-white/10"
            )}
          >
            {isVoiceMode ? "Voz Pura" : "Modo Dual"}
          </button>
          <button onClick={() => setIsAddingClass(true)} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Messages - Más Compacto */}
      <div className={clsx(
        "flex-1 px-4 space-y-6 overflow-y-auto scrollbar-hide pt-6 pb-32 transition-all duration-500",
        isVoiceMode ? "opacity-20 blur-sm pointer-events-none" : "opacity-100"
      )}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-5">
            <Sparkles size={80} strokeWidth={1} />
            <p className="mt-4 text-sm font-black uppercase italic tracking-widest text-center">IA Unificada</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}
          >
            <div className={clsx(
              "max-w-[88%] p-5 rounded-[28px] text-[15px] font-medium leading-snug shadow-2xl transition-all",
              msg.role === "user" 
                ? "bg-zinc-800 text-white rounded-tr-sm border border-white/5" 
                : "bg-white text-black rounded-tl-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            )}>
              {msg.content || (
                <div className="flex gap-1.5 p-1">
                  <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-2 px-2">
              {msg.role === "user" ? "Tú" : "IA"}
            </span>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-white/5 rounded-full w-fit">
            <Loader2 size={12} className="animate-spin text-white/40" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Procesando</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Modo Voz Pura Overlay */}
      <AnimatePresence>
        {isVoiceMode && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <div className="relative">
              <motion.div 
                animate={isRecording ? { scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-white/20 rounded-full blur-3xl"
              />
              <Sparkles size={120} strokeWidth={1} className={clsx("transition-all duration-700", isRecording ? "text-white scale-110" : "text-white/5")} />
            </div>
            <div className="mt-12 text-center space-y-2">
              <p className="text-sm font-black uppercase italic tracking-[0.4em] text-white/60">
                {isRecording ? "Escuchando" : isProcessing ? "Procesando" : "Modo Voz Pura"}
              </p>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">SST + TTS Unificado</p>
            </div>
            
            {/* Animación de ondas visuales */}
            {isRecording && (
              <div className="absolute bottom-40 flex gap-1 items-end h-8">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, Math.random() * 32 + 8, 4] }}
                    transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.05 }}
                    className="w-1 bg-white/40 rounded-full"
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Zone - Compacta y Flotante */}
      <div className="shrink-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent pb-10 z-20">
        <div className="max-w-md mx-auto flex gap-4 items-end">
          <motion.button
            onClick={toggleVoiceRecording}
            whileTap={{ scale: 0.9 }}
            className={clsx(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 shadow-2xl",
              isRecording ? "bg-red-600 animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.4)]" : "bg-white text-black"
            )}
          >
            {isRecording ? <StopCircle size={28} fill="white" /> : <Mic size={28} />}
          </motion.button>

          {!isVoiceMode && (
            <div className="flex-1 relative flex items-center group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Hablemos?"
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 text-[15px] font-medium focus:outline-none focus:ring-1 focus:ring-white/20 resize-none overflow-hidden min-h-[56px] max-h-[120px] placeholder:text-white/10 text-white transition-all"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <AnimatePresence>
                {input.trim() && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleSend()}
                    className="absolute right-2 bottom-2 w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center active:scale-90 transition-transform shadow-lg"
                  >
                    <Send size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {isVoiceMode && (
             <div className="flex-1 flex flex-col justify-center h-16">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">SST Activo</p>
                <div className="flex items-center gap-2 mt-1 ml-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                   <p className="text-xs font-bold text-white/40 uppercase tracking-tighter italic">Pulsa para detener</p>
                </div>
             </div>
          )}
        </div>
      </div>

      <AddClassModal 
        isOpen={isAddingClass} 
        onClose={() => setIsAddingClass(false)} 
      />
    </div>
  );
}
