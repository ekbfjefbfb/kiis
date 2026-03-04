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
      <header className="w-full bg-black pt-8 pb-4 shrink-0 border-b border-zinc-900">
        <div className="mobile-container flex-row justify-between items-end pb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-0.5">Terminal</span>
            <h1 className="text-lg font-black text-white tracking-tight uppercase">
              {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </h1>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => navigate("/calendar")} className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800/50 flex items-center justify-center active:scale-95 transition-all">
              <Calendar size={14} className="text-zinc-500" />
            </button>
            <button onClick={() => navigate("/profile")} className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800/50 flex items-center justify-center active:scale-95 transition-all">
              <User size={14} className="text-zinc-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide py-10">
        <div className="mobile-container space-y-16">
          {/* Main Action - Intelligence Engine */}
          <section>
            <button 
              onClick={() => navigate("/live")}
              className="w-full bg-zinc-900 border border-zinc-800 py-3.5 px-4 rounded-xl flex items-center justify-between active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-3">
                <Mic size={16} className="text-zinc-500" />
                <span className="text-sm font-bold text-zinc-300">Iniciar captura</span>
              </div>
              <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">IA_LIVE</span>
              </div>
            </button>
          </section>

          {/* Agenda Section - Total Hierarchy */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Agenda Académica</h2>
              <button 
                onClick={() => setShowAddClass(true)}
                className="text-[9px] font-bold text-zinc-700 hover:text-white transition-colors"
              >
                + NUEVA
              </button>
            </div>

            <div className="space-y-2">
              {CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => navigate(`/class/${cls.id}`)}
                  className="w-full bg-zinc-900/40 border border-zinc-800/40 p-4 rounded-xl flex flex-col gap-2.5 text-left active:bg-zinc-800/60 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="flex flex-col">
                      <h3 className="text-sm font-bold text-white tracking-tight">{cls.name}</h3>
                      <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-widest">{cls.professor}</span>
                    </div>
                    <ChevronRight size={14} className="text-zinc-800" />
                  </div>

                  {cls.nextTask && (
                    <div className="pt-2 border-t border-zinc-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                        <p className="text-[11px] text-zinc-500 font-medium truncate">{cls.nextTask}</p>
                      </div>
                      <span className="text-[8px] font-bold text-zinc-700 uppercase shrink-0 ml-2">{cls.taskDate}</span>
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
            className="fixed bottom-6 right-6 w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center shadow-lg active:scale-95 transition-all z-50"
          >
            <MessageSquare size={20} />
          </button>

      {showAddClass && <AddClassModal isOpen={showAddClass} onClose={() => setShowAddClass(false)} />}
    </div>
  );
}
