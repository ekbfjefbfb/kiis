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
      <header className="w-full max-w-2xl px-8 pt-16 pb-8 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-30 shrink-0">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-zinc-400" />
        </button>
        <h1 className="text-sm font-black uppercase italic tracking-[0.2em]">Perfil_Terminal_</h1>
        <div className="w-12" />
      </header>

      <main className="w-full max-w-2xl flex-1 px-8 py-8 space-y-12">
        {/* User Branding */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-32 h-32 rounded-[48px] bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl relative group">
            <div className="absolute inset-0 bg-white/5 rounded-[48px] blur-2xl group-active:bg-white/10 transition-colors" />
            <User size={48} className="text-white relative" strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">ALBERTO_DEV</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Ingeniero de Software</p>
          </div>
        </div>

        {/* Action Groups */}
        <div className="space-y-10">
          {/* PWA Install - Premium Call */}
          <section className="space-y-4">
            <button
              onClick={installPWA}
              className="w-full bg-white text-black p-8 rounded-[40px] flex items-center justify-between group active:scale-[0.97] transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-[20px] bg-black flex items-center justify-center shadow-lg">
                  <Download size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">Descargar_App_</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mt-1.5">Instalación_Nativa_</p>
                </div>
              </div>
              <Zap size={24} fill="currentColor" className="text-black" />
            </button>
          </section>

          {/* Account Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-zinc-600 px-4">
              <Settings size={14} className="opacity-40" />
              <span className="text-[10px] font-bold uppercase tracking-[0.6em]">Configuración_</span>
            </div>
            
            <div className="space-y-3">
              {[
                { icon: <Mail size={18} />, label: "Email_Terminal_", value: "alberto@kiis.dev" },
                { icon: <Shield size={18} />, label: "Privacidad_Datos_", value: "Encriptado_AES" },
                { icon: <Bell size={18} />, label: "Notificaciones_", value: "Push_Activas" }
              ].map((item, i) => (
                <button
                  key={i}
                  className="w-full bg-zinc-900/30 border border-white/[0.03] p-6 rounded-[32px] flex items-center justify-between group active:bg-zinc-800/40 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[18px] bg-zinc-900/50 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                      <h4 className="font-bold uppercase italic tracking-tight text-zinc-200">{item.value}</h4>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-zinc-800 group-hover:text-zinc-500" />
                </button>
              ))}
            </div>
          </section>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-full p-8 rounded-[32px] border border-zinc-800/50 text-zinc-500 font-bold uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-4 active:bg-red-500/10 active:text-red-500 active:border-red-500/20 transition-all"
          >
            <LogOut size={18} />
            Cerrar_Sesión_
          </button>
        </div>
      </main>
    </div>
  );
}
