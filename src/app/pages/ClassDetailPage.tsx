import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Trash2,
  ChevronRight,
  MessageCircle,
  Mic,
  Square,
  Star,
  BookOpen,
  Clock,
  X,
  CheckSquare,
  Loader2,
} from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { CLASSES, TASKS, EXAMS, removeClass } from "../data/mock";
import { aiService } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";
import { groqService } from "../../services/groq.service";

type Section = "actions" | "chat" | "agenda" | "info";

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls] = useState(CLASSES.find((c) => c.id === id));

  const [section, setSection] = useState<Section>("agenda");

  // Unified Chat + Voice
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string; id: string }>>([
    {
      id: "1",
      role: "ai",
      text: "Dime qué necesitas de esta clase (pregunta o graba).",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Task detail
  const [activeTask, setActiveTask] = useState<any | null>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!cls) return null;

  const classTasks = TASKS.filter((t) => t.classId === id);
  const classExams = EXAMS.filter((e) => e.classId === id);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSendChat = async (textOverride?: string) => {
    const msg = textOverride ?? chatInput.trim();
    if (!msg || isProcessing) return;

    setChatInput("");
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", text: msg }]);
    setIsProcessing(true);

    try {
      const response = await aiService.chat(
        `CONTEXTO CLASE: ${cls.name}. PROFE: ${cls.professor}. TEMAS: ${cls.importantTopics.join(", ")}. PREGUNTA: ${msg}`
      );
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: response }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 2).toString(), role: "ai", text: "Error de conexión. Reintenta." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = async () => {
    if (isProcessing) return;

    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      try {
        const audioBlob = await audioService.stopAudioRecording();
        const transcript = await groqService.transcribe(audioBlob, "es");
        await handleSendChat(`Esto es lo que grabé. Resúmelo y saca puntos clave: ${transcript}`);
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
      }
      return;
    }

    const ok = await audioService.requestPermissions();
    if (!ok) return;
    try {
      await audioService.startAudioRecording();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-sans pb-24">
      {/* Header - same style as Dashboard */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between bg-black/80 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] truncate">Materia</p>
            <p className="text-sm font-bold text-white/80 tracking-tight truncate">{cls.name}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm("¿Eliminar clase?")) {
              removeClass(cls.id);
              navigate("/dashboard", { replace: true });
            }
          }}
          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-red-400 active:scale-95 transition-transform"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="px-5 pt-4 space-y-5">
        {/* Simple section chooser: looks like Dashboard action list */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setSection("chat")}
            className="w-full px-4 py-4 flex items-center justify-between text-left active:bg-zinc-800 transition-colors"
          >
            <div>
              <p className="text-[13px] font-black uppercase tracking-tight">Chat + voz</p>
              <p className="text-[10px] text-white/35 font-bold uppercase tracking-[0.2em] mt-1">Pregunta o graba</p>
            </div>
            <ChevronRight size={16} className="text-white/15" />
          </button>
          <div className="h-px bg-white/5" />
          <button
            type="button"
            onClick={() => setSection("agenda")}
            className="w-full px-4 py-4 flex items-center justify-between text-left active:bg-zinc-800 transition-colors"
          >
            <div>
              <p className="text-[13px] font-black uppercase tracking-tight">Agenda</p>
              <p className="text-[10px] text-white/35 font-bold uppercase tracking-[0.2em] mt-1">Tareas y exámenes</p>
            </div>
            <ChevronRight size={16} className="text-white/15" />
          </button>
          <div className="h-px bg-white/5" />
          <button
            type="button"
            onClick={() => setSection("info")}
            className="w-full px-4 py-4 flex items-center justify-between text-left active:bg-zinc-800 transition-colors"
          >
            <div>
              <p className="text-[13px] font-black uppercase tracking-tight">Info</p>
              <p className="text-[10px] text-white/35 font-bold uppercase tracking-[0.2em] mt-1">Horario y temas</p>
            </div>
            <ChevronRight size={16} className="text-white/15" />
          </button>
        </div>

        {/* Content area - does NOT look like another app */}
        <AnimatePresence mode="wait">
          {section === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-3 space-y-3">
                {messages.slice(-6).map((m) => (
                  <div key={m.id} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={clsx(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-snug",
                        m.role === "user" ? "bg-white text-black" : "bg-black/30 text-white border border-white/5"
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex items-center gap-2 px-1">
                    <Loader2 size={14} className="animate-spin text-white/40" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Procesando</span>
                  </div>
                )}

                <div className="flex gap-2 items-end">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={clsx(
                      "w-12 h-12 rounded-xl flex items-center justify-center border",
                      isRecording
                        ? "bg-red-600 border-red-500/40"
                        : "bg-zinc-900 border-white/10"
                    )}
                  >
                    {isRecording ? <Square size={18} fill="white" /> : <Mic size={18} />}
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      rows={1}
                      placeholder={isRecording ? `Grabando ${formatTime(recordingTime)}...` : "Escribe..."}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-white/20 resize-none overflow-hidden min-h-[48px] max-h-[120px] placeholder:text-white/10"
                      onInput={(e) => {
                        const t = e.target as HTMLTextAreaElement;
                        t.style.height = "auto";
                        t.style.height = `${t.scrollHeight}px`;
                      }}
                    />
                    <AnimatePresence>
                      {chatInput.trim() && !isRecording && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          type="button"
                          onClick={() => handleSendChat()}
                          className="absolute right-2 bottom-2 w-9 h-9 bg-white text-black rounded-lg flex items-center justify-center"
                        >
                          <MessageCircle size={16} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {section === "agenda" && (
            <motion.div
              key="agenda"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="space-y-2">
                {classExams.map((e) => (
                  <div key={e.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                    <Star size={16} className="text-amber-400" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-black uppercase tracking-tight truncate">Examen: {e.title}</p>
                      <p className="text-[10px] text-white/35 font-bold uppercase tracking-[0.2em] mt-1">{e.date}</p>
                    </div>
                  </div>
                ))}

                {classTasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTask(t)}
                    className="w-full text-left bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3 active:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={clsx(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0",
                        t.completed ? "bg-emerald-500 border-emerald-500" : "border-white/20"
                      )}>
                        {t.completed && <CheckSquare size={14} className="text-black" />}
                      </div>
                      <div className="min-w-0">
                        <p className={clsx("text-[13px] font-black uppercase tracking-tight truncate", t.completed && "line-through text-white/20")}>
                          {t.title}
                        </p>
                        <p className="text-[10px] text-white/35 font-bold uppercase tracking-[0.2em] mt-1">{t.date}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-white/10" />
                  </button>
                ))}

                {classExams.length === 0 && classTasks.length === 0 && (
                  <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
                    <p className="text-[13px] font-black uppercase tracking-tight">Sin agenda</p>
                    <p className="text-[10px] text-white/35 font-bold uppercase tracking-[0.2em] mt-1">
                      Cuando grabes clases, aquí aparece todo.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {section === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-white/40" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Horario</p>
                    <p className="text-[13px] font-bold text-white/80">{cls.time}</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <BookOpen size={16} className="text-white/40" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Aula</p>
                    <p className="text-[13px] font-bold text-white/80">{cls.room}</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Temas</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {cls.importantTopics.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-2 bg-black/30 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] text-white/70"
                    >
                      {t}
                    </span>
                  ))}
                  {cls.importantTopics.length === 0 && (
                    <p className="text-[12px] text-white/40">Sin temas todavía</p>
                  )}
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
