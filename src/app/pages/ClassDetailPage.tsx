import { useState, useEffect } from "react";
import {
  ArrowLeft, FileText, Lightbulb, CheckSquare, Calendar,
  BookOpen, Tag, MessageSquare, Star, Mic, Square, Loader2,
  Clock, User, Trash2, Plus, X
} from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { CLASSES, TASKS, EXAMS, removeClass, addExam, removeExam } from "../data/mock";
import { aiService } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";

type TabType = "overview" | "topics" | "tasks" | "notes" | "chat";

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // We use local state to trigger re-renders properly if modified
  const [cls, setCls] = useState(CLASSES.find((c) => c.id === id));
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // New Exam Modal
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamDate, setNewExamDate] = useState("");
  
  // Forces a re-render from the arrays
  const [updateTrigger, setUpdateTrigger] = useState(Date.now());

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    { role: "ai", text: "¡Hola! Pregúntame cualquier cosa sobre esta clase." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");

  const handleDeleteClass = () => {
    if (confirm("¿Seguro que deseas eliminar esta materia permanentemente?")) {
      removeClass(id!);
      navigate("/dashboard", { replace: true });
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newExamTitle.trim() || !newExamDate) return;
    addExam({ title: newExamTitle, classId: id, date: newExamDate });
    setIsAddingExam(false);
    setNewExamTitle("");
    setNewExamDate("");
    setUpdateTrigger(Date.now());
  };

  const handleDeleteExam = (examId: number) => {
    if (confirm("¿Eliminar este examen?")) {
      removeExam(examId);
      setUpdateTrigger(Date.now());
    }
  };

  if (!cls) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Clase no encontrada</p>
          <Link to="/dashboard" className="text-indigo-600 font-medium">
            Volver a Inicio
          </Link>
        </div>
      </div>
    );
  }

  const classTasks = TASKS.filter((t) => t.classId === id);
  const classExams = EXAMS.filter((e) => e.classId === id);

  const tabs = [
    { id: "overview" as TabType, label: "Resumen", icon: FileText },
    { id: "topics" as TabType, label: "Temas", icon: Tag },
    { id: "tasks" as TabType, label: "Tareas", icon: CheckSquare },
    { id: "notes" as TabType, label: "Notas", icon: BookOpen },
    { id: "chat" as TabType, label: "Chat", icon: MessageSquare },
  ];

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: msg }]);
    setChatLoading(true);
    try {
      const response = await aiService.chat(
        `Class: ${cls.name}. Topics: ${cls.importantTopics.join(", ")}. Question: ${msg}`
      );
      setChatMessages((prev) => [...prev, { role: "ai", text: response }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: "Lo siento, no pude procesar eso. Intenta de nuevo." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const startRecording = async () => {
    const ok = await audioService.requestPermissions();
    if (!ok) return;
    try {
      await audioService.startAudioRecording();
      setIsRecording(true);
      setRecordingTime(0);
      setLiveTranscript("...");
      
      // Start live transcription implicitly if supported
      if (audioService.isSupported()) {
        audioService.startRecording((txt) => {
          setLiveTranscript(txt);
        });
      }

      const interval = setInterval(() => {
        setRecordingTime((p) => p + 1);
      }, 1000);
      (window as any).__recordInterval = interval;
    } catch (error) {
       console.error(error);
       setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    setLiveTranscript("");
    
    if ((window as any).__recordInterval) {
      clearInterval((window as any).__recordInterval);
    }

    // Stop live recognition
    if (audioService.getIsRecording()) {
      audioService.stopRecording();
    }
    
    try {
      const audioBlob = await audioService.stopAudioRecording();
      const { text } = await aiService.processAudio(audioBlob);
      setNoteText(text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 border-b border-gray-100/60 sticky top-0 z-10 transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/dashboard"
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <button 
            onClick={handleDeleteClass}
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
        
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{cls.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <User size={11} className="text-gray-400" />
                <span className="text-[11px] text-gray-500">{cls.professor}</span>
                <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                <span className="text-[11px] text-gray-500">{cls.room}</span>
              </div>
            </div>
          </div>

          {/* Important Topics (always visible) */}
          {cls.importantTopics.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {cls.importantTopics.map((topic) => (
                  <span
                    key={topic}
                    className="text-[10px] font-medium px-2 py-1 bg-amber-50 text-amber-700 rounded-full whitespace-nowrap border border-amber-100"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-5 overflow-x-auto scrollbar-hide pb-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 min-h-[44px]",
                  isActive
                    ? "text-indigo-600 border-indigo-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-5 pt-4">
        <AnimatePresence mode="wait">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Información de Clase
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                      <Clock size={16} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Horario</p>
                      <p className="text-sm font-medium text-gray-900">{cls.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Profesor</p>
                      <p className="text-sm font-medium text-gray-900">{cls.professor}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exams Section */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Exámenes
                  </h3>
                  <button 
                    onClick={() => setIsAddingExam(true)}
                    className="text-indigo-600 flex items-center gap-1 text-xs font-bold bg-indigo-50 px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
                  >
                    <Plus size={14} /> Añadir
                  </button>
                </div>
                
                <div className="space-y-2.5">
                  {EXAMS.filter(e => e.classId === id).length === 0 ? (
                     <p className="text-xs text-gray-500 italic text-center py-2">No hay exámenes programados</p>
                  ) : (
                    EXAMS.filter(e => e.classId === id).map(exam => (
                      <div key={exam.id} className="flex items-center justify-between p-3 rounded-xl border border-purple-100 bg-purple-50/50">
                        <div>
                          <p className="text-sm font-semibold text-purple-900">{exam.title}</p>
                          <p className="text-xs text-purple-600 flex items-center gap-1 mt-0.5"><Calendar size={12}/> {exam.date}</p>
                        </div>
                        <button onClick={() => handleDeleteExam(exam.id)} className="text-purple-300 hover:text-purple-500 transition-colors p-2">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upcoming for this class */}
              {(classTasks.length > 0 || classExams.length > 0) && (
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Próximos
                  </h3>
                  <div className="space-y-2.5">
                    {classExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100"
                      >
                        <BookOpen size={14} className="text-red-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-red-900 truncate">
                            {exam.title}
                          </p>
                          <p className="text-[10px] text-red-600">
                            {new Date(exam.date + "T12:00:00").toLocaleDateString("es-ES", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {classTasks
                      .filter((t) => !t.completed)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          <CheckSquare size={14} className="text-emerald-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {task.title}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {new Date(task.date + "T12:00:00").toLocaleDateString("es-ES", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TOPICS */}
          {activeTab === "topics" && (
            <motion.div
              key="topics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Temas Importantes
                </h3>
                {cls.importantTopics.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No hay temas todavía</p>
                ) : (
                  <div className="space-y-3">
                    {cls.importantTopics.map((topic, i) => (
                      <motion.div
                        key={topic}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Star size={12} className="text-amber-600 fill-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{topic}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TASKS */}
          {activeTab === "tasks" && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Tareas y Exámenes
                </h3>
                {classTasks.length === 0 && classExams.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">Sin tareas pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {classExams.map((exam) => (
                      <div
                        key={`e-${exam.id}`}
                        className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100"
                      >
                        <BookOpen size={14} className="text-red-600 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-900">{exam.title}</p>
                          <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                            <Calendar size={10} />
                            {new Date(exam.date + "T12:00:00").toLocaleDateString("es-ES", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {classTasks.map((task) => (
                      <div
                        key={`t-${task.id}`}
                        className={clsx(
                          "flex items-center gap-3 p-3 rounded-xl border",
                          task.completed
                            ? "bg-gray-50 border-gray-100"
                            : "bg-emerald-50 border-emerald-100"
                        )}
                      >
                        <CheckSquare
                          size={14}
                          className={
                            task.completed ? "text-gray-400" : "text-emerald-600"
                          }
                        />
                        <div className="flex-1">
                          <p
                            className={clsx(
                              "text-sm font-medium",
                              task.completed
                                ? "line-through text-gray-400"
                                : "text-gray-900"
                            )}
                          >
                            {task.title}
                          </p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={10} />
                            {new Date(task.date + "T12:00:00").toLocaleDateString("es-ES", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pb-24"
            >
              {isRecording ? (
                 <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl shadow-indigo-600/20 mb-4 animate-in slide-in-from-bottom flex flex-col items-center">
                   <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 relative">
                     <span className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></span>
                     <Mic size={28} className="text-white" />
                   </div>
                   <h3 className="text-lg font-bold mb-1">Escuchando...</h3>
                   <div className="text-3xl font-mono opacity-90 tracking-wider mb-6">
                     {formatTime(recordingTime)}
                   </div>
                   {liveTranscript && (
                     <p className="text-base text-white/80 italic mb-6 text-center max-w-xs">{liveTranscript}</p>
                   )}
                   <button
                     onClick={stopRecording}
                     disabled={isProcessing}
                     className="bg-white text-indigo-600 px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
                   >
                     {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Square size={18} className="fill-current" />}
                     {isProcessing ? "Procesando IA..." : "Guardar Nota"}
                   </button>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-3 mb-6">
                   <button
                     onClick={startRecording}
                     className="col-span-2 bg-indigo-600 text-white p-4 rounded-3xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                   >
                     <div className="bg-white/20 p-2 rounded-xl">
                       <Mic size={24} />
                     </div>
                     <span className="font-bold text-lg">Grabar Nueva Nota</span>
                   </button>
                 </div>
               )}

              {/* Note content generated */}
              {noteText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Notas Generadas
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {noteText}
                  </p>
                </motion.div>
              )}

              {!noteText && !isRecording && !isProcessing && (
                <div className="text-center py-8">
                  <BookOpen size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">
                    Graba una clase para generar notas
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* CHAT */}
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: "400px" }}>
                {/* Messages */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={clsx(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={clsx(
                          "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-sm"
                            : "bg-gray-100 text-gray-800 rounded-tl-sm"
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                      placeholder="Pregunta sobre esta clase..."
                      className="flex-1 bg-gray-50 rounded-full py-2.5 px-4 text-sm border-0 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={!chatInput.trim() || chatLoading}
                      className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white disabled:opacity-40 shrink-0"
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Exam Modal */}
      <AnimatePresence>
        {isAddingExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-900">Añadir Examen</h3>
                <button
                  onClick={() => setIsAddingExam(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateExam} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Título del Examen
                  </label>
                  <input
                    type="text"
                    required
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    placeholder="Ej. Parcial 1"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Guardar Examen
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
