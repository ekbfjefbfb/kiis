import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Sparkles, Download, Calendar as CalendarIcon, Clock, ChevronRight, Mic } from "lucide-react";
import { classManager, Class, Task } from "../../services/class-manager";
import { authService } from "../../services/auth.service";
import { aiService } from "../../services/ai.service";
import { usePWAInstall } from "../../hooks/usePWAInstall";

export default function Dashboard() {
  const navigate = useNavigate();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [nextClass, setNextClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [progressTodayTasks, setProgressTodayTasks] = useState<any[] | null>(null);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long", month: "long", day: "numeric"
  });

  const { isInstallable, installPWA } = usePWAInstall();
  const isMobileBrowser =
    typeof navigator !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    try {
      const onboardingComplete = localStorage.getItem("onboarding_complete");
      if (!onboardingComplete) {
        navigate("/onboarding", { replace: true });
        return;
      }
    } catch (e) { console.error(e); }

    if (!authService.isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    const refreshData = async () => {
      const pendingTasks = classManager.getPendingTasks();
      const allClasses = classManager.getClasses();
      setClasses(allClasses);
      setCurrentClass(classManager.suggestCurrentClass());
      
      const todayStr = new Date().toISOString().split('T')[0];
      setTodayTasks(pendingTasks.filter(t => t.dueDate === todayStr));

      try {
        const p = await aiService.getProgress();
        if (p?.success !== false) {
          setProgressTodayTasks(Array.isArray(p?.today?.tasks) ? p.today.tasks : null);
        }
      } catch { setProgressTodayTasks(null); }
      
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
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      <header className="px-8 pt-16 pb-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-2">Mi Agenda</p>
          <h1 className="text-4xl font-extrabold tracking-tighter leading-none italic">{today}</h1>
        </div>
        {isInstallable && !isMobileBrowser && (
          <button onClick={installPWA} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
            <Download size={18} className="text-zinc-400" />
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-8 pt-6 pb-32 space-y-12">
        {/* Foco Principal: Grabación de Clase */}
        <section>
          <button 
            onClick={() => navigate("/record")}
            className="w-full group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white rounded-[2.5rem] transition-transform duration-500 group-active:scale-[0.98]" />
            <div className="relative px-8 py-10 flex flex-col items-start text-black">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${currentClass ? 'bg-red-500 animate-pulse' : 'bg-zinc-300'}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {currentClass ? "Clase en curso" : "Siguiente sesión"}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tighter leading-none mb-2">
                {currentClass ? currentClass.name : nextClass ? nextClass.name : "Iniciar Grabación"}
              </h2>
              <div className="flex items-center gap-2 opacity-40">
                <Mic size={14} />
                <span className="text-xs font-bold tracking-tight">Toca para capturar audio</span>
              </div>
            </div>
          </button>
        </section>

        {/* Línea de Tiempo / Agenda de Hoy */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Próximos Eventos</h3>
            <button onClick={() => navigate("/calendar")} className="text-[10px] font-bold text-zinc-400 active:text-white transition-colors">VER TODO</button>
          </div>
          
          <div className="space-y-4">
            {currentClass && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                  <Clock size={20} className="text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Ahora</p>
                  <p className="text-lg font-bold tracking-tight">{currentClass.name}</p>
                </div>
              </div>
            )}
            
            {nextClass && (
              <div className="bg-zinc-900/20 border border-white/5 rounded-[2rem] p-6 flex items-center gap-6 opacity-60">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-zinc-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{nextClass.schedule[0].time}</p>
                  <p className="text-lg font-bold tracking-tight text-zinc-300">{nextClass.name}</p>
                </div>
              </div>
            )}

            {!currentClass && !nextClass && classes.length > 0 && (
              <div className="py-12 text-center bg-zinc-900/20 border border-dashed border-white/5 rounded-[2.5rem]">
                <p className="text-zinc-600 font-medium italic">Sin más clases por hoy.</p>
              </div>
            )}
          </div>
        </section>

        {/* Pendientes de la Agenda */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Tareas Pendientes</h3>
            <span className="px-2 py-0.5 bg-zinc-900 text-zinc-500 text-[9px] font-bold rounded-full border border-white/5">
              {progressTodayTasks?.length || todayTasks.length || 0}
            </span>
          </div>

          <div className="space-y-3">
            {(progressTodayTasks?.length || todayTasks.length) ? (
              (progressTodayTasks || todayTasks).slice(0, 3).map((t: any) => (
                <button key={t.id} className="w-full bg-zinc-900/30 border border-white/5 rounded-3xl p-5 flex items-center justify-between active:bg-zinc-900/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <p className="text-base font-bold tracking-tight text-white/90">{t.title || t.text}</p>
                  </div>
                  <ChevronRight size={16} className="text-zinc-800" />
                </button>
              ))
            ) : (
              <div className="py-10 text-center opacity-30">
                <Sparkles size={24} className="mx-auto mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">Agenda Limpia</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer / Asistente de Agenda */}
      <footer className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black to-transparent">
        <button 
          onClick={() => navigate("/assistant")}
          className="w-full h-18 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center gap-4 active:scale-[0.98] transition-all"
        >
          <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
          <span className="text-sm font-bold tracking-tight text-zinc-300">Consultar Agenda Inteligente</span>
        </button>
      </footer>
    </div>
  );
}