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
      {/* Premium Header */}
      <header className="w-full bg-black/80 backdrop-blur-xl z-30 pt-12 pb-8 border-b border-white/5 shrink-0">
        <div className="mobile-container space-y-8">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate("/dashboard")} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all shadow-lg">
              <ArrowLeft size={20} className="text-zinc-400" />
            </button>
            <div className="px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-3 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">En_Línea_</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-zinc-600">
              <BookOpen size={16} className="opacity-40" />
              <span className="text-[11px] font-black uppercase tracking-[0.8em]">Materia_</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">
              {cls.name}
            </h1>
            <div className="flex items-center gap-4 text-[11px] font-black text-zinc-500 uppercase tracking-widest mt-2">
              <span>{cls.professor}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-800" />
              <span>{cls.room}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Strategic Navigation */}
      <nav className="w-full bg-black shrink-0 py-6 border-b border-white/5">
        <div className="mobile-container flex-row gap-3 overflow-x-auto scrollbar-hide">
          {[
            { id: 'grabar', label: 'Grabar_', icon: <Mic size={16} /> },
            { id: 'resumen', label: 'Resumen_', icon: <Sparkles size={16} /> },
            { id: 'historial', label: 'Historial_', icon: <History size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-6 py-4 rounded-[22px] font-black uppercase italic tracking-tight text-xs transition-all whitespace-nowrap border-none ${
                activeTab === tab.id 
                  ? 'bg-white text-black shadow-[0_15px_40px_rgba(255,255,255,0.2)]' 
                  : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto scrollbar-hide py-10">
        <div className="mobile-container h-full">
          <AnimatePresence mode="wait">
            {activeTab === 'grabar' && (
              <motion.div 
                key="grabar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col items-center justify-center space-y-6 py-10"
              >
                <button 
                  onClick={() => navigate("/live")}
                  className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-[0.98] transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 group-active:bg-white group-active:border-white transition-all">
                    <Mic size={18} className="text-zinc-500 group-active:text-black transition-colors" />
                  </div>
                </button>
                <div className="text-center">
                  <h2 className="text-sm font-bold text-zinc-300">Capturar audio</h2>
                  <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mt-1">Sesión en vivo</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'resumen' && (
              <motion.div 
                key="resumen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 text-zinc-500 mb-6">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Inteligencia de Materia</span>
                  </div>
                  <div className="space-y-6">
                    <p className="text-sm text-zinc-400 leading-relaxed italic">
                      Inicia una captura para generar el resumen inteligente y la lista de tareas de esta clase.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Sesiones</p>
                        <p className="text-xl font-black text-zinc-300">0</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Tareas</p>
                        <p className="text-xl font-black text-zinc-300">0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'historial' && (
              <motion.div 
                key="historial"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {history.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center opacity-20">
                    <History size={32} strokeWidth={1.5} />
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-4">Vacío</p>
                  </div>
                ) : (
                  history.map((session: any) => (
                    <button
                      key={session.id}
                      className="w-full bg-zinc-900/30 border border-zinc-800/30 p-4 rounded-xl flex items-center justify-between active:bg-zinc-800/40 transition-all text-left"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">{session.date}</span>
                        <h4 className="text-sm font-bold text-zinc-300 leading-tight">{session.topic}</h4>
                      </div>
                      <ChevronRight size={14} className="text-zinc-800" />
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
