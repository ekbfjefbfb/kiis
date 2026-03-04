import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, Calendar as CalendarIcon, List, 
  ChevronRight, Clock, MapPin, Zap
} from "lucide-react";
import { motion } from "motion/react";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'month'>('list');

  const events = [
    { id: 1, time: "08:00", title: "MATEMÁTICAS_AVANZADAS_", room: "SALA_A", prof: "DRA. SARAH COHEN" },
    { id: 2, time: "10:30", title: "HISTORIA_MUNDIAL_", room: "SALA_B", prof: "PROF. JAMES MILLER" },
    { id: 3, time: "14:00", title: "FÍSICA_101_", room: "LAB_4", prof: "DRA. EMILY CHEN" }
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center overflow-x-hidden" style={{ backgroundColor: '#000000' }}>
      <header className="w-full max-w-2xl px-8 pt-16 pb-8 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-30 shrink-0">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-zinc-400" />
        </button>
        <div className="flex bg-zinc-900/50 p-1.5 rounded-full border border-zinc-800">
          <button 
            onClick={() => setView('list')}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white text-black' : 'text-zinc-500'}`}
          >
            Agenda_
          </button>
          <button 
            onClick={() => setView('month')}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'month' ? 'bg-white text-black' : 'text-zinc-500'}`}
          >
            Mes_
          </button>
        </div>
        <div className="w-12" />
      </header>

      <main className="w-full max-w-2xl flex-1 px-8 py-8 space-y-12">
        <div className="space-y-2">
          <p className="text-[10px] font-bold tracking-[0.6em] text-zinc-600 uppercase">Horario_Actual_</p>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Miércoles_04_</h1>
        </div>

        <section className="space-y-4">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-zinc-900/30 border border-white/[0.03] p-8 rounded-[40px] flex items-center justify-between group active:bg-zinc-800/40 transition-all"
            >
              <div className="flex items-center gap-7">
                <div className="flex flex-col items-center justify-center space-y-1">
                  <span className="text-sm font-black italic text-white leading-none">{event.time}</span>
                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                </div>
                <div className="text-left space-y-2">
                  <h3 className="text-xl font-bold uppercase italic tracking-tight text-white leading-none">{event.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><MapPin size={10} /> {event.room}</span>
                    <span className="opacity-40">•</span>
                    <span>{event.prof}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-zinc-800 group-hover:text-zinc-500 transition-all" />
            </motion.div>
          ))}
        </section>

        {/* Empty State / Bottom spacer */}
        <div className="py-10 flex flex-col items-center opacity-10">
          <Zap size={32} />
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] mt-4">Terminal_Sync_</p>
        </div>
      </main>
    </div>
  );
}
