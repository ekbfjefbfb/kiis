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
      <header className="w-full bg-black/80 backdrop-blur-xl z-30 pt-16 pb-10 border-b border-white/5 shrink-0">
        <div className="mobile-container space-y-10">
          <div className="flex justify-between items-center px-4">
            <button onClick={() => navigate("/dashboard")} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all shadow-lg">
              <ArrowLeft size={20} className="text-zinc-400" />
            </button>
            <div className="px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-3 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">En_Línea_</span>
            </div>
          </div>

          <div className="space-y-3 px-4">
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
      <nav className="w-full bg-black shrink-0 py-8 border-b border-white/5">
        <div className="mobile-container flex-row gap-4 overflow-x-auto scrollbar-hide px-6">
          {[
            { id: 'grabar', label: 'Grabar_', icon: <Mic size={16} /> },
            { id: 'resumen', label: 'Resumen_', icon: <Sparkles size={16} /> },
            { id: 'historial', label: 'Historial_', icon: <History size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-5 rounded-[28px] font-black uppercase italic tracking-tight text-xs transition-all whitespace-nowrap border-none ${
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

      <main className="flex-1 overflow-y-auto scrollbar-hide py-12">
        <div className="mobile-container h-full px-8">
          <AnimatePresence mode="wait">
            {activeTab === 'grabar' && (
              <motion.div 
                key="grabar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full flex flex-col items-center justify-center space-y-20 py-16"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/5 rounded-[80px] blur-[100px] animate-pulse" />
                  <button 
                    onClick={() => navigate("/live")}
                    className="relative w-64 h-64 rounded-[80px] bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-[0_40px_100px_rgba(0,0,0,0.5)] active:scale-[0.95] transition-all"
                  >
                    <div className="w-28 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.25)]">
                      <Mic size={48} className="text-black" fill="currentColor" />
                    </div>
                  </button>
                </div>
                <div className="text-center space-y-6">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Iniciar_Terminal_</h2>
                  <p className="text-[12px] font-black text-zinc-500 uppercase tracking-[0.6em] leading-relaxed max-w-[260px] mx-auto">
                    Captura audio y genera inteligencia de clase instantánea
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'resumen' && (
              <motion.div 
                key="resumen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="bg-zinc-900/40 border border-white/[0.03] rounded-[56px] p-12 space-y-10 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[20px] bg-white/5 flex items-center justify-center border border-white/10">
                      <Zap size={22} className="text-white" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.8em] text-zinc-400">Estado_Global_</span>
                  </div>
                  <p className="text-lg text-zinc-400 italic leading-relaxed font-medium">
                    Aún no hay suficientes datos para generar un resumen global. Inicia una grabación para activar el motor IA.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'historial' && (
              <motion.div 
                key="historial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {history.length === 0 ? (
                  <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 opacity-20">
                    <History size={80} strokeWidth={1} />
                    <p className="text-[12px] font-black uppercase tracking-[0.8em]">Sin_Registros_Terminales_</p>
                  </div>
                ) : (
                  history.map((session: any) => (
                    <button
                      key={session.id}
                      className="w-full bg-zinc-900/30 border border-white/[0.03] p-10 rounded-[48px] flex items-center justify-between group active:bg-zinc-800/40 transition-all"
                    >
                      <div className="flex flex-col items-start gap-3">
                        <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">{session.date}</span>
                        <h4 className="text-2xl font-black uppercase italic tracking-tight text-white leading-tight">{session.topic}</h4>
                      </div>
                      <ChevronRight size={24} className="text-zinc-800 group-hover:text-zinc-500 transition-all" />
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
