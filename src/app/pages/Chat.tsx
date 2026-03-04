import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, StopCircle, Volume2, VolumeX, ArrowLeft, AudioLines, Sparkles, Loader2 } from "lucide-react";
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
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingResponseRef = useRef<string | null>(null);

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
      } finally {
        setIsProcessing(false);
      }
    } else {
      const ok = await audioService.requestPermissions();
      if (!ok) return;
      try {
        await audioService.startAudioRecording();
        setIsRecording(true);
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="h-[100dvh] bg-black text-white font-sans flex flex-col overflow-hidden">
      {/* Header Compacto - Adaptado para Apple/Android */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Asistente IA</h1>
        </div>
        <button onClick={() => setAutoSpeak(!autoSpeak)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
          {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} className="text-white/40" />}
        </button>
      </div>

      {/* Messages - Ajuste de altura dinámica */}
      <div className="flex-1 px-4 space-y-4 overflow-y-auto scrollbar-hide pt-4 pb-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <AudioLines size={60} strokeWidth={1} />
            <p className="mt-2 text-sm font-black uppercase italic tracking-widest text-center">IA Unificada</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id || i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={clsx("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}
          >
            <div className={clsx(
              "max-w-[85%] p-4 rounded-2xl text-base font-medium leading-snug shadow-lg",
              msg.role === "user" ? "bg-emerald-500 text-white rounded-tr-sm" : "bg-zinc-900 text-white rounded-tl-sm border border-white/5"
            )}>
              {msg.content || (
                <div className="flex gap-1.5 p-1">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-2">
            <Loader2 size={14} className="animate-spin text-blue-500" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">IA Procesando</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Zone - Ajuste Apple/Android y Teclado */}
      <div className="shrink-0 p-4 bg-black border-t border-white/5 pb-10">
        <div className="max-w-md mx-auto flex gap-2 items-end">
          <motion.button
            onClick={toggleVoiceRecording}
            whileTap={{ scale: 0.9 }}
            className={clsx(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 shadow-lg",
              isRecording ? "bg-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.3)]" : "bg-zinc-900 border border-white/10"
            )}
          >
            {isRecording ? <StopCircle size={18} fill="white" /> : <Mic size={18} />}
          </motion.button>

          <div className="flex-1 relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder={isRecording ? "Grabando..." : "Hablemos?"}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:ring-1 focus:ring-white/20 resize-none overflow-hidden min-h-[48px] max-h-[120px] placeholder:text-white/10"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <AnimatePresence>
              {input.trim() && !isRecording && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleSend()}
                  className="absolute right-1.5 bottom-1.5 w-9 h-9 bg-white text-black rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Send size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
