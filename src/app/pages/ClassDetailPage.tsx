import { useState } from "react";
import {
  ArrowLeft, FileText, Lightbulb, CheckSquare, Calendar,
  BookOpen, MessageSquare, Star, Mic, Square, Loader2,
  User, Trash2, Plus, X, ChevronRight, Zap
} from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { CLASSES, TASKS, EXAMS, removeClass, addExam, removeExam } from "../data/mock";
import { aiService } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";

type TabType = "overview" | "tasks" | "notes" | "chat";

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState(CLASSES.find((c) => c.id === id));
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    { role: "ai", text: "¡Hola! Pregúntame sobre esta clase. Conozco todos los temas y grabaciones." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [noteText, setNoteText] = useState("");

  if (!cls) return null;

  const classTasks = TASKS.filter((t) => t.classId === id);
  const classExams = EXAMS.filter((e) => e.classId === id);

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: msg }]);
    setChatLoading(true);
    try {
      const response = await aiService.chat(
        `Materia: ${cls.name}. Profesor: ${cls.professor}. Temas: ${cls.importantTopics.join(", ")}. Pregunta: ${msg}`
      );
      setChatMessages((prev) => [...prev, { role: "ai", text: response }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "ai", text: "Error de conexión. Reintenta." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      try {
        const audioBlob = await audioService.stopAudioRecording();
        const text = await groqService.transcribe(audioBlob, 'es');
        setNoteText(text);
      } catch (err) {
        console.error(err);
      } finally {
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
    <div className="min-h-[100dvh] bg-black text-white pb-24 font-sans">
      {/* Header Fijo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold truncate max-w-[200px]">{cls.name}</h1>
            <p className="text-sm text-white/50">{cls.professor}</p>
          </div>
        </div>
        <button onClick={() => { if(confirm("¿Eliminar?")) { removeClass(cls.id); navigate("/dashboard"); } }} className="text-red-500 p-2">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="px-5">
        {/* Chips de Temas */}
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
          {cls.importantTopics.map(t => (
            <span key={t} className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold whitespace-nowrap border border-white/5 uppercase tracking-wider">
              {t}
            </span>
          ))}
        </div>

        {/* Tabs Modernos */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
          {(["overview", "tasks", "notes", "chat"] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={clsx(
                "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === t ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              {t === "overview" && "Info"}
              {t === "tasks" && "Tareas"}
              {t === "notes" && "Notas"}
              {t === "chat" && "Chat"}
            </button>
          ))}
        </div>

        {/* Contenido Dinámico */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="ov" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-4">
              <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5">
                <h3 className="text-white/40 text-xs font-bold uppercase mb-4 tracking-widest">Información</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center"><Calendar className="text-blue-400" /></div>
                    <div><p className="text-white/40 text-xs uppercase font-bold">Horario</p><p className="font-bold text-lg">{cls.time}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center"><User className="text-purple-400" /></div>
                    <div><p className="text-white/40 text-xs uppercase font-bold">Lugar</p><p className="font-bold text-lg">{cls.room}</p></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "tasks" && (
            <motion.div key="tk" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-3">
              {classExams.map(e => (
                <div key={e.id} className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl flex items-center gap-4">
                  <Star className="text-amber-500 fill-amber-500" size={24} />
                  <div className="flex-1">
                    <p className="font-bold text-lg">Examen: {e.title}</p>
                    <p className="text-amber-500/60 font-bold uppercase text-xs">{e.date}</p>
                  </div>
                </div>
              ))}
              {classTasks.map(t => (
                <div key={t.id} className="bg-white/5 p-5 rounded-3xl flex items-center gap-4 border border-white/5">
                  <div className={clsx("w-6 h-6 rounded-full border-2 flex items-center justify-center", t.completed ? "bg-green-500 border-green-500" : "border-white/20")}>
                    {t.completed && <CheckSquare size={14} className="text-black" />}
                  </div>
                  <div className="flex-1">
                    <p className={clsx("font-bold text-lg", t.completed && "line-through text-white/30")}>{t.title}</p>
                    <p className="text-white/40 text-sm font-medium">{t.date}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "notes" && (
            <motion.div key="nt" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-6">
              <button onClick={handleRecord} className={clsx("w-full py-6 rounded-3xl flex items-center justify-center gap-4 transition-all", isRecording ? "bg-red-500" : "bg-white text-black active:scale-95")}>
                {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
                <span className="font-bold text-xl">{isRecording ? formatTime(recordingTime) : "Grabar Apunte"}</span>
              </button>
              
              {isProcessing && (
                <div className="bg-blue-500/20 p-6 rounded-3xl border border-blue-500/30 flex items-center gap-4">
                  <Loader2 className="animate-spin text-blue-400" />
                  <p className="font-bold text-blue-400">La IA está procesando tu clase...</p>
                </div>
              )}

              {noteText && (
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-yellow-400" size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest text-white/40">Resumen Inteligente</h3>
                  </div>
                  <p className="text-lg leading-relaxed text-white/80">{noteText}</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div key="ch" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="flex flex-col h-[60vh] bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden">
              <div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-hide">
                {chatMessages.map((m, i) => (
                  <div key={i} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={clsx("max-w-[85%] p-4 rounded-2xl text-lg font-medium", m.role === "user" ? "bg-white text-black" : "bg-white/10 text-white border border-white/5")}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatLoading && <div className="flex gap-1 p-2"><div className="w-2 h-2 bg-white/20 rounded-full animate-bounce" /><div className="w-2 h-2 bg-white/20 rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-2 h-2 bg-white/20 rounded-full animate-bounce [animation-delay:0.4s]" /></div>}
              </div>
              <div className="p-4 bg-black/40 border-t border-white/5 flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Duda sobre la clase..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <button onClick={handleSendChat} disabled={!chatInput.trim() || chatLoading} className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
                  <MessageSquare size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
