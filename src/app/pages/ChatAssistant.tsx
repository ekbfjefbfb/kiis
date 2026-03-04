import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, Mic, Send, StopCircle, Loader2, 
  Sparkles, Brain, Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { aiService } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageContent = text || input;
    if (!messageContent.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      let aiResponse = "";
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: "" }]);

      await aiService.chat(messageContent, messages.map(m => ({ role: m.role, content: m.content })), (token) => {
        aiResponse += token;
        setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: aiResponse } : m));
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const startVoice = async () => {
    const ok = await audioService.requestPermissions();
    if (!ok) return;
    try {
      await audioService.startAudioRecording();
      setIsRecording(true);
    } catch (e) { console.error(e); }
  };

  const stopVoice = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    try {
      const audioBlob = await audioService.stopAudioRecording();
      const response = await aiService.chatVoice(audioBlob);
      
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), role: 'user', content: response.transcript },
        { id: (Date.now() + 1).toString(), role: 'assistant', content: response.ai_response }
      ]);

      if (response.audio_base64) {
        setIsSpeaking(true);
        const audio = new Audio(`data:audio/mp3;base64,${response.audio_base64}`);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center overflow-hidden" style={{ backgroundColor: '#000000' }}>
      <header className="w-full max-w-2xl px-8 pt-16 pb-8 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-30 shrink-0">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-zinc-400" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
            <Brain size={20} className="text-white" />
          </div>
          <h1 className="text-sm font-black uppercase italic tracking-[0.2em]">IA_Assistant_</h1>
        </div>
        <div className="w-12 flex justify-end">
          {isSpeaking && <Volume2 size={20} className="text-white animate-pulse" />}
        </div>
      </header>

      <main ref={scrollRef} className="w-full max-w-2xl flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20 py-20">
            <Sparkles size={64} strokeWidth={1} />
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.6em]">Terminal_Inteligente_</p>
              <p className="text-xs italic opacity-60">Realiza consultas sobre tus clases_</p>
            </div>
          </div>
        )}
        
        {messages.map((m) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-6 rounded-[32px] ${
              m.role === 'user' 
                ? 'bg-white text-black font-bold italic shadow-xl' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
            }`}>
              <p className="text-sm leading-relaxed">{m.content}</p>
            </div>
          </motion.div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[32px] shadow-lg">
              <Loader2 size={18} className="animate-spin text-zinc-500" />
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-2xl p-8 bg-black/80 backdrop-blur-xl border-t border-zinc-800 pb-12">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Terminal prompt..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-[28px] pl-8 pr-14 py-5 text-sm font-medium focus:outline-none focus:border-white/20 focus:bg-zinc-800 transition-all italic text-white"
            />
            <button 
              onClick={() => handleSend()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform shadow-lg"
            >
              <Send size={16} className="text-black" />
            </button>
          </div>
          
          <button 
            onClick={isRecording ? stopVoice : startVoice}
            className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all ${
              isRecording ? 'bg-red-500 border-black animate-pulse' : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            {isRecording ? <StopCircle size={28} /> : <Mic size={28} className="text-white" />}
          </button>
        </div>
      </footer>
    </div>
  );
}
