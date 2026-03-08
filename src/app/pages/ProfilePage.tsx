import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { 
  ChevronLeft, User, Mail, Shield, LogOut, 
  Download, ChevronRight, Bell, Camera, Loader2
} from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { authService } from "../../services/auth.service";
import { apiService } from "../../services/api.service";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { installPWA, isInstallable } = usePWAInstall();
  const user = authService.getCurrentUser();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post<{ success: boolean; avatar_url: string }>(
        "/profile/me/avatar",
        formData,
        true
      );
      if (response.success && user) {
        // Actualizar el usuario localmente
        const updatedUser = { ...user, photoURL: response.avatar_url };
        localStorage.setItem("current_user", JSON.stringify(updatedUser));
        window.location.reload(); // Recarga simple para ver cambios
      }
    } catch {
      // Silently handle error
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      <header className="px-8 pt-16 pb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Ajustes</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-8 pt-4 pb-32">
        <div className="flex flex-col items-center mb-12">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 shadow-2xl overflow-hidden relative">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-zinc-400" strokeWidth={1.5} />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>
            <div className="absolute bottom-4 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-black shadow-lg">
              <Camera size={16} strokeWidth={2.5} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tighter italic">{user?.displayName || user?.name || "Usuario"}</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">{user?.email || "estudiante@kiis.ai"}</p>
        </div>

        <div className="space-y-10">
          {isInstallable && (
            <section>
              <button
                onClick={installPWA}
                className="w-full bg-white text-black p-6 rounded-[2.5rem] flex items-center justify-between active:scale-[0.98] transition-all shadow-xl"
              >
                <div className="flex items-center gap-5">
                  <Download size={20} />
                  <span className="text-lg font-bold tracking-tight">Instalar KIIS App</span>
                </div>
                <ChevronRight size={20} />
              </button>
            </section>
          )}

          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 px-2">General</h3>
            <div className="space-y-3">
              {[
                { icon: <Mail size={18} />, label: "Cuenta", value: "Verificada" },
                { icon: <Bell size={18} />, label: "Notificaciones", value: "Silencio" },
                { icon: <Shield size={18} />, label: "Privacidad", value: "Máxima" }
              ].map((item, i) => (
                <button
                  key={i}
                  className="w-full bg-zinc-900/30 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between active:bg-zinc-900/50 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="text-zinc-500">{item.icon}</div>
                    <span className="text-lg font-bold tracking-tight text-white/90">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{item.value}</span>
                </button>
              ))}
            </div>
          </section>

          <button 
            onClick={handleLogout}
            className="w-full h-20 rounded-[2.5rem] border border-white/5 text-red-500 font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:bg-red-500/5 transition-all"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </main>

      <footer className="p-12 flex flex-col items-center opacity-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em]">KIIS OS v2.0</p>
      </footer>
    </div>
  );
}
