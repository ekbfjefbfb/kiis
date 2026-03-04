import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  Mic, Calendar, User, ChevronRight, 
  BookOpen, Sparkles, Clock, LayoutGrid, Plus, MessageSquare
} from "lucide-react";
import { CLASSES } from "../data/mock";
import AddClassModal from "../components/AddClassModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showAddClass, setShowAddClass] = useState(false);
  
  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).toUpperCase();
  return (
    <div className="h-[100dvh] w-full bg-black flex flex-col overflow-hidden relative" style={{ backgroundColor: '#000000' }}>
      {/* Header - Engineering Minimal Apple/Tesla Style */}
      <header className="w-full bg-black pt-8 pb-4 shrink-0">
        <div className="mobile-container flex-row justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xs font-bold text-white tracking-[0.2em] uppercase">
              {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/calendar")} className="text-zinc-600 active:text-white transition-colors">
              <Calendar size={18} />
            </button>
            <button onClick={() => navigate("/profile")} className="text-zinc-600 active:text-white transition-colors">
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide py-10">
        <div className="mobile-container space-y-16">
          {/* Main Action - Pure Utility */}
          <section>
            <button 
              onClick={() => navigate("/live")}
              className="w-full bg-zinc-900/40 border border-zinc-800/50 py-3.5 px-5 rounded-lg flex items-center justify-between active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center gap-3">
                <Mic size={16} className="text-zinc-500" />
                <span className="text-[13px] font-bold text-zinc-400 uppercase tracking-wider">Capturar audio</span>
              </div>
              <ChevronRight size={14} className="text-zinc-800" />
            </button>
          </section>

          {/* Agenda Section - Information Centric */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em]">Agenda</h2>
              <button 
                onClick={() => setShowAddClass(true)}
                className="text-[10px] font-bold text-zinc-700 hover:text-white transition-colors"
              >
                + NUEVA
              </button>
            </div>

            <div className="space-y-2.5">
              {CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => navigate(`/class/${cls.id}`)}
                  className="w-full bg-zinc-900/20 border border-zinc-800/20 p-4 rounded-xl flex flex-col gap-3 text-left active:bg-zinc-800/30 transition-all"
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="flex flex-col">
                      <h3 className="text-[14px] font-bold text-zinc-200 tracking-tight">{cls.name}</h3>
                      <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">{cls.professor}</span>
                    </div>
                    <ChevronRight size={14} className="text-zinc-800" />
                  </div>

                  {cls.nextTask && (
                    <div className="pt-2.5 border-t border-zinc-800/20 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-1 h-1 rounded-full bg-blue-500/30" />
                        <p className="text-[11px] text-zinc-500 font-medium truncate italic">{cls.nextTask}</p>
                      </div>
                      <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-tighter shrink-0 ml-2">{cls.taskDate}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="space-y-4 pb-20">
            <div className="flex items-center gap-3 text-zinc-600 px-1">
              <Clock size={14} className="opacity-40" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Recientes</span>
            </div>
            <div className="w-full bg-zinc-900/20 border border-dashed border-zinc-800/30 rounded-2xl py-12 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">Sin actividad reciente</p>
            </div>
          </section>
        </div>
      </main>

          <button 
            onClick={() => navigate("/chat")}
            className="fixed bottom-4 right-4 w-9 h-9 rounded bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center active:scale-95 transition-all z-50"
          >
            <MessageSquare size={16} />
          </button>

      {showAddClass && <AddClassModal isOpen={showAddClass} onClose={() => setShowAddClass(false)} />}
    </div>
  );
}
