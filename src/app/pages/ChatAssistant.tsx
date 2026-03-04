import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Mic, ArrowRight } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      let aiResponse = "";
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: "" }]);

      await aiService.chat(input, messages.map(m => ({ 
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

  const toggleVoice = async () => {
    if (isRecording) {
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
          const audio = new Audio(`data:audio/mp3;base64,${response.audio}`);
          audio.play();
        }
      } catch (e) {
        console.error(e);
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
    <div className="h-[100dvh] bg-black text-white flex flex-col">
      {/* Header - solo flecha */}
      <header className="px-5 pt-12 pb-4 flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center active:opacity-50 transition-opacity"
        >
          <ArrowLeft size={22} className="text-white" />
        </button>
      </header>

      {/* Mensajes */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={m.role === 'user' 
              ? 'bg-zinc-800 text-white px-4 py-3 rounded-2xl text-base max-w-[80%]' 
              : 'text-white text-base leading-relaxed max-w-[90%]'
            }>
              {m.content}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start items-center gap-1.5 px-1 py-2">
            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
          </div>
        )}
      </main>

      {/* Footer - input limpio */}
      <footer className="px-5 pb-8 pt-4">
        <div className="flex items-center gap-3 bg-zinc-900 rounded-full px-4 py-3">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pregunta algo..."
            className="flex-1 bg-transparent border-none text-white text-base placeholder:text-zinc-600 outline-none"
          />
          
          {input.trim() ? (
            <button 
              onClick={handleSend}
              className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center active:scale-90 transition-transform"
            >
              <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              onClick={toggleVoice}
              className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all ${
                isRecording ? "bg-red-500 text-white" : "bg-white text-black"
              }`}
            >
              <Mic size={18} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
