import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, StopCircle, Volume2, VolumeX, ArrowLeft, Sparkles, Loader2, Plus, Paperclip, Copy, Share2, ThumbsUp, ThumbsDown, Square, Edit3, Menu } from "lucide-react";
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
    <div className="h-[100dvh] bg-[#0a0a0a] text-white font-sans flex flex-col overflow-hidden selection:bg-white/10">
      {/* Top Navigation Bar - Ultra Slim */}
      <div className="px-4 pt-10 pb-2 flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-white/60 hover:text-white active:scale-90 transition-all">
            <Menu size={20} />
          </button>
          <div className="flex gap-6 items-center">
            <button className="text-sm font-black uppercase tracking-widest border-b-2 border-white pb-1">Pregunta</button>
            <button className="text-sm font-bold text-white/30 uppercase tracking-widest pb-1">Imagine</button>
          </div>
        </div>
        <button onClick={() => setMessages([])} className="p-2 text-white/60 hover:text-white active:scale-90 transition-all">
          <Edit3 size={20} />
        </button>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 px-6 space-y-8 overflow-y-auto scrollbar-hide pt-6 pb-40">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-[0.03]">
            <Sparkles size={120} strokeWidth={0.5} />
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
              <div className="bg-[#1a1a1a] text-white/90 px-5 py-3 rounded-[24px] text-[15px] font-medium max-w-[85%] shadow-sm">
                {msg.content}
              </div>
            ) : (
              <div className="space-y-4 max-w-full">
                <div className="text-[16px] leading-relaxed text-white/90 font-medium">
                  {msg.content || (
                    <div className="flex gap-1.5 p-1">
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>
                {msg.content && (
                  <div className="flex items-center gap-4 text-white/30">
                    <button className="hover:text-white transition-colors"><Copy size={16} /></button>
                    <button className="hover:text-white transition-colors"><Share2 size={16} /></button>
                    <button className="hover:text-white transition-colors"><ThumbsUp size={16} /></button>
                    <button className="hover:text-white transition-colors"><ThumbsDown size={16} /></button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && !messages.find(m => m.role === 'ai' && m.content === '') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 p-1">
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:0.4s]" />
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Brutal Input Bar Area */}
      <div className="shrink-0 px-4 pb-10 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent z-20">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Quick Action Buttons - Slim Style */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-1">
            <button className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white/60 shrink-0"><Plus size={20} /></button>
            <button className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white/60 shrink-0"><Volume2 size={20} /></button>
            <button className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white/60 shrink-0"><Mic size={20} /></button>
            <button onClick={() => setIsAddingClass(true)} className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white/60 shrink-0"><BookOpen size={20} /></button>
          </div>

          {/* Combined Input + Stop/Record Button */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#1a1a1a] border border-white/[0.03] rounded-[32px] px-5 py-4 flex items-center gap-3">
              <Paperclip size={20} className="text-white/30" />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Pregunta lo que quieras_"
                className="flex-1 bg-transparent border-none focus:outline-none text-[15px] text-white placeholder:text-white/20 resize-none min-h-[24px] max-h-[120px]"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>

            <motion.button
              onClick={isRecording ? toggleVoiceRecording : isProcessing ? undefined : () => handleSend()}
              whileTap={{ scale: 0.92 }}
              className={clsx(
                "h-14 min-w-[100px] px-6 rounded-[28px] flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl",
                isRecording 
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                  : input.trim() 
                    ? "bg-white text-black" 
                    : "bg-[#1a1a1a] text-white/40"
              )}
            >
              {isRecording ? (
                <>
                  <div className="w-3 h-3 bg-black rounded-[2px]" />
                  <span className="text-[13px] font-black uppercase italic tracking-tighter">Detener</span>
                </>
              ) : isProcessing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} className={clsx(input.trim() ? "text-black" : "text-white/20")} />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <AddClassModal isOpen={isAddingClass} onClose={() => setIsAddingClass(false)} />
    </div>
  );
}
