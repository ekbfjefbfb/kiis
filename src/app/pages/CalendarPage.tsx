import { useState } from "react";
import { 
  ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, Clock, MapPin, CheckCircle2, ListTodo, LayoutGrid 
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import AddClassModal from "../components/AddClassModal";

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
  const [view, setView] = useState<"agenda" | "month">("agenda");
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events: Event[] = [
    { id: "1", title: "Historia Universal", type: "class", time: "08:00 AM", room: "A-102" },
    { id: "2", title: "Ensayo Revolución Francesa", type: "task", time: "11:59 PM", completed: false },
    { id: "3", title: "Examen Parcial Cálculo", type: "exam", time: "10:00 AM", room: "B-204" }
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans selection:bg-white/20 overflow-x-hidden flex flex-col">
      {/* Header Brutalista */}
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Agenda</p>
            <h1 className="text-2xl font-black tracking-tight leading-none">Calendario</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setView(view === "agenda" ? "month" : "agenda")}
            className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform text-zinc-400"
          >
            {view === "agenda" ? <LayoutGrid size={20} /> : <ListTodo size={20} />}
          </button>
          <button 
            onClick={() => setIsAddingClass(true)}
            className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center active:scale-90 transition-transform shadow-xl"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {/* Date Navigation - Brutal & Clean */}
      <div className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-black tracking-tight">
            {selectedDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-zinc-900/50 flex items-center justify-center text-zinc-600 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button className="w-10 h-10 rounded-full bg-zinc-900/50 flex items-center justify-center text-zinc-600 hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* View Content Area */}
      <main className="flex-1 px-[env(safe-area-inset-left,1.25rem)] pr-[env(safe-area-inset-right,1.25rem)] py-8 max-w-2xl mx-auto w-full pb-32">
        <AnimatePresence mode="wait">
          {view === "agenda" ? (
            <motion.div 
              key="agenda-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {events.map((event) => (
                <motion.div 
                  key={event.id}
                  whileTap={{ scale: 0.98 }}
                  className="bg-zinc-900/40 border border-white/5 rounded-[28px] p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className={clsx(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5",
                      event.type === "class" ? "bg-zinc-800" : 
                      event.type === "exam" ? "bg-red-500/10" : "bg-emerald-500/10"
                    )}>
                      {event.type === "class" ? <CalendarIcon size={20} className="text-zinc-500" /> :
                       event.type === "exam" ? <span className="text-[10px] font-black text-red-500">EXM</span> :
                       <CheckCircle2 size={20} className="text-emerald-500" />}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{event.time}</p>
                      <p className="text-lg font-black tracking-tight text-white leading-tight">{event.title}</p>
                      {event.room && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-zinc-500">
                          <MapPin size={10} />
                          <p className="text-[9px] font-bold uppercase tracking-widest">{event.room}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-zinc-800" />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="month-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-zinc-900/20 border border-white/5 rounded-[32px] p-6"
            >
              <div className="grid grid-cols-7 gap-2 mb-6">
                {["D", "L", "M", "M", "J", "V", "S"].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-zinc-700 uppercase">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 h-64">
                {[...Array(31)].map((_, i) => (
                  <button 
                    key={i}
                    className={clsx(
                      "flex items-center justify-center text-sm font-bold rounded-xl transition-all aspect-square",
                      i + 1 === 15 ? "bg-white text-black" : "text-zinc-500 hover:text-white active:bg-zinc-800"
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
