import { useState } from "react";
import {
  ArrowLeft, Calendar, User, Trash2, Plus, X, ChevronRight, Zap, 
  MessageCircle, Mic, Square, Loader2, Star, BookOpen, Clock, CheckSquare
} from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { CLASSES, TASKS, EXAMS, removeClass, addExam, removeExam } from "../data/mock";
import { aiService } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";

type TabType = "chat" | "info" | "tasks";

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls] = useState(CLASSES.find((c) => c.id === id));
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [activeTask, setActiveTask] = useState<any | null>(null);

  // Chat/Recording Unified State
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string; id: string }>>([
    { id: "1", role: "ai", text: "¡Hola! Soy tu asistente para esta clase. Puedo ayudarte con dudas, resumir lo que grabes o repasar temas." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  if (!cls) return null;

  const classTasks = TASKS.filter((t) => t.classId === id);
  const classExams = EXAMS.filter((e) => e.classId === id);

  const handleSendChat = async (textOverride?: string) => {
    const msg = textOverride || chatInput.trim();
    if (!msg || isProcessing) return;
    
    setChatInput("");
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: "user", text: msg }]);
    setIsProcessing(true);

    try {
      const response = await aiService.chat(
        `CONTEXTO CLASE: ${cls.name}. PROFE: ${cls.professor}. TEMAS: ${cls.importantTopics.join(", ")}. PREGUNTA: ${msg}`
      );
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: response }]);
    } catch {
      setMessages(prev => [...prev, { id: "err", role: "ai", text: "Error de conexión. Reintenta." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      try {
        const audioBlob = await audioService.stopAudioRecording();
        const transcript = await groqService.transcribe(audioBlob, 'es');
        await handleSendChat(`He grabado esto de la clase, por favor resúmelo y extrae puntos clave: ${transcript}`);
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
      }
    } else {
      const ok = await audioService.requestPermissions();
      if (!ok) return;
      try {
        await audioService.startAudioRecording();
        setIsRecording(true);
        setRecordingTime(0);
      } catch (e) { console.error(e); }
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-[100dvh] bg-black text-white pb-24 font-sans flex flex-col">
      {/* Header Minimalista */}
      <div className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{cls.name}</h1>
            <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-1">{cls.professor}</p>
          </div>
        </div>
        <button onClick={() => { if(confirm("¿Eliminar clase?")) { removeClass(cls.id); navigate("/dashboard"); } }} className="text-red-500/50 p-2 active:text-red-500 transition-colors">
          <Trash2 size={20} />
        </button>
      </div>

      {/* Selector de Tabs Gigante */}
      <div className="px-6 mb-6">
        <div className="flex bg-white/5 rounded-[24px] p-1.5">
          {(["chat", "tasks", "info"] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={clsx(
                "flex-1 py-4 rounded-[18px] text-sm font-black uppercase italic transition-all",
                activeTab === t ? "bg-white text-black shadow-xl scale-100" : "text-white/30 scale-95"
              )}
            >
              {t === "chat" && "Chat & Voz"}
              {t === "tasks" && "Agenda"}
              {t === "info" && "Info"}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 px-6">
        <AnimatePresence mode="wait">
          {activeTab === "chat" && (
            <motion.div key="chat" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="flex flex-col h-[calc(100dvh-320px)]">
              <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide pb-10">
                {messages.map((m) => (
                  <div key={m.id} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={clsx(
                      "max-w-[90%] p-6 rounded-[32px] text-xl font-medium leading-tight shadow-2xl",
                      m.role === "user" ? "bg-emerald-500 text-white rounded-tr-sm" : "bg-zinc-900 text-white rounded-tl-sm border border-white/5"
                    )}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex gap-2 p-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Botones de Acción Gigantes para el Chat */}
              <div className="fixed bottom-6 left-6 right-6 flex gap-3 items-end z-30">
                <motion.button
                  onClick={toggleRecording}
                  whileTap={{ scale: 0.9 }}
                  className={clsx(
                    "w-24 h-24 rounded-[35px] flex items-center justify-center transition-all duration-500 shadow-2xl",
                    isRecording ? "bg-red-600 animate-pulse" : "bg-zinc-900 border border-white/10"
                  )}
                >
                  {isRecording ? <Square size={36} fill="white" /> : <Mic size={36} />}
                </motion.button>

                <div className="flex-1 relative">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    rows={1}
                    placeholder={isRecording ? "Grabando..." : "Pregunta algo..."}
                    className="w-full bg-zinc-900 border border-white/10 rounded-[35px] px-8 py-8 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-white/20 resize-none overflow-hidden h-[96px]"
                  />
                  <AnimatePresence>
                    {chatInput.trim() && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => handleSendChat()}
                        className="absolute right-4 bottom-4 w-16 h-16 bg-white text-black rounded-3xl flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <MessageCircle size={28} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "tasks" && (
            <motion.div key="tasks" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-4">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white/40 mb-2">Próximos Eventos</h3>
              {classExams.map(e => (
                <div key={e.id} className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[32px] flex items-center gap-5">
                  <Star className="text-amber-500 fill-amber-500" size={28} />
                  <div>
                    <p className="font-black text-xl uppercase italic leading-none mb-1">Examen: {e.title}</p>
                    <p className="text-amber-500/60 font-bold uppercase text-xs tracking-widest">{e.date}</p>
                  </div>
                </div>
              ))}
              {classTasks.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTask(t)}
                  className="w-full text-left bg-white/5 p-6 rounded-[32px] flex items-center gap-5 border border-white/5 active:opacity-90 transition-opacity"
                >
                  <div className={clsx("w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0", t.completed ? "bg-emerald-500 border-emerald-500" : "border-white/20")}>
                    {t.completed && <CheckSquare size={18} className="text-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx("font-black text-xl uppercase italic leading-none mb-1 truncate", t.completed && "line-through text-white/20")}>{t.title}</p>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">{t.date}</p>
                  </div>
                  <ChevronRight size={18} className="text-white/10" />
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === "info" && (
            <motion.div key="info" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-6">
              <div className="bg-zinc-900 rounded-[40px] p-8 border border-white/5 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-blue-500/20 flex items-center justify-center shadow-inner"><Clock className="text-blue-400" size={32} /></div>
                  <div>
                    <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-1">Horario</p>
                    <p className="font-black text-2xl uppercase italic tracking-tight">{cls.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-purple-500/20 flex items-center justify-center shadow-inner"><BookOpen className="text-purple-400" size={32} /></div>
                  <div>
                    <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-1">Aula</p>
                    <p className="font-black text-2xl uppercase italic tracking-tight">{cls.room}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 px-2">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white/40">Temas de la Clase</h3>
                <div className="flex flex-wrap gap-2">
                  {cls.importantTopics.map(t => (
                    <span key={t} className="px-6 py-3 bg-white/5 rounded-full text-sm font-black uppercase italic border border-white/10">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task detail modal */}
      <AnimatePresence>
        {activeTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40"
              onClick={() => setActiveTask(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed left-4 right-4 bottom-6 z-50 max-w-md mx-auto"
            >
              <div className="bg-zinc-900 border border-white/10 rounded-[28px] p-5 shadow-2xl">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Tarea</p>
                    <h3 className="text-[18px] font-black uppercase italic tracking-tight leading-snug">
                      {activeTask.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTask(null)}
                    className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/70"
                    aria-label="Cerrar"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Qué tienes que hacer</p>
                  <p className="text-[14px] text-white/80 leading-relaxed whitespace-pre-wrap">
                    {(activeTask.description || activeTask.details || activeTask.note || activeTask.title || "").toString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
