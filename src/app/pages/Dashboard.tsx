import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  Mic, Calendar, User, ChevronRight, 
  BookOpen, Sparkles, Clock, LayoutGrid, Plus
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
    <div className="min-h-screen w-full bg-black text-white font-sans flex flex-col pb-10" style={{ backgroundColor: '#000000' }}>
      {/* Header - Ingeniería Minimalista */}
      <header className="px-8 pt-20 pb-12 flex justify-between items-start sticky top-0 bg-black/80 backdrop-blur-xl z-30">
        <div className="space-y-2">
          <p className="text-[10px] font-bold tracking-[0.6em] text-zinc-600 uppercase">Hoy_</p>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
            {today}
          </h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate("/calendar")} className="w-12 h-12 rounded-full bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center active:scale-90 transition-all">
            <Calendar size={20} className="text-zinc-400" />
          </button>
          <button onClick={() => navigate("/profile")} className="w-12 h-12 rounded-full bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center active:scale-90 transition-all">
            <User size={20} className="text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-8 space-y-16">
        {/* Acción Principal - Impacto Visual Inteligente */}
        <section>
          <button 
            onClick={() => navigate("/live")}
            className="w-full bg-white text-black p-10 rounded-[48px] flex items-center justify-between group active:scale-[0.96] transition-all shadow-[0_30px_70px_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 rounded-[24px] bg-black flex items-center justify-center shadow-lg">
                <Mic size={32} className="text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Grabar_Ahora_</h2>
                <p className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-40 mt-2.5">Inteligencia_Realtime_</p>
              </div>
            </div>
            <ChevronRight size={36} strokeWidth={3} className="opacity-10 group-hover:opacity-100 transition-opacity" />
          </button>
        </section>

        {/* Materias - Jerarquía Nivel 2 */}
        <section className="space-y-8">
          <div className="flex justify-between items-center px-4">
            <div className="flex items-center gap-3 text-zinc-600">
              <BookOpen size={16} className="opacity-40" />
              <span className="text-[11px] font-bold uppercase tracking-[0.7em]">Materias_</span>
            </div>
            <button 
              onClick={() => setShowAddClass(true)}
              className="w-10 h-10 rounded-full bg-zinc-900/40 border border-zinc-800/40 flex items-center justify-center active:scale-90 transition-all group"
            >
              <Plus size={18} className="text-zinc-500 group-hover:text-white transition-colors" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => navigate(`/class/${cls.id}`)}
                className="w-full bg-zinc-900/30 border border-white/[0.03] p-8 rounded-[40px] flex items-center justify-between group active:bg-zinc-800/40 transition-all hover:border-white/10"
              >
                <div className="flex items-center gap-7">
                  <div className="w-14 h-14 rounded-[22px] bg-zinc-900/50 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                    <LayoutGrid size={22} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold uppercase italic tracking-tight text-zinc-100 leading-none">{cls.name}</h3>
                    <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-[0.3em] mt-2.5 opacity-50">{cls.professor}</p>
                  </div>
                </div>
                <ChevronRight size={22} className="text-zinc-900 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </section>

        {/* Recientes - Brutalismo Minimal */}
        <section className="space-y-8 pb-10">
          <div className="flex items-center gap-3 text-zinc-600 px-4">
            <Clock size={16} className="opacity-40" />
            <span className="text-[11px] font-bold uppercase tracking-[0.7em]">Recientes_</span>
          </div>
          <div className="bg-zinc-900/10 border border-dashed border-zinc-800/20 rounded-[48px] p-24 flex flex-col items-center justify-center text-center space-y-6">
            <Sparkles size={32} className="text-zinc-900" />
            <p className="text-[11px] font-bold uppercase tracking-[0.7em] text-zinc-900 italic">No_Activity_</p>
          </div>
        </section>
      </main>

      {showAddClass && <AddClassModal isOpen={showAddClass} onClose={() => setShowAddClass(false)} />}
    </div>
  );
}
