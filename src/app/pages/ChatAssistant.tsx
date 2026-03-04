import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, Mic, Send, StopCircle, Loader2, 
  Sparkles, User, Brain, Volume2, VolumeX
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
    <div className="h-[100dvh] w-full bg-black text-white font-sans flex flex-col relative overflow-hidden" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <header className="px-6 pt-12 pb-6 flex justify-between items-center border-b border-zinc-800 bg-black sticky top-0 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-zinc-800">
            <Brain size={16} className="text-white" />
          </div>
          <h1 className="text-sm font-bold uppercase italic tracking-widest">Asistente_IA</h1>
        </div>
        <div className="w-10 flex justify-end">
          {isSpeaking && <Volume2 size={18} className="text-white animate-pulse" />}
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
            <Sparkles size={48} strokeWidth={1} />
            <p className="text-[10px] font-bold uppercase tracking-[0.5em]">Consulta cualquier duda_</p>
          </div>
        )}
        
        {messages.map((m) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-5 rounded-[24px] ${
              m.role === 'user' 
                ? 'bg-zinc-900 border border-zinc-800 text-white italic' 
                : 'bg-white/5 border border-white/10 text-zinc-300'
            }`}>
              <p className="text-sm leading-relaxed">{m.content}</p>
            </div>
          </motion.div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-5 rounded-[24px]">
              <Loader2 size={16} className="animate-spin text-zinc-500" />
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 bg-black border-t border-zinc-800 pb-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu duda..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-[24px] pl-6 pr-12 py-4 text-sm focus:outline-none focus:border-zinc-700 transition-all italic"
            />
            <button 
              onClick={() => handleSend()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <Send size={14} className="text-black" />
            </button>
          </div>
          
          <button 
            onClick={isRecording ? stopVoice : startVoice}
            className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${
              isRecording ? 'bg-red-500 border-red-500 animate-pulse' : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            {isRecording ? <StopCircle size={24} /> : <Mic size={24} className="text-white" />}
          </button>
        </div>
      </footer>
    </div>
  );
}
