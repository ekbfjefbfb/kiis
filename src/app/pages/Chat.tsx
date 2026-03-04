import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, StopCircle, Volume2, VolumeX, ArrowLeft, Sparkles, Loader2, Plus, X } from "lucide-react";
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
            audioService.speak(cleanedText, () => {
              // En modo voz pura, podríamos auto-activar el micro aquí si quisiéramos manos libres total
            });
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
      {/* Header Compacto */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">IA Unificada</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsVoiceMode(!isVoiceMode)} 
            className={clsx(
              "px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all",
              isVoiceMode ? "bg-white text-black border-white" : "bg-zinc-900 text-white/40 border-white/10"
            )}
          >
            {isVoiceMode ? "SOLO VOZ" : "VOZ + TEXTO"}
          </button>
          <button onClick={() => setIsAddingClass(true)} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Messages - Ultra Compacto */}
      <div className={clsx(
        "flex-1 px-4 space-y-6 overflow-y-auto scrollbar-hide pt-6 transition-all duration-500",
        isVoiceMode ? "opacity-10 blur-xl pointer-events-none" : "opacity-100"
      )}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-5">
            <Sparkles size={80} strokeWidth={1} />
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
              "max-w-[85%] p-4 rounded-[24px] text-[15px] font-medium leading-snug shadow-2xl transition-all",
              msg.role === "user" 
                ? "bg-zinc-800 text-white rounded-tr-sm border border-white/5" 
                : "bg-white text-black rounded-tl-sm"
            )}>
              {msg.content || "..."}
            </div>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-2 px-2">
              {msg.role === "user" ? "Tú" : "IA"}
            </span>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-1.5 p-3 bg-zinc-900/50 w-fit rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Modo Voz Pura Overlay */}
      <AnimatePresence>
        {isVoiceMode && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-3xl"
          >
            <div className="relative flex items-center justify-center">
              <motion.div 
                animate={isRecording ? { scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute w-64 h-64 bg-white rounded-full blur-[80px]"
              />
              <Sparkles size={120} strokeWidth={0.5} className={clsx("transition-all duration-1000", isRecording ? "text-white scale-125" : "text-white/10")} />
            </div>
            <div className="mt-16 text-center">
              <p className="text-lg font-black uppercase italic tracking-[0.5em] text-white/60">
                {isRecording ? "TE ESCUCHO" : isProcessing ? "PROCESANDO" : "MODO VOZ"}
              </p>
              <div className="flex gap-1 justify-center mt-6 h-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={isRecording ? { height: [4, 16, 4] } : { height: 4 }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1 bg-white/30 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Zone - Eficiencia Máxima */}
      <div className="shrink-0 p-6 bg-gradient-to-t from-black via-black to-transparent pb-12 z-20">
        <div className="max-w-md mx-auto flex gap-4 items-center">
          <motion.button
            onClick={toggleVoiceRecording}
            whileTap={{ scale: 0.85 }}
            className={clsx(
              "w-20 h-20 rounded-[32px] flex items-center justify-center transition-all duration-500 shrink-0 shadow-2xl",
              isRecording ? "bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.5)]" : "bg-white text-black"
            )}
          >
            {isRecording ? <StopCircle size={32} fill="white" /> : <Mic size={32} />}
          </motion.button>

          {!isVoiceMode && (
            <div className="flex-1 relative flex items-center group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Hablemos?"
                className="w-full bg-zinc-900/80 border border-white/10 rounded-[24px] px-6 py-5 text-[16px] font-medium focus:outline-none focus:ring-1 focus:ring-white/20 resize-none overflow-hidden min-h-[64px] max-h-[140px] placeholder:text-white/10 text-white transition-all shadow-xl"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <AnimatePresence>
                {input.trim() && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleSend()}
                    className="absolute right-3 bottom-3 w-11 h-11 bg-white text-black rounded-2xl flex items-center justify-center active:scale-90 transition-transform shadow-lg"
                  >
                    <Send size={20} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {isVoiceMode && (
             <div className="flex-1 flex flex-col justify-center py-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 italic">HABLA AHORA</p>
                <div className="flex items-center gap-3 mt-2 ml-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                   <p className="text-sm font-bold text-white/60 uppercase tracking-tighter italic">SST + TTS Activo</p>
                </div>
             </div>
          )}
        </div>
      </div>

      <AddClassModal isOpen={isAddingClass} onClose={() => setIsAddingClass(false)} />
    </div>
  );
}
