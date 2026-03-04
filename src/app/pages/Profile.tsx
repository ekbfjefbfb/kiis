import { useState } from "react";
import { ArrowLeft, User, Moon, Sun, LogOut, ChevronRight, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-[100dvh] transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} font-sans selection:bg-zinc-500/30 overflow-x-hidden`}>
      {/* Header Minimalista */}
      <div className={`px-6 pt-12 pb-6 flex justify-between items-center border-b ${isDarkMode ? 'border-white/5 bg-black/80' : 'border-black/5 bg-white/80'} backdrop-blur-xl sticky top-0 z-20`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-zinc-100 border-black/5'} border flex items-center justify-center active:scale-90 transition-transform`}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">Perfil</h1>
        </div>
        <button className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-zinc-100 border-black/5'} border flex items-center justify-center active:scale-90 transition-transform`}>
          <Settings size={18} className="opacity-60" />
        </button>
      </div>

      <div className="px-6 py-10 space-y-10">
        {/* User Info - Estructura Brutalista */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className={`w-24 h-24 rounded-[32px] ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'} flex items-center justify-center border ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
            <User size={40} className={isDarkMode ? 'text-white/20' : 'text-black/20'} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Alberto</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Estudiante</p>
          </div>
        </section>

        {/* Acciones de Cuenta */}
        <section className="space-y-3">
          <button 
            onClick={toggleTheme}
            className={`w-full ${isDarkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-100/50 border-black/5'} border rounded-[24px] p-5 flex items-center justify-between active:scale-[0.98] transition-all`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} flex items-center justify-center`}>
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase italic leading-none">Modo {isDarkMode ? 'Oscuro' : 'Claro'}</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Real {isDarkMode ? 'Negro Puro' : 'Blanco Puro'}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors p-1 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
              <motion.div 
                animate={{ x: isDarkMode ? 24 : 0 }}
                className={`w-4 h-4 rounded-full shadow-sm ${isDarkMode ? 'bg-white' : 'bg-black'}`}
              />
            </div>
          </button>

          <div className={`w-full ${isDarkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-100/50 border-black/5'} border rounded-[24px] p-5 flex items-center justify-between active:scale-[0.98] transition-all`}>
            <div className="flex items-center gap-4 text-left">
              <div className={`w-10 h-10 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} flex items-center justify-center`}>
                <LogOut size={18} className="text-red-500/70" />
              </div>
              <div>
                <p className="text-sm font-black uppercase italic leading-none">Cerrar Sesión</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Limpiar datos locales</p>
              </div>
            </div>
            <ChevronRight size={16} className={isDarkMode ? 'text-white/10' : 'text-black/10'} />
          </div>
        </section>

        {/* Footer Info */}
        <footer className="pt-10 text-center">
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/10' : 'text-black/10'}`}>Versión 1.2.0 BRUTAL</p>
        </footer>
      </div>
    </div>
  );
}
