import { ArrowLeft, User, Settings, Shield, Bell, LogOut, ChevronRight, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isInstallable, installPWA } = usePWAInstall();

  const menuItems = [
    { icon: <Settings size={18} />, label: "Ajustes_", desc: "Configuración general" },
    { icon: <Bell size={18} />, label: "Notificaciones_", desc: "Alertas y recordatorios" },
    { icon: <Shield size={18} />, label: "Privacidad_", desc: "Datos y seguridad" },
  ];

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans selection:bg-white/30 overflow-hidden flex flex-col relative">
      <header className="px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] pt-[max(env(safe-area-inset-top,2rem),3rem)] pb-6 flex items-end border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-transform mr-4">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-[0.3em] mb-1.5 text-left">Usuario_</p>
          <h1 className="text-xl font-bold uppercase italic tracking-tighter leading-none text-white">Mi Perfil</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-[env(safe-area-inset-left,1.5rem)] pr-[env(safe-area-inset-right,1.5rem)] py-8 max-w-2xl mx-auto w-full space-y-10 pb-32">
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-[40px] bg-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl">
            <User size={40} className="text-zinc-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase italic tracking-tighter text-white">Carlos_</h2>
            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-[0.3em] mt-1">Estudiante Premium</p>
          </div>
        </section>

        {isInstallable && (
          <section className="space-y-3">
            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] ml-2">Aplicación_</p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={installPWA}
              className="w-full bg-white text-black rounded-[28px] p-5 flex items-center justify-between transition-all active:bg-zinc-200 shadow-xl"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center">
                  <Download size={18} />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold uppercase italic tracking-tight leading-none mb-1">Descargar App_</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Instalar en tu teléfono</p>
                </div>
              </div>
              <ChevronRight size={18} />
            </motion.button>
          </section>
        )}

        <section className="space-y-3">
          <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] ml-2">Preferencias_</p>
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-zinc-900/40 border border-white/5 rounded-[28px] p-5 flex items-center justify-between transition-all active:bg-zinc-800"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600">
                  {item.icon}
                </div>
                <div className="text-left">
                  <p className="text-base font-bold uppercase italic tracking-tight text-white leading-none mb-1">{item.label}</p>
                  <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-zinc-800" />
            </motion.button>
          ))}
        </section>

        <button onClick={() => navigate("/login")} className="w-full h-16 rounded-[32px] border border-red-500/10 bg-red-500/5 text-red-500 flex items-center justify-center gap-3 active:scale-95 transition-transform">
          <LogOut size={18} />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Cerrar Sesión_</span>
        </button>
      </main>
    </div>
  );
}
