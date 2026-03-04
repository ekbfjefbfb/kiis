import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, Send, Bot, User, Loader2, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { aiService } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "HOLA. SOY TU ASISTENTE IA. ¿EN QUÉ PUEDO AYUDARTE HOY?" }
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mute, setMute] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { role: "user", content: text.toUpperCase() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      let aiContent = "";
      await aiService.chat(text, messages, (token) => {
        aiContent += token;
      });

      const assistantMsg: Message = { role: "assistant", content: aiContent.toUpperCase() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      try {
        const audioBlob = await audioService.stopAudioRecording();
        const transcript = await groqService.transcribe(audioBlob, "es");
        handleSend(transcript);
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    } else {
      const ok = await audioService.requestPermissions();
      if (!ok) return;
      await audioService.startAudioRecording();
      setIsRecording(true);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative selection:bg-white/20">
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1.5 text-left">IA Unificada_</p>
            <h1 className="text-2xl font-extrabold uppercase italic tracking-tighter leading-none">Asistente</h1>
          </div>
        </div>
        <button 
          onClick={() => setMute(!mute)}
          className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform text-zinc-500"
        >
          {mute ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-10 pb-32 max-w-2xl mx-auto w-full">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "flex flex-col space-y-3",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-center gap-2.5 px-3">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">
                  {msg.role === "assistant" ? "Sistema_" : "Usuario_"}
                </span>
              </div>
              <div className={clsx(
                "max-w-[85%] p-7 rounded-[36px] text-[17px] font-extrabold leading-tight italic tracking-tight",
                msg.role === "user" 
                  ? "bg-white text-black rounded-tr-none shadow-xl" 
                  : "bg-zinc-900/50 border border-white/5 text-zinc-200 rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-6">
              <Loader2 size={20} className="animate-spin text-zinc-700" strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 italic">IA Procesando_</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-30 pb-[max(env(safe-area-inset-bottom,2rem),2.5rem)]">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="ESCRIBE_O_GRABA_"
              className="w-full bg-zinc-900/80 border border-white/10 rounded-[32px] pl-7 pr-16 py-6 text-sm font-extrabold placeholder:text-zinc-800 focus:outline-none focus:border-white/20 transition-all backdrop-blur-md italic tracking-widest"
            />
            <button 
              onClick={() => handleSend(input)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center active:scale-90 transition-transform shadow-lg"
            >
              <Send size={20} />
            </button>
          </div>
          <button 
            onClick={toggleRecording}
            className={clsx(
              "w-16 h-16 rounded-[28px] flex items-center justify-center transition-all shadow-2xl relative overflow-hidden group",
              isRecording ? "bg-red-500 scale-110 shadow-red-500/20" : "bg-zinc-900 border border-white/10 active:scale-95"
            )}
          >
            {isProcessing ? (
              <Loader2 size={24} className="animate-spin" strokeWidth={3} />
            ) : (
              <Mic size={24} className={isRecording ? "text-white" : "text-zinc-600 group-active:text-white"} />
            )}
            {isRecording && (
              <motion.div 
                animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-white/20 rounded-full"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
