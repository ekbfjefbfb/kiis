import { useState, useEffect } from "react";
import { ArrowLeft, User, Moon, Sun, LogOut, ChevronRight, Settings, Mail, Phone, Shield, Bell, HelpCircle, Edit2, Check, X } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    name: "Alberto",
    email: "alberto@kiis.ai",
    phone: "+52 55 1234 5678"
  });
  const [tempValue, setInputTemp] = useState("");

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#000000" : "#ffffff";
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const startEditing = (field: string, current: string) => {
    setEditingField(field);
    setInputTemp(current);
  };

  const saveEdit = (field: string) => {
    setUserData(prev => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
  };

  return (
    <div className={`min-h-[100dvh] transition-colors duration-500 ${isDarkMode ? 'bg-[#000000] text-white' : 'bg-white text-black'} font-sans selection:bg-zinc-500/30 overflow-x-hidden flex flex-col`}>
      {/* Header Compacto */}
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
        {/* Identidad Editable */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className={`w-24 h-24 rounded-[32px] ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'} flex items-center justify-center border ${isDarkMode ? 'border-white/10' : 'border-black/10'} shadow-2xl overflow-hidden`}>
              <User size={40} className={isDarkMode ? 'text-white/20' : 'text-black/20'} />
            </div>
            <button className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${isDarkMode ? 'bg-zinc-800 border-white/10 text-white' : 'bg-white border-black/10 text-black'} border flex items-center justify-center shadow-lg active:scale-90 transition-transform`}>
              <Edit2 size={12} />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight">{userData.name}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Usuario Maestro</p>
          </div>
        </section>

        {/* Datos Editables - Lógica de Botones Compacta */}
        <section className="space-y-2">
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-4 ml-2 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Información Personal</p>
          
          {/* Email */}
          <div className={`w-full ${isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-zinc-50 border-black/5'} border rounded-[20px] p-4 transition-all relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} flex items-center justify-center`}>
                  <Mail size={18} className={isDarkMode ? 'text-white/40' : 'text-black/40'} />
                </div>
                {editingField === 'email' ? (
                  <input 
                    autoFocus
                    value={tempValue}
                    onChange={(e) => setInputTemp(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-bold tracking-tight w-40"
                  />
                ) : (
                  <div className="text-left">
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Email</p>
                    <p className="text-sm font-bold tracking-tight">{userData.email}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {editingField === 'email' ? (
                  <>
                    <button onClick={() => saveEdit('email')} className="text-emerald-500 p-1"><Check size={18} /></button>
                    <button onClick={() => setEditingField(null)} className="text-red-500 p-1"><X size={18} /></button>
                  </>
                ) : (
                  <button onClick={() => startEditing('email', userData.email)} className="opacity-20 hover:opacity-100 transition-opacity p-1">
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Teléfono */}
          <div className={`w-full ${isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-zinc-50 border-black/5'} border rounded-[20px] p-4 transition-all relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} flex items-center justify-center`}>
                  <Phone size={18} className={isDarkMode ? 'text-white/40' : 'text-black/40'} />
                </div>
                {editingField === 'phone' ? (
                  <input 
                    autoFocus
                    value={tempValue}
                    onChange={(e) => setInputTemp(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-bold tracking-tight w-40"
                  />
                ) : (
                  <div className="text-left">
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Teléfono</p>
                    <p className="text-sm font-bold tracking-tight">{userData.phone}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {editingField === 'phone' ? (
                  <>
                    <button onClick={() => saveEdit('phone')} className="text-emerald-500 p-1"><Check size={18} /></button>
                    <button onClick={() => setEditingField(null)} className="text-red-500 p-1"><X size={18} /></button>
                  </>
                ) : (
                  <button onClick={() => startEditing('phone', userData.phone)} className="opacity-20 hover:opacity-100 transition-opacity p-1">
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Privacidad - Confianza Extrema */}
        <section className="space-y-3">
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-4 ml-2 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Privacidad & Seguridad</p>
          
          <div className={`w-full ${isDarkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-black/5'} border rounded-[24px] p-5 flex items-center justify-between shadow-sm`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} flex items-center justify-center`}>
                <Shield size={18} className="text-emerald-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase italic leading-none">Datos Encriptados</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Protección Grado Bancario</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <button className={`w-full ${isDarkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-black/5'} border rounded-[20px] p-4 flex items-center justify-between active:scale-[0.98] transition-all`}>
            <div className="flex items-center gap-4">
              <div className={`w-9 h-9 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} flex items-center justify-center opacity-60`}>
                <Bell size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold tracking-tight">Notificaciones</p>
                <p className={`text-[9px] font-medium uppercase tracking-widest ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Gestionar alertas</p>
              </div>
            </div>
            <ChevronRight size={14} className="opacity-10" />
          </button>
        </section>

        {/* Modo Oscuro */}
        <section className="space-y-3">
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-4 ml-2 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Sistema</p>
          <button 
            onClick={toggleTheme}
            className={`w-full ${isDarkMode ? 'bg-zinc-900/80 border-white/5' : 'bg-zinc-100 border-black/5'} border rounded-[24px] p-5 flex items-center justify-between active:scale-[0.98] transition-all shadow-sm`}
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

          <button className={`w-full ${isDarkMode ? 'bg-zinc-900/80 border-white/5' : 'bg-zinc-100 border-black/5'} border rounded-[24px] p-5 flex items-center justify-between active:scale-[0.98] transition-all mt-6`}>
            <div className="flex items-center gap-4 text-left">
              <div className={`w-10 h-10 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center`}>
                <LogOut size={18} className="text-zinc-500" />
              </div>
              <div>
                <p className="text-sm font-black uppercase italic leading-none">Cerrar Sesión</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Desconectar</p>
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
