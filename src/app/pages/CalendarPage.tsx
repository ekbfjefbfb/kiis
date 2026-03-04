import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckSquare,
  Calendar as CalendarIcon,
  Star,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { Link } from "react-router";
import { TASKS, CLASSES } from "../data/mock";

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: "task" | "exam" | "important";
  classId?: string | null;
  completed: boolean;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "month">("list");

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(() => new Date().toISOString().split("T")[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthName = currentDate
    .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());

  const todayStr = new Date().toISOString().split("T")[0];

  const goToPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNext = () => setCurrentDate(new Date(year, month + 1, 1));

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const storedTasks = localStorage.getItem("user_tasks");
      const tasks = storedTasks ? JSON.parse(storedTasks) : TASKS;

      const allEvents: CalendarEvent[] = tasks.map((t: any) => ({
        id: t.id?.toString() || Math.random().toString(),
        date: t.date,
        title: t.title,
        description: t.description || t.details || t.note || t.title,
        type: "task" as const,
        classId: t.classId ?? null,
        completed: !!t.completed,
      }));

      setEvents(allEvents);
    } catch (e) {
      console.error("Error loading events:", e);
      setEvents(
        TASKS.map((t: any) => ({
          id: t.id?.toString() || Math.random().toString(),
          date: t.date,
          title: t.title,
          description: t.description || t.title,
          type: "task" as const,
          classId: t.classId ?? null,
          completed: !!t.completed,
        }))
      );
    }
    setLoading(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;

    const tasksRaw = localStorage.getItem("user_tasks");
    const tasks = tasksRaw ? JSON.parse(tasksRaw) : [];

    const next = [
      {
        id: Date.now().toString(),
        title,
        description: newTaskDescription.trim(),
        date: newTaskDate,
        completed: false,
      },
      ...tasks,
    ];

    localStorage.setItem("user_tasks", JSON.stringify(next));
    setIsAddingTask(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDate(new Date().toISOString().split("T")[0]);
    loadEvents();
  };

  const eventLabel = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "task":
        return "Tarea";
      case "exam":
        return "Examen";
      case "important":
        return "Importante";
      default:
        return "";
    }
  };

  const getEventsForDate = (dateStr: string) => events.filter((e) => e.date === dateStr);

  const upcoming = events
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const groupedUpcoming = upcoming.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    (acc[ev.date] ||= []).push(ev);
    return acc;
  }, {});

  const cells: Array<{ day: number; dateStr: string; isCurrentMonth: boolean }> = [];

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

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      isCurrentMonth: true,
    });
  }

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
    <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-white/30 overflow-x-hidden">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 pt-12 pb-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-white active:scale-90 transition-transform"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Agenda</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingTask(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-white active:scale-90 transition-transform"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setViewMode("list");
              setSelectedDate(null);
            }}
            className={clsx(
              "flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === "list" ? "bg-white text-black shadow-lg" : "text-white/40"
            )}
          >
            Lista
          </button>
          <button
            type="button"
            onClick={() => setViewMode("month")}
            className={clsx(
              "flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === "month" ? "bg-white text-black shadow-lg" : "text-white/40"
            )}
          >
            Mes
          </button>
        </div>

        {viewMode === "month" && (
          <div className="flex items-center justify-between px-2 mt-5">
            <button onClick={goToPrev} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center active:bg-white/10 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-sm font-black uppercase italic tracking-tighter">{monthName}</h2>
            <button onClick={goToNext} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center active:bg-white/10 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="px-5 pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-white/40" size={24} />
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-8">
            {Object.keys(groupedUpcoming).length === 0 ? (
              <div className="bg-zinc-900/40 border border-white/5 rounded-[24px] p-8 text-center">
                <CalendarIcon size={32} className="mx-auto text-white/10 mb-4" />
                <p className="text-[13px] font-black uppercase italic tracking-tight">Tu agenda está vacía</p>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-2">Usa el botón + para empezar</p>
              </div>
            ) : (
              Object.entries(groupedUpcoming).map(([date, items]) => (
                <div key={date} className="space-y-3">
                  <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.2em] pl-2">
                    {new Date(date + "T12:00:00").toLocaleDateString("es-ES", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="space-y-2">
                    {items.map((ev) => (
                      <motion.button
                        key={ev.id}
                        onClick={() => setActiveEvent(ev)}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left bg-zinc-900/40 border border-white/5 rounded-[20px] p-4 flex items-center justify-between gap-3 active:bg-zinc-800 transition-all"
                      >
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="mt-1 text-white/40 shrink-0">
                            {ev.type === "task" && <CheckSquare size={16} />}
                            {ev.type === "exam" && <BookOpen size={16} />}
                            {ev.type === "important" && <Star size={16} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 mb-1">{eventLabel(ev.type)}</p>
                            <p className={clsx("text-sm font-bold uppercase tracking-tight truncate", ev.completed && "line-through text-white/20")}>{ev.title}</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-white/10" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-7 mb-4">
              {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
                <div key={i} className="text-center text-[9px] font-black text-white/20 uppercase tracking-widest">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, i) => {
                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.dateStr === todayStr;
                const hasEvents = getEventsForDate(cell.dateStr).length > 0;
                return (
                  <button
                    key={i}
                    onClick={() => cell.isCurrentMonth && setSelectedDate(isSelected ? null : cell.dateStr)}
                    className={clsx(
                      "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all",
                      !cell.isCurrentMonth && "opacity-10",
                      isSelected ? "bg-white text-black scale-110 shadow-xl" : isToday ? "bg-zinc-800 text-white font-black" : "text-white/60 active:bg-white/5"
                    )}
                  >
                    <span className="text-[13px] font-bold">{cell.day}</span>
                    {hasEvents && !isSelected && (
                      <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-white/40" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <AnimatePresence mode="wait">
              {selectedDate && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-3 pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Eventos para el {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", { day: 'numeric', month: 'long' })}</p>
                  {selectedEvents.length === 0 ? (
                    <p className="text-[12px] text-white/20 font-bold uppercase italic p-2">Sin planes para hoy</p>
                  ) : (
                    selectedEvents.map((ev) => (
                      <button key={ev.id} onClick={() => setActiveEvent(ev)} className="w-full text-left bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <p className="text-sm font-bold uppercase tracking-tight truncate">{ev.title}</p>
                        <ChevronRight size={14} className="text-white/10" />
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal: Detalle de Evento */}
      <AnimatePresence>
        {activeEvent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-40" onClick={() => setActiveEvent(null)} />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} className="fixed left-4 right-4 bottom-6 z-50 max-w-md mx-auto">
              <div className="bg-zinc-900 border border-white/10 rounded-[32px] p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{eventLabel(activeEvent.type)}</p>
                    <h3 className="text-xl font-black uppercase italic tracking-tight leading-none">{activeEvent.title}</h3>
                  </div>
                  <button onClick={() => setActiveEvent(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40"><X size={16} /></button>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">Descripción</p>
                  <p className="text-[14px] text-white/70 leading-relaxed font-medium">{activeEvent.description || "Sin detalles adicionales"}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal: Nueva Tarea */}
      <AnimatePresence>
        {isAddingTask && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-40" onClick={() => setIsAddingTask(false)} />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[32px] z-50 p-8 pb-12 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Nueva Tarea</h2>
                <button onClick={() => setIsAddingTask(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required placeholder="¿QUÉ HAY QUE HACER?" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase" />
                <textarea value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} rows={3} placeholder="DETALLES (OPCIONAL)" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase resize-none" />
                <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase" />
                <button type="submit" className="w-full bg-white text-black rounded-xl py-4 text-lg font-black uppercase italic tracking-tight mt-2">Guardar</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
