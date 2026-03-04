import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, Send, Bot, User, Loader2, Volume2, VolumeX, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { aiService } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";
import { useDarkMode } from "../../hooks/useDarkMode";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
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
    <div className="h-[100dvh] w-full bg-background text-foreground font-sans overflow-hidden flex flex-col relative selection:bg-primary/20 transition-colors duration-300">
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1.5 text-left">IA_</p>
            <h1 className="text-xl font-bold uppercase italic tracking-tighter leading-none">Asistente</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform"
          >
            {isDark ? <Sun size={18} className="text-muted-foreground" /> : <Moon size={18} className="text-muted-foreground" />}
          </button>
          <button 
            onClick={() => setMute(!mute)}
            className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform text-muted-foreground"
          >
            {mute ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-8 pb-32 max-w-2xl mx-auto w-full">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "flex flex-col space-y-2.5",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-center gap-2 px-2">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">
                  {msg.role === "assistant" ? "Bot_" : "User_"}
                </span>
              </div>
              <div className={clsx(
                "max-w-[85%] p-6 rounded-[28px] text-base font-bold leading-tight italic tracking-tight",
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg" 
                  : "bg-secondary/50 border border-border text-foreground rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5 p-6">
              <Loader2 size={16} className="animate-spin text-muted-foreground" strokeWidth={3} />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">IA_</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent z-30 pb-[max(env(safe-area-inset-bottom,2rem),2.5rem)]">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="ESCRIBE_"
              className="w-full bg-secondary/80 border border-border rounded-[28px] pl-6 pr-14 py-5 text-xs font-bold placeholder:text-muted-foreground focus:outline-none focus:border-primary/20 transition-all backdrop-blur-md italic"
            />
            <button 
              onClick={() => handleSend(input)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform shadow-lg"
            >
              <Send size={16} />
            </button>
          </div>
          <button 
            onClick={toggleRecording}
            className={clsx(
              "w-14 h-14 rounded-[22px] flex items-center justify-center transition-all shadow-xl relative overflow-hidden",
              isRecording ? "bg-destructive scale-110 shadow-destructive/20" : "bg-secondary border border-border active:scale-95"
            )}
          >
            {isProcessing ? (
              <Loader2 size={20} className="animate-spin" strokeWidth={3} />
            ) : (
              <Mic size={20} className={isRecording ? "text-destructive-foreground" : "text-muted-foreground"} />
            )}
            {isRecording && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
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
