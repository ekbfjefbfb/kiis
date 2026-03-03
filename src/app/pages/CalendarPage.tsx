import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, CheckSquare, Calendar as CalendarIcon, Star, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { Link } from "react-router";
import { TASKS, EXAMS, IMPORTANT_DATES, CLASSES } from "../data/mock";

interface CalendarEvent {
  date: string;
  title: string;
  type: "task" | "exam" | "important";
  classId?: string;
  completed: boolean;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase());

  const goToPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNext = () => setCurrentDate(new Date(year, month + 1, 1));

  // Cargar eventos del backend o localStorage
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Cargar tareas del localStorage
      const storedTasks = localStorage.getItem('user_tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : TASKS;
      
      // Cargar sesiones del backend/localStorage
      const storedSessions = localStorage.getItem('recent_sessions');
      const sessions = storedSessions ? JSON.parse(storedSessions) : [];

      // Combinar eventos
      const allEvents: CalendarEvent[] = [
        ...tasks.map((t: any) => ({
          date: t.date,
          title: t.title,
          type: "task" as const,
          classId: t.classId,
          completed: t.completed,
        })),
        ...sessions.filter((s: any) => s.session_datetime).map((s: any) => ({
          date: s.session_datetime.split('T')[0],
          title: s.class_name || "Clase grabada",
          type: "important" as const,
          classId: null,
          completed: false,
        })),
      ];
      
      setEvents(allEvents);
    } catch (e) {
      console.error("Error loading events:", e);
      // Fallback a datos mock
      setEvents(TASKS.map((t) => ({
        date: t.date,
        title: t.title,
        type: "task" as const,
        classId: t.classId,
        completed: t.completed,
      })));
    }
    setLoading(false);
  };

  const getEventsForDate = (dateStr: string) =>
    events.filter((e) => e.date === dateStr);

  const getDotsForDate = (dateStr: string) => {
    const events = getEventsForDate(dateStr);
    const types = new Set(events.map((e) => e.type));
    return Array.from(types);
  };

  const dotColor = (type: string) => {
    switch (type) {
      case "task": return "bg-foreground";
      case "exam": return "bg-foreground";
      case "important": return "bg-foreground";
      default: return "bg-muted-foreground";
    }
  };

  const eventIcon = (type: string) => {
    switch (type) {
      case "task": return <CheckSquare size={14} className="text-foreground" />;
      case "exam": return <BookOpen size={14} className="text-foreground" />;
      case "important": return <Star size={14} className="text-foreground fill-foreground" />;
      default: return null;
    }
  };

  const eventBg = (type: string) => {
    switch (type) {
      case "task": return "bg-card border-border";
      case "exam": return "bg-card border-border";
      case "important": return "bg-card border-border";
      default: return "bg-card border-border";
    }
  };

  const eventLabel = (type: string) => {
    switch (type) {
      case "task": return "Tarea";
      case "exam": return "Examen";
      case "important": return "Importante";
      default: return "";
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // Build calendar grid
  const cells: Array<{ day: number; dateStr: string; isCurrentMonth: boolean }> = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    cells.push({
      day: d,
      dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      isCurrentMonth: true,
    });
  }

  // Next month days to fill 6 rows
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month + 2;
    const y = m > 12 ? year + 1 : year;
    const actualM = m > 12 ? 1 : m;
    cells.push({
      day: d,
      dateStr: `${y}-${String(actualM).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      isCurrentMonth: false,
    });
  }

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 pt-12 pb-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 outline-none focus:ring-1 focus:ring-ring transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Calendario</h1>
          </div>
          <div className="w-10 h-10" />
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={goToPrev}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 outline-none focus:ring-1 focus:ring-ring transition-colors"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <h2 className="text-[17px] font-semibold tracking-tight text-foreground">{monthName}</h2>
          <button
            onClick={goToNext}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 outline-none focus:ring-1 focus:ring-ring transition-colors"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="px-6 pt-6">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-4">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1">
          {cells.map((cell, i) => {
            const dots = cell.isCurrentMonth ? getDotsForDate(cell.dateStr) : [];
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDate;

            return (
              <button
                key={i}
                onClick={() =>
                  cell.isCurrentMonth && setSelectedDate(cell.dateStr === selectedDate ? null : cell.dateStr)
                }
                className={clsx(
                  "flex flex-col items-center justify-center py-2.5 rounded-full outline-none focus:ring-1 focus:ring-ring transition-all min-h-[48px]",
                  !cell.isCurrentMonth && "opacity-20",
                  isSelected && "bg-foreground text-background",
                  isToday && !isSelected && "bg-secondary text-secondary-foreground font-bold",
                  cell.isCurrentMonth && !isSelected && !isToday && "hover:bg-accent active:bg-secondary text-foreground"
                )}
              >
                <span
                  className={clsx(
                    "text-[15px]",
                    isSelected ? "text-background font-bold" : isToday ? "text-foreground font-bold" : "text-foreground font-medium"
                  )}
                >
                  {cell.day}
                </span>
                {dots.length > 0 && (
                  <div className="flex gap-[3px] mt-1 relative">
                    {dots.slice(0, 3).map((type, j) => (
                      <div
                        key={j}
                        className={clsx(
                          "w-1 h-1 rounded-full",
                          isSelected ? "bg-background/80" : "bg-foreground",
                          isToday && !isSelected && "bg-foreground"
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 mb-8 border-t border-border/50 pt-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Eventos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="text-[11px] text-foreground font-bold uppercase tracking-wider">Hoy</span>
          </div>
        </div>

        {/* Selected date events */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-2">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>

              {selectedEvents.length === 0 ? (
                <div className="text-center py-16">
                  <CalendarIcon size={48} className="mx-auto text-muted-foreground/30 mb-4" strokeWidth={1} />
                  <p className="text-[15px] font-medium text-muted-foreground">Sin eventos este día</p>
                </div>
              ) : (
                selectedEvents.map((ev, i) => {
                  const cls = ev.classId
                    ? CLASSES.find((c) => c.id === ev.classId)
                    : null;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={clsx(
                        "p-5 rounded-3xl border transition-colors",
                        "bg-card border-border shadow-sm"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 text-muted-foreground">
                           {ev.type === "task" && <CheckSquare size={18} />}
                           {ev.type === "exam" && <BookOpen size={18} />}
                           {ev.type === "important" && <Star size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              {eventLabel(ev.type)}
                            </span>
                            {ev.completed && (
                              <span className="text-[9px] bg-foreground text-background rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">
                                Hecho
                              </span>
                            )}
                          </div>
                          <h4
                            className={clsx(
                              "font-semibold text-[17px] tracking-tight text-foreground",
                              ev.completed && "line-through text-muted-foreground"
                            )}
                          >
                            {ev.title}
                          </h4>
                          {cls && (
                            <p className="text-[13px] text-muted-foreground mt-1">
                              {cls.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* If no date selected, show next upcoming */}
        {!selectedDate && (
          <div className="mt-8">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-2">
              Próximos Eventos
            </h3>
            <div className="space-y-4">
              {allEvents
                .filter((e) => e.date >= todayStr)
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 5)
                .map((ev, i) => {
                  const cls = ev.classId
                    ? CLASSES.find((c) => c.id === ev.classId)
                    : null;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card p-4 rounded-[24px] border border-border flex items-center gap-4 shadow-sm"
                    >
                      <div className="flex flex-col items-center justify-center w-14 h-14 bg-secondary text-secondary-foreground rounded-[18px]">
                        <span className="text-[10px] font-bold uppercase tracking-widest mb-0.5">
                          {new Date(ev.date + "T12:00:00").toLocaleDateString("es-ES", { month: "short" })}
                        </span>
                        <span className="text-xl font-bold tracking-tighter leading-none">
                          {new Date(ev.date + "T12:00:00").getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[15px] tracking-tight text-foreground truncate mb-1">
                          {ev.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            {eventLabel(ev.type)} {cls ? `• ${cls.name}` : ""}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
