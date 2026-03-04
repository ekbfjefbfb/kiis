import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  Mic, Plus, Calendar, User, ChevronRight, 
  BookOpen, Sparkles, Clock, LayoutGrid
} from "lucide-react";
import { motion } from "motion/react";
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
      <header className="px-6 pt-14 pb-6 flex justify-between items-start sticky top-0 bg-black/80 backdrop-blur-md z-30">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase">Hoy_</p>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
            {today}
          </h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/calendar")} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
            <Calendar size={18} className="text-zinc-400" />
          </button>
          <button onClick={() => navigate("/profile")} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
            <User size={18} className="text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 space-y-10">
        {/* Acción Principal - Jerarquía Nivel 2 */}
        <section>
          <button 
            onClick={() => navigate("/live")}
            className="w-full bg-white text-black p-6 rounded-[32px] flex items-center justify-between group active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center">
                <Mic size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">Grabar Ahora_</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">IA en tiempo real</p>
              </div>
            </div>
            <ChevronRight size={24} />
          </button>
        </section>

        {/* Lista de Materias - Jerarquía Nivel 3 */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <div className="flex items-center gap-2 text-zinc-500">
              <BookOpen size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Materias_</span>
            </div>
            <button 
              onClick={() => setShowAddClass(true)}
              className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              + Añadir
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-2.5">
            {CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => navigate(`/class/${cls.id}`)}
                className="w-full bg-zinc-900/50 border border-zinc-800/50 p-5 rounded-[24px] flex items-center justify-between group active:bg-zinc-800 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center group-active:bg-zinc-700">
                    <LayoutGrid size={18} className="text-zinc-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold uppercase italic tracking-tight text-zinc-200">{cls.name}</h3>
                    <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-widest mt-0.5">{cls.professor}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-700 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </section>

        {/* Estado Reciente - Jerarquía Nivel 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500 px-2">
            <Clock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Recientes_</span>
          </div>
          <div className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[24px] p-8 flex flex-col items-center justify-center text-center space-y-2">
            <Sparkles size={20} className="text-zinc-800" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 italic">Sin actividad reciente_</p>
          </div>
        </section>
      </main>

      {showAddClass && <AddClassModal isOpen={showAddClass} onClose={() => setShowAddClass(false)} />}
    </div>
  );
}
