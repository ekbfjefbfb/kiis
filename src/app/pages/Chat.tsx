
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
      const aiMsg: Message = { id: Date.now() + 1, sender: "ai", text: "" };
      setMessages((prev) => [...prev, aiMsg]);

      const response = await aiService.chat(input, (partialText) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = partialText;
          return updated;
        });
      });

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = response;
        return updated;
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
      alert("Microphone permission needed");
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
    const lastAi = messages.filter((m) => m.sender === "ai").pop();
    if (lastAi) audioService.speak(lastAi.text);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl sticky top-0 z-10 px-5 py-3.5 border-b border-gray-100/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Study Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-medium">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setMessages([])}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors rounded-xl hover:bg-gray-100"
          title="Clear Chat"
        >
          <RefreshCcw size={16} />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 pb-36">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6"
          >
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot size={28} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1.5">
              How can I help you today?
            </h2>
            <p className="text-sm text-gray-400">
              Ask me anything about your studies
            </p>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {["Summarize my notes", "Help with calculus", "Study tips", "Explain derivatives"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs px-3.5 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
                  >
                    {s}
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
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
            <div className="bg-white border border-gray-100 p-3.5 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center h-10 w-16 justify-center">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-[56px] safe-bottom w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-100/60 p-3 z-20">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.85 }}
            type="button"
            onClick={handleVoiceInput}
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0",
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            )}
          >
            <Mic size={18} />
          </motion.button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-gray-50 border-0 rounded-full py-3 pl-4 pr-12 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
            >
              <Send size={14} className="ml-0.5" />
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.85 }}
            type="button"
            onClick={handleSpeak}
            disabled={messages.filter((m) => m.sender === "ai").length === 0}
            className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-all disabled:opacity-30 flex-shrink-0"
          >
            <Volume2 size={18} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
