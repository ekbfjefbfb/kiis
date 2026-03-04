import { useState } from "react";
import { 
  ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, MapPin, CheckCircle2, ListTodo, LayoutGrid, Sun, Moon 
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import AddClassModal from "../components/AddClassModal";
import { useDarkMode } from "../../hooks/useDarkMode";

interface Event {
  id: string;
  title: string;
  type: "class" | "task" | "exam";
  time: string;
  room?: string;
  completed?: boolean;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [view, setView] = useState<"agenda" | "month">("agenda");
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events: Event[] = [
    { id: "1", title: "Historia Universal", type: "class", time: "08:00 AM", room: "A-102" },
    { id: "2", title: "Ensayo Revolución Francesa", type: "task", time: "11:59 PM", completed: false },
    { id: "3", title: "Examen Parcial Cálculo", type: "exam", time: "10:00 AM", room: "B-204" }
  ];

  return (
    <div className="h-[100dvh] w-full bg-background text-foreground font-sans selection:bg-primary/20 overflow-hidden flex flex-col relative transition-colors duration-300">
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.3em] mb-1.5 text-left">Agenda_</p>
            <h1 className="text-xl font-bold uppercase italic tracking-tighter leading-none text-foreground">Calendario</h1>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform"
          >
            {isDark ? <Sun size={18} className="text-muted-foreground" /> : <Moon size={18} className="text-muted-foreground" />}
          </button>
          <button 
            onClick={() => setView(view === "agenda" ? "month" : "agenda")}
            className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform text-muted-foreground"
          >
            {view === "agenda" ? <LayoutGrid size={18} /> : <ListTodo size={18} />}
          </button>
          <button 
            onClick={() => setIsAddingClass(true)}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform shadow-lg"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      <div className="px-6 pt-8 pb-4 flex items-center justify-between shrink-0">
        <h2 className="text-2xl font-bold uppercase italic tracking-tighter text-foreground">
          {selectedDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-full bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground active:text-foreground transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button className="w-9 h-9 rounded-full bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground active:text-foreground transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.25rem)] pr-[env(safe-area-inset-right,1.25rem)] pb-32 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {view === "agenda" ? (
            <motion.div 
              key="agenda"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {events.map((event) => (
                <motion.div 
                  key={event.id}
                  whileTap={{ scale: 0.98 }}
                  className="bg-secondary/40 border border-border rounded-[28px] p-5 flex items-center justify-between transition-colors active:bg-secondary"
                >
                  <div className="flex items-center gap-5">
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border shadow-inner",
                      event.type === "class" ? "bg-secondary" : 
                      event.type === "exam" ? "bg-destructive/10" : "bg-primary/10"
                    )}>
                      {event.type === "class" ? <CalendarIcon size={18} className="text-muted-foreground" /> :
                       event.type === "exam" ? <span className="text-[8px] font-bold text-destructive">EXM</span> :
                       <CheckCircle2 size={18} className="text-primary/60" />}
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{event.time}</p>
                      <p className="text-base font-bold uppercase italic tracking-tight text-foreground leading-none mb-1">{event.title}</p>
                      {event.room && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin size={10} />
                          <p className="text-[8px] font-bold uppercase tracking-widest">{event.room}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="month"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-secondary/20 border border-border rounded-[32px] p-6"
            >
              <div className="grid grid-cols-7 gap-2 mb-6">
                {["D", "L", "M", "M", "J", "V", "S"].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 h-64">
                {[...Array(31)].map((_, i) => (
                  <button 
                    key={i}
                    className={clsx(
                      "flex items-center justify-center text-xs font-bold rounded-xl transition-all aspect-square",
                      i + 1 === 15 ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground active:bg-secondary"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AddClassModal isOpen={isAddingClass} onClose={() => setIsAddingClass(false)} />
    </div>
  );
}
