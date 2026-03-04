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
  role: 'user' | 'assistant' | 'ai' | 'system';
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

      await aiService.chat(messageContent, messages.map(m => ({ 
        role: m.role === 'assistant' ? 'ai' : m.role as any, 
        content: m.content 
      })), (token) => {
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
        { id: Date.now().toString(), role: 'user', content: response.transcribed },
        { id: (Date.now() + 1).toString(), role: 'assistant', content: response.response }
      ]);

      if (response.audio) {
        setIsSpeaking(true);
        const audio = new Audio(`data:audio/mp3;base64,${response.audio}`);
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
    <div className="h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center overflow-hidden">
      <header className="w-full max-w-2xl px-5 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-black z-30 shrink-0 border-b border-zinc-900">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800/50 flex items-center justify-center active:scale-95 transition-all">
          <ArrowLeft size={16} className="text-zinc-400" />
        </button>
        <h1 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Asistente</h1>
        <div className="w-9 flex justify-end">
          {isSpeaking && <Volume2 size={16} className="text-white animate-pulse" />}
        </div>
      </header>

      <main ref={scrollRef} className="w-full max-w-2xl flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20 py-10">
            <Sparkles size={48} strokeWidth={1.5} className="text-zinc-500" />
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Listo para consultas</p>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {messages.map((m) => (
            <div 
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm relative ${
                m.role === 'user' 
                  ? 'bg-zinc-800 text-zinc-100' 
                  : 'bg-zinc-900/50 border border-zinc-800/50 text-zinc-300'
              }`}>
                <p className="text-sm leading-relaxed">{m.content}</p>
                <span className={`absolute -bottom-5 text-[8px] font-bold uppercase tracking-widest text-zinc-700 ${m.role === 'user' ? 'right-1' : 'left-1'}`}>
                  {m.role === 'user' ? 'Usuario' : 'IA'}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-2xl flex items-center gap-3">
              <Loader2 size={14} className="animate-spin text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Procesando</span>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-2xl p-5 bg-black border-t border-zinc-900 pb-8">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe un mensaje..."
              className="w-full bg-zinc-900 border border-zinc-800/50 rounded-xl pl-5 pr-12 py-3.5 text-sm font-medium focus:outline-none focus:border-zinc-700 transition-all text-white placeholder:text-zinc-700"
            />
            <button 
              onClick={() => handleSend()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center active:scale-95 transition-all"
            >
              <Send size={14} className="text-zinc-400" />
            </button>
          </div>
          
          <button 
            onClick={isRecording ? stopVoice : startVoice}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
              isRecording 
                ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
          >
            {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </footer>
    </div>
  );
}
