import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send, Bot, StopCircle, Loader2, Play, Volume2, VolumeX, X, Zap, Sparkles } from "lucide-react";
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
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const pendingResponseRef = useRef<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState("");

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

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const userMessage = input.trim();
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
        setCurrentTranscript(transcript);
        
        const userMsgId = Date.now().toString();
        setMessages(prev => [...prev, { id: userMsgId, role: "user", content: transcript, timestamp: Date.now() }]);
        
        setIsProcessing(false);
        setIsTyping(true);
        const aiResponseId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiResponseId, role: "ai", content: "", timestamp: Date.now() }]);

        if (chatWebSocket.isConnected()) {
          pendingResponseRef.current = aiResponseId;
          chatWebSocket.sendMessage(transcript);
        } else {
          await sendViaHttp(transcript, aiResponseId);
          setIsTyping(false);
        }
      } catch (error) {
        setIsProcessing(false);
        setIsTyping(false);
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
    <div className="min-h-[100dvh] bg-black text-white font-sans flex flex-col">
      {/* Header Minimal */}
      <div className="px-6 pt-10 pb-6 flex justify-between items-center bg-black/80 backdrop-blur-xl sticky top-0 z-20">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Chat IA</h1>
        <button onClick={() => setAutoSpeak(!autoSpeak)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
          {autoSpeak ? <Volume2 size={24} /> : <VolumeX size={24} className="text-white/40" />}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-40 pt-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-20">
            <Bot size={80} strokeWidth={1} />
            <p className="mt-4 text-xl font-bold uppercase italic">Listo para escucharte</p>
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
              "max-w-[90%] p-6 rounded-[32px] text-xl font-medium leading-tight",
              msg.role === "user" ? "bg-emerald-500 text-white rounded-tr-sm" : "bg-zinc-900 text-white rounded-tl-sm border border-white/5"
            )}>
              {msg.content || <Loader2 className="animate-spin" />}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-2 p-4">
            <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fijo Abajo */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-30">
        <div className="max-w-md mx-auto space-y-4">
          
          <div className="flex gap-3 items-end">
            <motion.button
              onClick={toggleVoiceRecording}
              whileTap={{ scale: 0.9 }}
              className={clsx(
                "w-20 h-20 rounded-[30px] flex items-center justify-center transition-all duration-500",
                isRecording ? "bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)]" : "bg-zinc-900 border border-white/10"
              )}
            >
              {isRecording ? <StopCircle size={32} fill="white" /> : <Mic size={32} />}
            </motion.button>

            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Escribe algo..."
                className="w-full bg-zinc-900 border border-white/10 rounded-[30px] px-6 py-6 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-white/20 resize-none overflow-hidden"
                style={{ height: '80px' }}
              />
              <AnimatePresence>
                {input.trim() && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleSend}
                    className="absolute right-3 bottom-3 w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Send size={24} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
