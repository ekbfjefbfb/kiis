import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  ArrowLeft, Mic, History, Sparkles, BookOpen, 
  ChevronRight, Calendar, User, Zap, LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CLASSES } from "../data/mock";

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'grabar' | 'historial' | 'resumen'>('grabar');
  
  const cls = CLASSES.find(c => c.id === classId) || CLASSES[0];
  const history = JSON.parse(localStorage.getItem(`class_history_${classId}`) || '[]');

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans flex flex-col pb-20" style={{ backgroundColor: '#000000' }}>
      {/* Header Jerárquico - Nivel 1 */}
      <header className="px-6 pt-14 pb-8 flex flex-col gap-6 sticky top-0 bg-black/90 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
          <div className="flex gap-3">
            <div className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">En Línea_</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-zinc-500">
            <BookOpen size={12} />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Materia_</span>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white">
            {cls.name}
          </h1>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mt-1">
            {cls.professor} • {cls.room}
          </p>
        </div>
      </header>

      {/* Navegación de Pestañas Inteligente */}
      <nav className="px-6 py-6 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
        {[
          { id: 'grabar', label: 'Grabar_', icon: <Mic size={14} /> },
          { id: 'resumen', label: 'Resumen_', icon: <Sparkles size={14} /> },
          { id: 'historial', label: 'Historial_', icon: <History size={14} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-full font-bold uppercase italic tracking-tight text-[11px] transition-all whitespace-nowrap border ${
              activeTab === tab.id 
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
                : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/50 hover:border-zinc-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'grabar' && (
            <motion.div 
              key="grabar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col items-center justify-center py-10 space-y-12"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-white/5 rounded-[60px] blur-3xl group-active:bg-white/10 transition-colors" />
                <button 
                  onClick={() => navigate("/live")}
                  className="relative w-48 h-48 rounded-[60px] bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl active:scale-95 transition-all"
                >
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                    <Mic size={32} className="text-black" fill="currentColor" />
                  </div>
                </button>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Iniciar Grabación_</h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] max-w-[200px] mx-auto leading-relaxed">
                  Captura audio y genera inteligencia de clase instantánea
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'resumen' && (
            <motion.div 
              key="resumen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Zap size={14} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">Estado_Global_</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-zinc-400 italic leading-relaxed">
                    Aún no hay suficientes datos para generar un resumen global de esta materia. Graba tu primera clase para empezar.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'historial' && (
            <motion.div 
              key="historial"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {history.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <History size={48} strokeWidth={1} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em]">Sin registros previos_</p>
                </div>
              ) : (
                history.map((session: any) => (
                  <button
                    key={session.id}
                    className="w-full bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-[28px] flex items-center justify-between group active:bg-zinc-800 transition-all"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{session.date}</span>
                      <h4 className="font-bold uppercase italic tracking-tight text-white">{session.topic}</h4>
                    </div>
                    <ChevronRight size={16} className="text-zinc-700" />
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
