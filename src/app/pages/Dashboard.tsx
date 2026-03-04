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
      <header className="w-full bg-black/80 backdrop-blur-xl z-30 pt-16 pb-10 shrink-0">
        <div className="mobile-container flex-row justify-between items-center px-8">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black tracking-[0.6em] text-zinc-600 uppercase leading-none">Hoy_</p>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white">
              {today}
            </h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate("/calendar")} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all shadow-lg">
              <Calendar size={20} className="text-zinc-400" />
            </button>
            <button onClick={() => navigate("/profile")} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all shadow-lg">
              <User size={20} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide py-10">
        <div className="mobile-container space-y-16">
          {/* Main Action - Centered & Massive Impact */}
          <section className="px-2">
            <button 
              onClick={() => navigate("/live")}
              className="w-full bg-white text-black p-10 rounded-[56px] flex items-center justify-between group active:scale-[0.96] transition-all shadow-[0_20px_60px_rgba(255,255,255,0.15)] border-none"
            >
              <div className="flex items-center gap-8">
                <div className="w-18 h-18 rounded-[28px] bg-black flex items-center justify-center shadow-2xl">
                  <Mic size={36} className="text-white" />
                </div>
                <div className="text-left space-y-1">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Grabar_Ahora_</h2>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Captura_IA_Total_</p>
                </div>
              </div>
              <ChevronRight size={36} strokeWidth={3} className="opacity-10 group-hover:opacity-100 transition-opacity" />
            </button>
          </section>

          {/* Agenda Section */}
          <section className="space-y-8">
            <div className="flex justify-between items-center px-6">
              <div className="flex items-center gap-3 text-zinc-600">
                <BookOpen size={18} className="opacity-40" />
                <span className="text-[11px] font-black uppercase tracking-[0.8em]">Agenda_</span>
              </div>
              <button 
                onClick={() => setShowAddClass(true)}
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all group"
              >
                <Plus size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 px-2">
              {CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => navigate(`/class/${cls.id}`)}
                  className="w-full bg-zinc-900/30 border border-white/[0.03] p-8 rounded-[44px] flex items-center justify-between group active:bg-zinc-800/40 transition-all hover:border-white/10"
                >
                  <div className="flex items-center gap-7">
                    <div className="w-16 h-16 rounded-[24px] bg-zinc-900/50 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                      <LayoutGrid size={24} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <div className="text-left space-y-1.5">
                      <h3 className="text-xl font-black uppercase italic tracking-tight text-zinc-100 leading-none">{cls.name}</h3>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] opacity-60">{cls.professor}</p>
                    </div>
                  </div>
                  <ChevronRight size={22} className="text-zinc-900 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all" />
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
        className="fixed bottom-12 right-8 w-18 h-18 rounded-full bg-white text-black flex items-center justify-center shadow-[0_20px_60px_rgba(255,255,255,0.2)] active:scale-[0.85] transition-all z-50 border-[6px] border-black"
      >
        <MessageSquare size={32} fill="currentColor" />
      </button>

      {showAddClass && <AddClassModal isOpen={showAddClass} onClose={() => setShowAddClass(false)} />}
    </div>
  );
}
