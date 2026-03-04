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
      <header className="w-full bg-black z-30 pt-8 pb-6 shrink-0">
        <div className="mobile-container flex-row justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hoy</p>
            <h1 className="text-xl font-bold text-white lowercase first-letter:uppercase">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/calendar")} className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800/50 flex items-center justify-center active:scale-95 transition-all">
              <Calendar size={16} className="text-zinc-400" />
            </button>
            <button onClick={() => navigate("/profile")} className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800/50 flex items-center justify-center active:scale-95 transition-all">
              <User size={16} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide py-10">
        <div className="mobile-container space-y-16">
          {/* Main Action - Simple & Balanced */}
          <section className="mb-8">
            <button 
              onClick={() => navigate("/live")}
              className="w-full bg-zinc-900 border border-zinc-800/50 p-5 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Mic size={20} className="text-zinc-400 group-active:text-white transition-colors" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold text-zinc-200">Grabar clase</h2>
                <p className="text-[10px] font-medium text-zinc-500">Inicia la captura de audio</p>
              </div>
            </button>
          </section>

          {/* Agenda Section */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase flex items-center gap-2">
                <BookOpen size={12} strokeWidth={3} />
                Agenda_
              </h2>
              <button 
                onClick={() => setShowAddClass(true)}
                className="p-2 bg-zinc-900 rounded-full border border-zinc-800 text-white"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => navigate(`/class/${cls.id}`)}
                  className="w-full bg-zinc-900/30 border border-white/[0.03] p-4 rounded-2xl flex items-center justify-between group active:bg-zinc-800/40 transition-all hover:border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900/50 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                      <LayoutGrid size={20} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-white transition-colors leading-none mb-1">{cls.name}</h3>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">{cls.professor}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-zinc-800 group-hover:text-zinc-600 transition-all" strokeWidth={3} />
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
