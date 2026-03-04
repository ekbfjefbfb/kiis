import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  ArrowLeft, Mic, History, Sparkles, BookOpen, 
  ChevronRight, Zap
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
    <div className="h-[100dvh] w-full bg-black flex flex-col overflow-hidden relative">
      <header className="w-full bg-black/80 backdrop-blur-xl z-30 pt-16 pb-8 border-b border-white/5">
        <div className="mobile-container space-y-8">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate("/dashboard")} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
              <ArrowLeft size={20} className="text-zinc-400" />
            </button>
            <div className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">En_Línea_</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-zinc-600">
              <BookOpen size={14} className="opacity-40" />
              <span className="text-[10px] font-bold uppercase tracking-[0.6em]">Materia_</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">
              {cls.name}
            </h1>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
              {cls.professor} • {cls.room}
            </p>
          </div>
        </div>
      </header>

      <nav className="w-full bg-black shrink-0 py-6">
        <div className="mobile-container flex-row gap-3 overflow-x-auto scrollbar-hide">
          {[
            { id: 'grabar', label: 'Grabar_', icon: <Mic size={14} /> },
            { id: 'resumen', label: 'Resumen_', icon: <Sparkles size={14} /> },
            { id: 'historial', label: 'Historial_', icon: <History size={14} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-4 rounded-full font-black uppercase italic tracking-tight text-[11px] transition-all whitespace-nowrap border ${
                activeTab === tab.id 
                  ? 'bg-white text-black border-white shadow-xl' 
                  : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto scrollbar-hide py-8">
        <div className="mobile-container h-full">
          <AnimatePresence mode="wait">
            {activeTab === 'grabar' && (
              <motion.div 
                key="grabar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col items-center justify-center space-y-16 py-12"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/5 rounded-[72px] blur-3xl" />
                  <button 
                    onClick={() => navigate("/live")}
                    className="relative w-56 h-56 rounded-[72px] bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl active:scale-[0.96] transition-all"
                  >
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                      <Mic size={40} className="text-black" fill="currentColor" />
                    </div>
                  </button>
                </div>
                <div className="text-center space-y-4 px-8">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Iniciar_Terminal_</h2>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.5em] leading-relaxed">
                    Captura audio y genera inteligencia de clase instantánea
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'resumen' && ( activeTab === 'resumen' && (
              <motion.div 
                key="resumen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-zinc-900/40 border border-white/[0.03] rounded-[48px] p-10 space-y-8 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Zap size={18} className="text-white" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-zinc-400">Estado_Global_</span>
                  </div>
                  <p className="text-sm text-zinc-400 italic leading-relaxed">
                    Aún no hay suficientes datos para generar un resumen global. Inicia una grabación para activar el motor IA.
                  </p>
                </div>
              </motion.div>
            ))}

            {activeTab === 'historial' && (
              <motion.div 
                key="historial"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {history.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                    <History size={64} strokeWidth={1} />
                    <p className="text-[11px] font-bold uppercase tracking-[0.6em]">Sin_Registros_</p>
                  </div>
                ) : (
                  history.map((session: any) => (
                    <button
                      key={session.id}
                      className="w-full bg-zinc-900/30 border border-white/[0.03] p-8 rounded-[40px] flex items-center justify-between group active:bg-zinc-800/40 transition-all"
                    >
                      <div className="flex flex-col items-start gap-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{session.date}</span>
                        <h4 className="text-xl font-bold uppercase italic tracking-tight text-white leading-tight">{session.topic}</h4>
                      </div>
                      <ChevronRight size={20} className="text-zinc-800 group-hover:text-zinc-500 transition-all" />
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
