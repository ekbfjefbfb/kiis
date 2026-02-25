
import { useState, useRef, useEffect } from "react";
import { Send, Bot, RefreshCcw, Mic, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { aiService } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const aiMsg: Message = { 
        id: Date.now() + 1, 
        sender: "ai", 
        text: "" 
      };
      setMessages((prev) => [...prev, aiMsg]);

      const response = await aiService.chat(input, (partialText) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = partialText;
          return newMessages;
        });
      });

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = response;
        return newMessages;
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      audioService.stopRecording();
      setIsRecording(false);
      return;
    }

    const hasPermission = await audioService.requestPermissions();
    if (!hasPermission) {
      alert("Necesitas dar permiso al micrófono");
      return;
    }

    setIsRecording(true);
    audioService.startRecording(
      (text) => {
        setInput(text);
        setIsRecording(false);
      },
      (error) => {
        console.error("Error:", error);
        setIsRecording(false);
      }
    );
  };

  const handleSpeak = () => {
    const lastAiMessage = messages.filter(m => m.sender === "ai").pop();
    if (lastAiMessage) {
      audioService.speak(lastAiMessage.text);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Study Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([])} 
          className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          title="Clear Chat"
        >
          <RefreshCcw size={18} />
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 px-6"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">How can I help you today?</h2>
            <p className="text-sm text-gray-500">
              Ask me anything about your studies
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                "flex w-full",
                msg.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={clsx(
                  "max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed",
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                )}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start w-full"
          >
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center h-10 w-16 justify-center">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-[70px] w-full max-w-md bg-white border-t border-gray-100 p-4 z-20">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-sm",
              isRecording 
                ? "bg-red-500 text-white animate-pulse scale-105" 
                : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
            )}
            title={isRecording ? "Stop recording" : "Voice input"}
          >
            <Mic size={18} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-gray-100 border-0 rounded-full py-3.5 pl-5 pr-14 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all shadow-inner placeholder:text-gray-400"
            />
            
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
              title="Send message"
            >
              <Send size={14} className="ml-0.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSpeak}
            disabled={messages.filter(m => m.sender === "ai").length === 0}
            className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
            title="Listen to last message"
          >
            <Volume2 size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
