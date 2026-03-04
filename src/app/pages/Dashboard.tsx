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
      {/* Header Minimalista - Jerarquía Nivel 1 */}
      <header className="px-6 pt-14 pb-8 flex justify-between items-start sticky top-0 bg-black/90 backdrop-blur-xl z-30">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase">Hoy_</p>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
            {today}
          </h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/calendar")} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
            <Calendar size={20} className="text-zinc-400" />
          </button>
          <button onClick={() => navigate("/profile")} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
            <User size={20} className="text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 space-y-12">
        {/* Acción Principal - Jerarquía Nivel 2 */}
        <section>
          <button 
            onClick={() => navigate("/live")}
            className="w-full bg-white text-black p-8 rounded-[40px] flex items-center justify-between group active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[24px] bg-black flex items-center justify-center">
                <Mic size={32} className="text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Grabar Ahora_</h2>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40 mt-1.5">IA en tiempo real</p>
              </div>
            </div>
            <ChevronRight size={28} strokeWidth={3} />
          </button>
        </section>

        {/* Lista de Materias - Jerarquía Nivel 3 */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <div className="flex items-center gap-2.5 text-zinc-500">
              <BookOpen size={16} />
              <span className="text-[11px] font-bold uppercase tracking-[0.4em]">Materias_</span>
            </div>
            <button 
              onClick={() => setShowAddClass(true)}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all"
            >
              <Plus size={16} className="text-zinc-400" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => navigate(`/class/${cls.id}`)}
                className="w-full bg-zinc-900/40 border border-zinc-800/40 p-6 rounded-[32px] flex items-center justify-between group active:bg-zinc-800 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-[18px] bg-zinc-800 flex items-center justify-center group-active:bg-zinc-700">
                    <LayoutGrid size={20} className="text-zinc-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold uppercase italic tracking-tight text-white leading-tight">{cls.name}</h3>
                    <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mt-1">{cls.professor}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-zinc-800 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </section>

        {/* Estado Reciente - Jerarquía Nivel 4 */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 text-zinc-500 px-2">
            <Clock size={16} />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em]">Recientes_</span>
          </div>
          <div className="bg-zinc-900/20 border border-dashed border-zinc-800/40 rounded-[32px] p-12 flex flex-col items-center justify-center text-center space-y-4">
            <Sparkles size={24} className="text-zinc-900" />
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-800 italic">Sin actividad reciente_</p>
          </div>
        </section>
      </main>

      {showAddClass && <AddClassModal isOpen={showAddClass} onClose={() => setShowAddClass(false)} />}
    </div>
  );
}
