import { useState, useEffect } from "react";
import { ArrowLeft, User, Moon, Sun, LogOut, ChevronRight, Settings, Mail, Phone, Shield, Bell, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#000000" : "#ffffff";
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-[100dvh] w-full transition-colors duration-500 ${isDarkMode ? 'bg-[#000000] text-white' : 'bg-white text-black'} font-sans selection:bg-zinc-500/30 overflow-x-hidden flex flex-col`}>
      {/* Header Adaptativo - Safe Area Aware */}
      <header className={`px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex justify-between items-center border-b ${isDarkMode ? 'border-white/5 bg-[#000000]/80' : 'border-black/5 bg-white/80'} backdrop-blur-xl sticky top-0 z-20`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`w-11 h-11 rounded-full ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-zinc-100 border-black/5'} border flex items-center justify-center active:scale-90 transition-transform`}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">Perfil</h1>
        </div>
        <button className={`w-11 h-11 rounded-full ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-zinc-100 border-black/5'} border flex items-center justify-center active:scale-90 transition-transform`}>
          <Settings size={20} className="opacity-60" />
        </button>
      </header>

      {/* Main Content - Flex Grow para usar espacio */}
      <main className="flex-1 px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] py-8 space-y-10 max-w-2xl mx-auto w-full">
        
        {/* Identidad - Jerarquía Inteligente */}
        <section className="flex flex-col items-center text-center space-y-5 py-4">
          <div className={`w-28 h-24 rounded-[36px] ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'} flex items-center justify-center border ${isDarkMode ? 'border-white/10' : 'border-black/10'} shadow-2xl`}>
            <User size={48} className={isDarkMode ? 'text-white/20' : 'text-black/20'} />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black uppercase italic tracking-tight">Alberto</h2>
            <p className={`text-[11px] font-bold uppercase tracking-[0.25em] ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Usuario Maestro</p>
          </div>
        </section>

        {/* Información Estática - Brutalmente Bien Estructurada */}
        <section className="space-y-3">
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ml-2 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Datos de la cuenta</p>
          
          <div className={`w-full ${isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-zinc-50 border-black/5'} border rounded-[24px] p-5 flex items-center gap-5`}>
            <div className={`w-11 h-11 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} flex items-center justify-center shadow-sm shrink-0`}>
              <Mail size={20} className={isDarkMode ? 'text-white/40' : 'text-black/40'} />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Email</p>
              <p className="text-[15px] font-bold tracking-tight truncate">alberto@kiis.ai</p>
            </div>
          </div>

          <div className={`w-full ${isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-zinc-50 border-black/5'} border rounded-[24px] p-5 flex items-center gap-5`}>
            <div className={`w-11 h-11 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} flex items-center justify-center shadow-sm shrink-0`}>
              <Phone size={20} className={isDarkMode ? 'text-white/40' : 'text-black/40'} />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Teléfono</p>
              <p className="text-[15px] font-bold tracking-tight">+52 55 1234 5678</p>
            </div>
          </div>
        </section>

        {/* Ajustes y Privacidad */}
        <section className="space-y-3">
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ml-2 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Seguridad & Preferencias</p>
          
          <div className={`w-full ${isDarkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-black/5'} border rounded-[24px] p-5 flex items-center justify-between shadow-sm`}>
            <div className="flex items-center gap-5">
              <div className={`w-11 h-11 rounded-2xl ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} flex items-center justify-center shrink-0`}>
                <Shield size={20} className="text-emerald-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase italic leading-none">Privacidad Activa</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Encriptación AES-256</p>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
          </div>

          <button 
            onClick={toggleTheme}
            className={`w-full ${isDarkMode ? 'bg-zinc-900/80 border-white/5' : 'bg-zinc-100/50 border-black/5'} border rounded-[24px] p-5 flex items-center justify-between active:scale-[0.98] transition-all`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-11 h-11 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center shrink-0`}>
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase italic leading-none">Modo {isDarkMode ? 'Oscuro' : 'Claro'}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>{isDarkMode ? 'Negro Puro' : 'Blanco Puro'}</p>
              </div>
            </div>
            <div className={`w-14 h-7 rounded-full relative transition-colors p-1.5 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
              <motion.div 
                animate={{ x: isDarkMode ? 28 : 0 }}
                className={`w-4 h-4 rounded-full shadow-md ${isDarkMode ? 'bg-white' : 'bg-zinc-900'}`}
              />
            </div>
          </button>

          <button className={`w-full ${isDarkMode ? 'bg-zinc-900/80 border-white/5' : 'bg-zinc-100/50 border-black/5'} border rounded-[24px] p-5 flex items-center justify-between active:scale-[0.98] transition-all mt-6`}>
            <div className="flex items-center gap-5 text-left">
              <div className={`w-11 h-11 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center shrink-0`}>
                <LogOut size={20} className="text-zinc-500" />
              </div>
              <div>
                <p className="text-sm font-black uppercase italic leading-none">Cerrar Sesión</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Desconectar</p>
              </div>
            </div>
            <ChevronRight size={18} className="opacity-10" />
          </button>
        </section>

        <footer className="pt-8 pb-[max(env(safe-area-inset-bottom,2rem),2rem)] text-center">
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-zinc-800' : 'text-zinc-200'}`}>Versión 1.2.0 LIMON</p>
        </footer>
      </main>
    </div>
  );
}
