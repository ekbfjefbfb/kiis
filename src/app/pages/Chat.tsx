import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, StopCircle, Volume2, VolumeX, ArrowLeft, Sparkles, Loader2, Paperclip, Copy, Share2, ThumbsUp, AudioLines } from "lucide-react";
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
    <div className="h-[100dvh] bg-black text-white font-sans flex flex-col overflow-hidden selection:bg-white/10">
      {/* Header Minimalista */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">Asistente</h1>
        </div>
        <button onClick={() => setAutoSpeak(!autoSpeak)} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
          {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} className="text-white/30" />}
        </button>
      </div>

      {/* Messages - Área de scroll limpia */}
      <div className="flex-1 px-6 space-y-8 overflow-y-auto scrollbar-hide pt-6 pb-40">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-[0.02]">
            <Sparkles size={100} strokeWidth={0.5} />
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}
          >
            {msg.role === "user" ? (
              <div className="bg-[#1a1a1a] text-white/90 px-5 py-3 rounded-[24px] text-[15px] font-medium max-w-[85%] border border-white/[0.03]">
                {msg.content}
              </div>
            ) : (
              <div className="space-y-4 max-w-full">
                <div className="text-[16px] leading-relaxed text-white/90 font-medium">
                  {msg.content || (
                    <div className="flex gap-1.5 p-1">
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>
                {msg.content && (
                  <div className="flex items-center gap-4 text-white/20">
                    <button onClick={() => navigator.clipboard.writeText(msg.content)} className="hover:text-white transition-colors"><Copy size={14} /></button>
                    <button className="hover:text-white transition-colors"><Share2 size={14} /></button>
                    <button className="hover:text-white transition-colors"><ThumbsUp size={14} /></button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && !messages.find(m => m.role === 'ai' && m.content === '') && (
          <div className="flex gap-1.5 p-1 opacity-40">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Zone - Brutal y Compacta */}
      <div className="shrink-0 px-4 pb-10 bg-gradient-to-t from-black via-black to-transparent z-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1a1a1a] border border-white/[0.05] rounded-[32px] p-2 flex flex-col gap-2 shadow-2xl">
            <div className="px-4 py-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Pregunta cualquier cosa"
                className="w-full bg-transparent border-none focus:outline-none text-[16px] text-white placeholder:text-white/20 resize-none min-h-[44px] max-h-[120px] py-2"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>
            
            <div className="flex items-center justify-between px-2 pb-1">
              <div className="flex items-center gap-1">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white active:bg-white/5 transition-all">
                  <Paperclip size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleVoiceRecording}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white active:bg-white/10 transition-all"
                >
                  <Mic size={20} />
                </button>
                
                <motion.button
                  onClick={isRecording ? toggleVoiceRecording : isProcessing ? undefined : (input.trim() ? () => handleSend() : toggleVoiceRecording)}
                  whileTap={{ scale: 0.95 }}
                  className={clsx(
                    "h-11 flex items-center justify-center gap-2 px-5 rounded-full transition-all duration-300 font-bold",
                    isRecording 
                      ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                      : "bg-[#0a0a0a] text-white border border-white/10"
                  )}
                >
                  {isRecording ? (
                    <>
                      <div className="w-2.5 h-2.5 bg-black rounded-[1px]" />
                      <span className="text-[13px] font-black uppercase italic tracking-tighter">Detener</span>
                    </>
                  ) : isProcessing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : input.trim() ? (
                    <Send size={18} />
                  ) : (
                    <>
                      <AudioLines size={18} className="text-white" />
                      <span className="text-[13px] font-black uppercase italic tracking-tighter">Hablar</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
