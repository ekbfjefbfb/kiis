import { useNavigate } from "react-router";
import { 
  ArrowLeft, User, Mail, Shield, LogOut, 
  Download, ChevronRight, Zap, Settings, Bell
} from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { installPWA } = usePWAInstall();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center overflow-x-hidden" style={{ backgroundColor: '#000000' }}>
      <header className="w-full bg-black/80 backdrop-blur-xl z-30 pt-10 pb-6 shrink-0 border-b border-white/5">
        <div className="mobile-container flex-row justify-between items-center">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
          <h1 className="text-sm font-bold uppercase tracking-widest text-zinc-200">Perfil</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="mobile-container flex-1 py-8 space-y-10">
        {/* User Branding */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg relative group">
            <User size={40} className="text-zinc-400" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-tight">Tu Perfil</h2>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-1">Estudiante</p>
          </div>
        </div>

        {/* Action Groups */}
        <div className="space-y-8">
          {/* PWA Install - Simple */}
          <section>
            <button
              onClick={installPWA}
              className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Download size={18} className="text-zinc-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-zinc-200">Instalar App</h3>
                  <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">Acceso directo</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-700" />
            </button>
          </section>

          {/* Account Settings */}
          <section className="space-y-3">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] px-2">Configuración</p>
            
            <div className="space-y-2">
              {[
                { icon: <Mail size={16} />, label: "Email", value: "Verificado" },
                { icon: <Shield size={16} />, label: "Cuenta", value: "Activa" },
                { icon: <Bell size={16} />, label: "Notificaciones", value: "Activas" }
              ].map((item, i) => (
                <button
                  key={i}
                  className="w-full bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl flex items-center justify-between group active:bg-zinc-800/40 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-zinc-400 transition-colors">
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                      <h4 className="text-sm font-bold text-zinc-300">{item.value}</h4>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-zinc-800" />
                </button>
              ))}
            </div>
          </section>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-full py-4 rounded-xl border border-zinc-800/50 text-zinc-600 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:bg-red-500/5 active:text-red-500 transition-all"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </main>
    </div>
  );
}
