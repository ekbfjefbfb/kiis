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

  const profileData = [
    { icon: <Mail size={18} />, label: "Email", value: "alberto@kiis.ai", actionable: true },
    { icon: <Phone size={18} />, label: "Teléfono", value: "+52 55 1234 5678", actionable: true },
  ];

  const settingsOptions = [
    { icon: <Bell size={18} />, label: "Notificaciones", sub: "Alertas de clases" },
    { icon: <Shield size={18} />, label: "Privacidad", sub: "Datos y seguridad" },
    { icon: <HelpCircle size={18} />, label: "Soporte", sub: "Ayuda técnica" },
  ];

  return (
    <div className={`min-h-[100dvh] transition-colors duration-500 ${isDarkMode ? 'bg-[#000000] text-white' : 'bg-white text-black'} font-sans selection:bg-zinc-500/30 overflow-x-hidden flex flex-col`}>
      {/* Header Minimalista */}
      <div className={`px-6 pt-12 pb-6 flex justify-between items-center border-b ${isDarkMode ? 'border-white/5 bg-[#000000]/80' : 'border-black/5 bg-white/80'} backdrop-blur-xl sticky top-0 z-20`}>
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

      <div className="px-6 py-10 space-y-10 flex-1">
        {/* User Identity - Seriedad Extrema */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className={`w-24 h-24 rounded-[32px] ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'} flex items-center justify-center border ${isDarkMode ? 'border-white/10' : 'border-black/10'} shadow-2xl`}>
            <User size={40} className={isDarkMode ? 'text-white/20' : 'text-black/20'} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Alberto</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Usuario Maestro</p>
          </div>
        </section>

        {/* Datos Relevantes - Estructura Limpia */}
        <section className="space-y-2">
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-4 ml-2 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Información de contacto</p>
          {profileData.map((item, i) => (
            <motion.div 
              key={i}
              whileTap={{ scale: 0.98 }}
              className={`w-full ${isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-zinc-50 border-black/5'} border rounded-[20px] p-4 flex items-center justify-between transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} flex items-center justify-center shadow-sm`}>
                  <span className={isDarkMode ? 'text-white/40' : 'text-black/40'}>{item.icon}</span>
                </div>
                <div className="text-left">
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>{item.label}</p>
                  <p className="text-sm font-bold tracking-tight">{item.value}</p>
                </div>
              </div>
              {item.actionable && <ChevronRight size={14} className="opacity-20" />}
            </motion.div>
          ))}
        </section>

        {/* Preferencias y Sistema */}
        <section className="space-y-3">
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-4 ml-2 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Ajustes del sistema</p>
          
          <button 
            onClick={toggleTheme}
            className={`w-full ${isDarkMode ? 'bg-zinc-900/80 border-white/5' : 'bg-zinc-100/50 border-black/5'} border rounded-[24px] p-5 flex items-center justify-between active:scale-[0.98] transition-all`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center`}>
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase italic leading-none">Modo {isDarkMode ? 'Oscuro' : 'Claro'}</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>{isDarkMode ? 'Negro Puro' : 'Blanco Puro'}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors p-1 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
              <motion.div 
                animate={{ x: isDarkMode ? 24 : 0 }}
                className={`w-4 h-4 rounded-full shadow-sm ${isDarkMode ? 'bg-white' : 'bg-zinc-900'}`}
              />
            </div>
          </button>

          {settingsOptions.map((opt, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              className={`w-full ${isDarkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-black/5'} border rounded-[20px] p-4 flex items-center justify-between transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} flex items-center justify-center opacity-60`}>
                  {opt.icon}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold tracking-tight">{opt.label}</p>
                  <p className={`text-[9px] font-medium uppercase tracking-widest ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>{opt.sub}</p>
                </div>
              </div>
              <ChevronRight size={14} className="opacity-10" />
            </motion.button>
          ))}

          <button className={`w-full ${isDarkMode ? 'bg-zinc-900/80 border-white/5' : 'bg-zinc-100/50 border-black/5'} border rounded-[24px] p-5 flex items-center justify-between active:scale-[0.98] transition-all mt-6`}>
            <div className="flex items-center gap-4 text-left">
              <div className={`w-10 h-10 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center`}>
                <LogOut size={18} className="text-zinc-500" />
              </div>
              <div>
                <p className="text-sm font-black uppercase italic leading-none">Cerrar Sesión</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Desconectar dispositivo</p>
              </div>
            </div>
            <ChevronRight size={16} className="opacity-10" />
          </button>
        </section>

        <footer className="pt-10 pb-10 text-center">
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-zinc-800' : 'text-zinc-200'}`}>Versión 1.2.0 LIMON</p>
        </footer>
      </div>
    </div>
  );
}
