import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, CheckSquare, Calendar as CalendarIcon, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { Link } from "react-router";
import { TASKS, EXAMS, IMPORTANT_DATES, CLASSES } from "../data/mock";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase());

  const goToPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNext = () => setCurrentDate(new Date(year, month + 1, 1));

  // Collect all events
  const allEvents = [
    ...TASKS.map((t) => ({
      date: t.date,
      title: t.title,
      type: "task" as const,
      classId: t.classId,
      completed: t.completed,
    })),
    ...EXAMS.map((e) => ({
      date: e.date,
      title: e.title,
      type: "exam" as const,
      classId: e.classId,
      completed: false,
    })),
    ...IMPORTANT_DATES.map((d) => ({
      date: d.date,
      title: d.title,
      type: "important" as const,
      classId: null,
      completed: false,
    })),
  ];

  const getEventsForDate = (dateStr: string) =>
    allEvents.filter((e) => e.date === dateStr);

  const getDotsForDate = (dateStr: string) => {
    const events = getEventsForDate(dateStr);
    const types = new Set(events.map((e) => e.type));
    return Array.from(types);
  };

  const dotColor = (type: string) => {
    switch (type) {
      case "task": return "bg-emerald-500";
      case "exam": return "bg-red-500";
      case "important": return "bg-purple-500";
      default: return "bg-gray-400";
    }
  };

  const eventIcon = (type: string) => {
    switch (type) {
      case "task": return <CheckSquare size={14} className="text-emerald-600" />;
      case "exam": return <BookOpen size={14} className="text-red-600" />;
      case "important": return <Star size={14} className="text-purple-600 fill-purple-600" />;
      default: return null;
    }
  };

  const eventBg = (type: string) => {
    switch (type) {
      case "task": return "bg-emerald-50 border-emerald-200";
      case "exam": return "bg-red-50 border-red-200";
      case "important": return "bg-purple-50 border-purple-200";
      default: return "bg-gray-50 border-gray-200";
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
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100/60 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <Link
            to="/dashboard"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Calendario</h1>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrev}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-semibold text-gray-900">{monthName}</h2>
          <button
            onClick={goToNext}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
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
                  "flex flex-col items-center justify-center py-2 rounded-xl transition-all min-h-[44px]",
                  !cell.isCurrentMonth && "opacity-30",
                  isSelected && "bg-indigo-600 text-white shadow-md shadow-indigo-200",
                  isToday && !isSelected && "bg-indigo-50",
                  cell.isCurrentMonth && !isSelected && !isToday && "hover:bg-gray-50 active:bg-gray-100"
                )}
              >
                <span
                  className={clsx(
                    "text-sm font-medium",
                    isSelected ? "text-white" : isToday ? "text-indigo-600 font-bold" : "text-gray-800"
                  )}
                >
                  {cell.day}
                </span>
                {dots.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dots.slice(0, 3).map((type, j) => (
                      <div
                        key={j}
                        className={clsx(
                          "w-1 h-1 rounded-full",
                          isSelected ? "bg-white/70" : dotColor(type)
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
        <div className="flex items-center justify-center gap-5 mt-3 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-gray-500 font-medium">Tareas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-gray-500 font-medium">Exámenes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[10px] text-gray-500 font-medium">Importante</span>
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
              className="space-y-2.5"
            >
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>

              {selectedEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Sin eventos este día</p>
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
                        "p-4 rounded-2xl border shadow-sm",
                        eventBg(ev.type)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{eventIcon(ev.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                              {eventLabel(ev.type)}
                            </span>
                            {ev.completed && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 font-medium">
                                Hecho
                              </span>
                            )}
                          </div>
                          <h4
                            className={clsx(
                              "font-semibold text-sm text-gray-900",
                              ev.completed && "line-through text-gray-400"
                            )}
                          >
                            {ev.title}
                          </h4>
                          {cls && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
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
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Próximos Eventos
            </h3>
            <div className="space-y-2.5">
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
                      className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3"
                    >
                      <div className="flex flex-col items-center justify-center w-11 h-11 bg-gray-50 rounded-xl">
                        <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">
                          {new Date(ev.date + "T12:00:00").toLocaleDateString("es-ES", { month: "short" })}
                        </span>
                        <span className="text-base font-bold text-gray-900 leading-none">
                          {new Date(ev.date + "T12:00:00").getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {ev.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className={clsx("w-1.5 h-1.5 rounded-full", dotColor(ev.type))} />
                          <span className="text-[10px] text-gray-500">
                            {eventLabel(ev.type)} {cls ? `· ${cls.name}` : ""}
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
