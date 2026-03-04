import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";
import { classManager, Class, Task } from "../../services/class-manager";
import { authService } from "../../services/auth.service";

export default function Dashboard() {
  const navigate = useNavigate();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [nextClass, setNextClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);

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
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const refreshData = () => {
      const pendingTasks = classManager.getPendingTasks();
      const allClasses = classManager.getClasses();
      setClasses(allClasses);
      
      // Auto-detección real
      setCurrentClass(classManager.suggestCurrentClass());
      
      const todayStr = new Date().toISOString().split('T')[0];
      setTodayTasks(pendingTasks.filter(t => t.dueDate === todayStr).slice(0, 3));
      
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
    const interval = setInterval(refreshData, 30000); // Refrescar cada 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-black text-white px-7 pt-16 pb-10 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Header Minimalista */}
      <header className="mb-12">
        <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-1">Hoy</p>
        <h1 className="text-3xl font-bold capitalize">{today}</h1>
      </header>
      
      {/* Acción Principal: GRABAR (Apple Style) */}
      <section className="mb-12">
        <button 
          onClick={() => navigate("/record")}
          className="w-full aspect-[16/7] bg-white text-black rounded-[2.5rem] flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-white/5"
        >
          <span className="text-sm font-bold uppercase tracking-widest opacity-60">
            {currentClass ? "En curso" : "Listo para grabar"}
          </span>
          <span className="text-3xl font-bold tracking-tight">
            {currentClass ? `Grabar ${currentClass.name}` : "Grabar Clase"}
          </span>
          {nextClass && !currentClass && (
            <span className="text-xs font-medium opacity-40">
              Próxima: {nextClass.name} a las {nextClass.schedule[0].time}
            </span>
          )}
        </button>
      </section>

      <div className="flex-1 space-y-10">
        {/* Tareas Urgentes (Vencen Hoy) */}
        {todayTasks.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold tracking-tight text-white">Vence hoy</h2>
              <span className="px-2.5 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full">
                {todayTasks.length} PENDIENTES
              </span>
            </div>
            <div className="space-y-3">
              {todayTasks.map(task => (
                <div key={task.id} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-semibold text-white truncate">{task.text}</p>
                    <p className="text-sm text-zinc-500 font-medium tracking-tight">
                      {classManager.getClassById(task.classId)?.name}
                    </p>
                  </div>
                </div>
              ))}
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
          className="w-full h-16 bg-zinc-900 text-white rounded-[2rem] font-bold text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all border border-white/5"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
          Pregunta a tu Asistente
        </button>
      </footer>
    </div>
  );
}