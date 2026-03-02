import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Calendar, Clock, Sparkles, CheckCircle2, AlertCircle, BookOpen, Download, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { agendaService, SessionWithItems, AgendaItem } from "../../services/agenda.service";

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'notes' | 'tasks' | 'points'>('summary');

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const data = await agendaService.getSession(id);
      setSession(data);
    } catch (error) {
      console.error("Error loading session:", error);
      alert("Error al cargar la sesión");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (item: AgendaItem) => {
    if (!id) return;
    
    try {
      const newStatus = item.status === 'done' ? 'pending' : 'done';
      await agendaService.updateItem(id, item.id, { status: newStatus });
      await loadSession();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!id || !confirm("¿Eliminar este item?")) return;
    
    try {
      await agendaService.deleteItem(id, itemId);
      await loadSession();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = () => {
    if (!session) return "0 min";
    const start = new Date(session.created_at).getTime();
    const end = new Date(session.updated_at).getTime();
    const minutes = Math.round((end - start) / 60000);
    return `${minutes} min`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Sesión no encontrada</p>
      </div>
    );
  }

  const tasks = session.items.filter(i => i.item_type === 'task');
  const keyPoints = session.items.filter(i => i.item_type === 'key_point');
  const summaries = session.items.filter(i => i.item_type === 'summary');

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-b border-border/50 px-6 pt-8 pb-6 sticky top-0 z-10 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div className="flex gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-full text-foreground hover:bg-background/80 transition-colors">
              <Download size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
          {session.class_name}
        </h1>
        
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span className="capitalize">{formatDate(session.session_datetime)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>{getDuration()}</span>
          </div>
          {session.teacher_name && (
            <div className="flex items-center gap-1.5">
              <span>👨‍🏫 {session.teacher_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 pb-2 border-b border-border/50 sticky top-[140px] bg-background/95 backdrop-blur-sm z-10">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'summary', label: 'Resumen', icon: Sparkles },
            { id: 'notes', label: 'Apuntes', icon: BookOpen },
            { id: 'tasks', label: `Tareas (${tasks.length})`, icon: CheckCircle2 },
            { id: 'points', label: `Puntos (${keyPoints.length})`, icon: AlertCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6">
        <AnimatePresence mode="wait">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {summaries.length > 0 ? (
                summaries.map((item) => (
                  <div key={item.id} className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-5 border border-indigo-500/20">
                    {item.title && (
                      <h3 className="text-lg font-semibold text-foreground mb-3">{item.title}</h3>
                    )}
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No hay resumen disponible</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {session.live_transcript ? (
                <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen size={16} />
                    Transcripción Completa
                  </h3>
                  <div className="prose prose-sm max-w-none text-foreground">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {session.live_transcript}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No hay apuntes disponibles</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={clsx(
                      "flex items-start gap-3 p-4 rounded-2xl border transition-all",
                      task.status === 'done'
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-muted/30 border-border/50"
                    )}
                  >
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={clsx(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                        task.status === 'done'
                          ? "bg-green-500 border-green-500"
                          : "border-muted-foreground hover:border-foreground"
                      )}
                    >
                      {task.status === 'done' && (
                        <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        "text-sm font-medium",
                        task.status === 'done'
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      )}>
                        {task.content}
                      </p>
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📅 {task.due_date}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteItem(task.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No hay tareas detectadas</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Key Points Tab */}
          {activeTab === 'points' && (
            <motion.div
              key="points"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {keyPoints.length > 0 ? (
                keyPoints.map((point, idx) => (
                  <div
                    key={point.id}
                    className="flex items-start gap-3 p-4 bg-muted/30 rounded-2xl border border-border/50"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-indigo-600">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {point.title && (
                        <h4 className="text-sm font-semibold text-foreground mb-1">{point.title}</h4>
                      )}
                      <p className="text-sm text-foreground leading-relaxed">
                        {point.content}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(point.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No hay puntos clave detectados</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
