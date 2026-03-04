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
      <header className="w-full bg-black pt-10 pb-4 shrink-0">
        <div className="mobile-container flex-row justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-0.5">Hoy</span>
            <h1 className="text-lg font-black text-white tracking-tight">
              {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }).toLowerCase()}
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/calendar")} className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800/50 flex items-center justify-center active:scale-95 transition-all">
              <Calendar size={16} className="text-zinc-500" />
            </button>
            <button onClick={() => navigate("/profile")} className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800/50 flex items-center justify-center active:scale-95 transition-all">
              <User size={16} className="text-zinc-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide py-10">
        <div className="mobile-container space-y-16">
          {/* Main Action - Extremely Minimal */}
          <section>
            <button 
              onClick={() => navigate("/live")}
              className="w-full bg-zinc-900/50 border border-zinc-800/40 py-4 px-5 rounded-xl flex items-center justify-between active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-3">
                <Mic size={18} className="text-zinc-500 group-active:text-white transition-colors" />
                <span className="text-sm font-bold text-zinc-300">Grabar ahora</span>
              </div>
              <ChevronRight size={14} className="text-zinc-700" />
            </button>
          </section>

          {/* Agenda Section - Pure Hierarchy */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Agenda</h2>
              <button 
                onClick={() => setShowAddClass(true)}
                className="text-[9px] font-bold text-zinc-700 hover:text-zinc-400 transition-colors uppercase tracking-widest"
              >
                + añadir
              </button>
            </div>

            <div className="space-y-2.5">
              {CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => navigate(`/class/${cls.id}`)}
                  className="w-full bg-zinc-900/30 border border-zinc-800/30 p-4 rounded-xl flex flex-col gap-3 text-left active:bg-zinc-800/40 transition-all"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col">
                      <h3 className="text-sm font-bold text-zinc-200">{cls.name}</h3>
                      <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider">{cls.professor}</span>
                    </div>
                    <ChevronRight size={14} className="text-zinc-800" />
                  </div>

                  {cls.nextTask && (
                    <div className="pt-2.5 border-t border-zinc-800/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-1 h-1 rounded-full bg-blue-500/50" />
                        <p className="text-[11px] text-zinc-500 font-medium truncate italic">{cls.nextTask}</p>
                      </div>
                      <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-tighter shrink-0 ml-2">{cls.taskDate}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="space-y-8 pb-20">
            <div className="flex items-center gap-3 text-zinc-600 px-6">
              <Clock size={18} className="opacity-40" />
              <span className="text-[11px] font-black uppercase tracking-[0.8em]">Recientes_</span>
            </div>
            <div className="w-full bg-zinc-900/10 border border-dashed border-zinc-800/20 rounded-[56px] p-24 flex flex-col items-center justify-center text-center space-y-8">
              <Sparkles size={40} className="text-zinc-900 animate-pulse" />
              <p className="text-[11px] font-black uppercase tracking-[0.8em] text-zinc-900 italic">No_System_Activity_</p>
            </div>
          </section>
        </div>
      </main>

      {/* Floating IA Controller - Premium Position */}
      <button 
        onClick={() => navigate("/chat")}
        className="fixed bottom-8 right-6 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_20px_60px_rgba(255,255,255,0.2)] active:scale-[0.9] transition-all z-50 border-[5px] border-black"
      >
        <MessageSquare size={24} fill="currentColor" />
      </button>

      {showAddClass && <AddClassModal isOpen={showAddClass} onClose={() => setShowAddClass(false)} />}
    </div>
  );
}
