import { useState } from "react";
import { 
  ChevronLeft, 
  Plus, Calendar as CalendarIcon, MapPin
} from "lucide-react";
import { useNavigate } from "react-router";

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
  const today = new Date();

  const events: Event[] = [
    { id: "1", title: "Historia Universal", type: "class", time: "08:00 AM", room: "A-102" },
    { id: "2", title: "Ensayo Revolución Francesa", type: "task", time: "11:59 PM", completed: false },
    { id: "3", title: "Examen Parcial Cálculo", type: "exam", time: "10:00 AM", room: "B-204" }
  ];

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      <header className="px-8 pt-16 pb-6 flex items-center justify-between">
        <button onClick={() => navigate("/dashboard")} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Agenda</h1>
        <button className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full active:bg-white/10 transition-colors">
          <Plus size={24} />
        </button>
      </header>

      <main className="flex-1 flex flex-col px-8 pt-4 overflow-hidden">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tighter leading-none italic">
              {today.toLocaleDateString("es-ES", { month: "long" })}
            </h2>
            <p className="text-zinc-500 font-medium mt-1">
              {today.getFullYear()}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate("/dashboard")}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900/50 text-zinc-600 active:text-white transition-colors"
              aria-label="Volver al dashboard"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 space-y-6">
          {events.map((event) => (
            <button 
              key={event.id}
              className="w-full bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-6 flex items-center justify-between active:scale-[0.98] active:bg-zinc-900/50 transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${
                  event.type === 'class' ? 'bg-white/5' : 
                  event.type === 'exam' ? 'bg-red-500/10' : 'bg-emerald-500/10'
                }`}>
                  {event.type === 'class' ? <CalendarIcon size={24} className="text-zinc-500" /> :
                   event.type === 'exam' ? <span className="text-[10px] font-extrabold text-red-500">EXAM</span> :
                   <CheckCircleIcon size={24} className="text-emerald-500" />}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{event.time}</p>
                  <h3 className="text-xl font-bold tracking-tight text-white leading-tight mb-2">{event.title}</h3>
                  {event.room && (
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <MapPin size={12} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">{event.room}</p>
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight size={20} className="text-zinc-800" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function CheckCircleIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
