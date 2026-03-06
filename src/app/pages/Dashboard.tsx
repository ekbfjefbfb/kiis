import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";
import { classManager, Class, Task } from "../../services/class-manager";
import { authService } from "../../services/auth.service";
import { aiService } from "../../services/ai.service";

export default function Dashboard() {
  const navigate = useNavigate();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [nextClass, setNextClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [todayRecordingsCount, setTodayRecordingsCount] = useState(0);
  const [progressTodayText, setProgressTodayText] = useState<string | null>(null);
  const [progressTodayTasks, setProgressTodayTasks] = useState<any[] | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long", month: "long", day: "numeric"
  });

  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    // Check onboarding
    try {
      const onboardingComplete = localStorage.getItem("onboarding_complete");
      if (!onboardingComplete) {
        navigate("/onboarding", { replace: true });
        return;
      }
    } catch (e) {
      console.error("Storage error:", e);
    }

    // Redirigir al login si no está autenticado
    if (!authService.isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    const refreshData = async () => {
      const pendingTasks = classManager.getPendingTasks();
      const allClasses = classManager.getClasses();
      setClasses(allClasses);
      
      // Auto-detección real
      setCurrentClass(classManager.suggestCurrentClass());
      
      const todayStr = new Date().toISOString().split('T')[0];
      setTodayTasks(pendingTasks.filter(t => t.dueDate === todayStr).slice(0, 3));

      const allRecordings = classManager.getAllRecordings();
      setTodayRecordingsCount(allRecordings.filter(r => r.date.startsWith(todayStr)).length);

      try {
        const p = await aiService.getProgress();
        if (p?.success !== false) {
          const todayPending = p?.today?.pending;
          const todayCompleted = p?.today?.completed;
          if (typeof todayPending === 'number' || typeof todayCompleted === 'number') {
            setProgressTodayText(
              `Progreso hoy: ${todayCompleted || 0} completadas, ${todayPending || 0} pendientes.`
            );
          } else {
            setProgressTodayText(null);
          }

          const tasksFromProgress = Array.isArray(p?.today?.tasks) ? p.today.tasks : null;
          setProgressTodayTasks(tasksFromProgress);
          setProgressError(null);
        } else {
          setProgressTodayText(null);
          setProgressTodayTasks(null);
        }
      } catch {
        setProgressTodayText(null);
        setProgressTodayTasks(null);
      }
      
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      setWeekTasks(pendingTasks.filter(t => {
        const due = new Date(t.dueDate);
        return due <= weekFromNow && due > new Date();
      }));

      // Próxima clase lógica
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const dayName = now.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
      
      const upcoming = allClasses.flatMap(c => 
        c.schedule
          .filter(s => s.day.toLowerCase() === dayName)
          .map(s => {
            const [h, m] = s.time.split(':').map(Number);
            return { class: c, minutes: h * 60 + m };
          })
      )
      .filter(item => item.minutes > currentMinutes)
      .sort((a, b) => a.minutes - b.minutes);

      setNextClass(upcoming[0]?.class || null);
    };

    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Refrescar cada 30s
    return () => clearInterval(interval);
  }, []);

  const completeProgressTaskOptimistic = async (taskId: string) => {
    if (!taskId) return;
    const prev = progressTodayTasks;
    setProgressError(null);
    if (prev) {
      setProgressTodayTasks(prev.map(t => {
        const id = String(t?.id || t?.task_id || "");
        return id === taskId ? { ...t, completed: true } : t;
      }));
    }

    try {
      await aiService.completeProgressTask(taskId);
      setProgressTodayTasks(current => {
        if (!current) return current;
        return current.filter(t => String(t?.id || t?.task_id || "") !== taskId);
      });
    } catch (e) {
      setProgressTodayTasks(prev);
      const msg = e instanceof Error ? e.message : 'Error';
      setProgressError(msg);
    }
  };

  const openPlanToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const pending = classManager.getPendingTasks();
    const dueToday = pending.filter(t => t.dueDate === todayStr);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const dueWeek = pending.filter(t => {
      const due = new Date(t.dueDate);
      return due <= weekFromNow && due > new Date();
    });

    const classesNames = classManager.getClasses().map(c => c.name).join(", ");
    const recordings = classManager.getAllRecordings().filter(r => r.date.startsWith(todayStr));

    const prompt = [
      "Quiero un plan ultra concreto para HOY.",
      "Formato obligatorio:",
      "1) 1 Prioridad (una frase)",
      "2) 3 acciones (en bullets)",
      "3) 3 tareas (en bullets, accionables)",
      "4) 1 repaso sugerido (una frase)",
      "",
      `Clases: ${classesNames || "(sin clases)"}`,
      `Grabaciones hoy: ${recordings.map(r => r.summary).join(" | ") || "(ninguna)"}`,
      `Tareas vencen hoy: ${dueToday.map(t => t.text).join(" | ") || "(ninguna)"}`,
      `Tareas esta semana: ${dueWeek.slice(0, 6).map(t => `${t.text} (${t.dueDate})`).join(" | ") || "(ninguna)"}`,
    ].join("\n");

    navigate(`/assistant?q=${encodeURIComponent(prompt)}&autosend=1`);
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white px-7 pt-16 pb-10 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Header Minimalista */}
      <header className="mb-12">
        <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-1">Hoy</p>
        <h1 className="text-3xl font-bold capitalize">{today}</h1>
      </header>

      {/* Momento Wow */}
      <section className="mb-10">
        <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Tu día en 20s</div>
          <div className="space-y-2">
            <div className="text-[15px] font-semibold text-white/90">
              {todayTasks.length > 0 ? `Tienes ${todayTasks.length} tarea${todayTasks.length === 1 ? "" : "s"} que vencen hoy.` : "No tienes tareas urgentes hoy."}
            </div>
            <div className="text-[13px] font-medium text-zinc-500">
              {currentClass ? `Clase en curso: ${currentClass.name}.` : nextClass ? `Próxima clase: ${nextClass.name}.` : "Sin clases próximas."}
            </div>
            <div className="text-[13px] font-medium text-zinc-500">
              {todayRecordingsCount > 0 ? `${todayRecordingsCount} grabación${todayRecordingsCount === 1 ? "" : "es"} hoy.` : "Aún no grabas hoy."}
            </div>
            {progressTodayText && (
              <div className="text-[13px] font-medium text-zinc-500">
                {progressTodayText}
              </div>
            )}
          </div>

          <button
            onClick={openPlanToday}
            className="mt-6 w-full h-14 bg-white text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500" />
            Generar plan de hoy
          </button>
        </div>
      </section>
      
      {/* Acción Principal: GRABAR (Apple Style) */}
      <section className="mb-12">
        <button 
          onClick={() => navigate("/record")}
          className="w-full h-32 bg-white text-black rounded-[2rem] flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all duration-300 shadow-xl shadow-white/5"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
            {currentClass ? "En curso" : "Listo para grabar"}
          </span>
          <span className="text-2xl font-bold tracking-tight">
            {currentClass ? `Grabar ${currentClass.name}` : "Grabar Clase"}
          </span>
          {nextClass && !currentClass && (
            <span className="text-[10px] font-medium opacity-30">
              Próxima: {nextClass.name} a las {nextClass.schedule[0].time}
            </span>
          )}
        </button>
      </section>

      <div className="flex-1 space-y-10">
        {/* Tareas Urgentes (Vencen Hoy) */}
        {(Array.isArray(progressTodayTasks) && progressTodayTasks.length > 0) || todayTasks.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold tracking-tight text-white">Vence hoy</h2>
              <span className="px-2.5 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full">
                {(Array.isArray(progressTodayTasks) && progressTodayTasks.length > 0) ? progressTodayTasks.length : todayTasks.length} PENDIENTES
              </span>
            </div>
            {progressError && (
              <div className="mb-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                {progressError}
              </div>
            )}
            <div className="space-y-3">
              {Array.isArray(progressTodayTasks) && progressTodayTasks.length > 0 ? (
                progressTodayTasks.map((t: any) => {
                  const id = String(t?.id || t?.task_id || "");
                  const title = String(t?.title || t?.text || "Tarea");
                  const completed = Boolean(t?.completed);
                  return (
                    <div key={id || title} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 flex items-center gap-4">
                      <button
                        onClick={() => completeProgressTaskOptimistic(id)}
                        disabled={!id || completed}
                        className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 active:scale-95 transition-all ${
                          completed ? 'bg-white text-black border-white/10 opacity-40' : 'bg-transparent text-white border-white/10'
                        }`}
                        aria-label="Completar"
                      >
                        <div className={`w-2 h-2 rounded-full ${completed ? 'bg-black/70' : 'bg-red-500'} shadow-[0_0_10px_rgba(239,68,68,0.5)]`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-[17px] font-semibold text-white truncate">{title}</p>
                        <p className="text-sm text-zinc-500 font-medium tracking-tight">
                          Hoy
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                todayTasks.map(task => (
                  <div key={task.id} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[17px] font-semibold text-white truncate">{task.text}</p>
                      <p className="text-sm text-zinc-500 font-medium tracking-tight">
                        {classManager.getClassById(task.classId)?.name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : classes.length > 0 && (
          <section className="bg-zinc-900/20 border border-dashed border-white/5 rounded-[2.5rem] p-8 text-center">
            <p className="text-zinc-500 font-medium italic">Todo al día por hoy. ¡Buen trabajo!</p>
          </section>
        )}

        {/* Estado inicial sin clases */}
        {classes.length === 0 && (
          <section className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-12">
            <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
              <Sparkles className="text-zinc-600" size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Empieza tu Agenda</h2>
              <p className="text-zinc-500 max-w-[240px] font-medium leading-relaxed">
                Toca el botón superior para grabar tu primera clase y la IA hará el resto.
              </p>
            </div>
          </section>
        )}

        {/* Planificación Semanal */}
        {weekTasks.length > 0 && (
          <section>
            <h2 className="text-xl font-bold tracking-tight text-white mb-5">Esta semana</h2>
            <div className="space-y-3">
              {weekTasks.slice(0, 4).map(task => (
                <div key={task.id} className="flex items-center gap-4 py-1">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex flex-col items-center justify-center shrink-0 border border-white/5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      {new Date(task.dueDate).toLocaleDateString('es-ES', { weekday: 'short' })}
                    </span>
                    <span className="text-sm font-bold text-white leading-none">
                      {new Date(task.dueDate).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold text-white/90 truncate">{task.text}</p>
                    <p className="text-xs text-zinc-500 font-medium">
                      {classManager.getClassById(task.classId)?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Botón IA Flotante / Minimalista */}
      <footer className="mt-8">
        <button 
          onClick={() => navigate("/assistant")}
          className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all border border-white/5"
        >
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
          Pregunta a tu Asistente
        </button>
      </footer>
    </div>
  );
}