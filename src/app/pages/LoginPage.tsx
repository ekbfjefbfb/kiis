import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2, ArrowRight, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { authService } from "../../services/auth.service";
import { usePWAInstall } from "../../hooks/usePWAInstall";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isInstallable, installPWA, isStandalone } = usePWAInstall();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const success = await authService.login(email, password);
      if (success) {
        navigate("/", { replace: true });
      } else {
        setError("Credenciales incorrectas");
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] overflow-hidden">
      <main className="flex-1 flex flex-col px-10 pt-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-white/5 blur-[100px] rounded-full -z-10" />

        <header className="mb-12">
          <div className="w-12 h-12 bg-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl">
            <span className="text-black text-xl font-extrabold tracking-tighter">K</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter leading-none mb-3 italic text-white">Acceso.</h1>
          <p className="text-zinc-500 text-base font-medium tracking-tight">Tu inteligencia de agenda te espera.</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="group relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className={`w-full h-14 bg-zinc-900/40 backdrop-blur-xl border rounded-[2rem] px-6 text-base font-semibold placeholder:text-zinc-800 outline-none transition-all duration-500 ${
                  email && !validateEmail(email) ? 'border-red-500/50' : email ? 'border-green-500/30' : 'border-white/5'
                } focus:bg-zinc-900/60`}
                required
              />
              {email && validateEmail(email) && (
                <CheckCircle2 size={18} className="absolute right-6 top-4 text-green-500/50 animate-in fade-in zoom-in" />
              )}
            </div>

            <div className="group relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña (mínimo 8 caracteres)"
                className={`w-full h-14 bg-zinc-900/40 backdrop-blur-xl border rounded-[2rem] px-6 text-base font-semibold placeholder:text-zinc-800 outline-none transition-all duration-500 ${
                  password && password.length < 8 ? 'border-amber-500/50' : password ? 'border-green-500/30' : 'border-white/5'
                } focus:bg-zinc-900/60`}
                required
              />
              {password && password.length < 8 && (
                <p className="px-6 mt-2 text-amber-500/70 text-xs font-semibold">Mínimo 8 caracteres requeridos</p>
              )}
            </div>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-red-500 text-sm font-bold tracking-tight">{error}</p>
            </div>
          )}

          <button 
            disabled={loading}
            type="submit"
            className="w-full h-14 bg-white text-black rounded-[2rem] font-black text-lg mt-4 active:scale-[0.96] transition-all duration-500 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center group overflow-hidden relative"
          >
            {loading ? (
              <Loader2 className="animate-spin relative z-10" size={24} strokeWidth={2.5} />
            ) : (
              <div className="flex items-center gap-3 relative z-10">
                <span>ENTRAR</span>
                <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
            <div className="absolute inset-0 bg-zinc-100 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </form>
      </main>

      <footer className="p-6 flex flex-col items-center gap-4 pb-8">
        {isInstallable && !isStandalone && (
          <button 
            onClick={installPWA}
            className="w-full max-w-[280px] h-12 bg-zinc-900/50 border border-white/10 rounded-[2rem] text-zinc-300 font-bold text-sm tracking-tight active:scale-95 transition-all duration-300 hover:bg-zinc-800/50 flex items-center justify-center gap-3"
          >
            <Download size={18} strokeWidth={2} />
            <span>Instalar app</span>
          </button>
        )}
        <button 
          onClick={() => navigate("/register")}
          className="text-zinc-400 text-sm font-bold uppercase tracking-[0.2em] active:text-white transition-colors duration-300"
        >
          Crear cuenta nueva
        </button>
        <p className="text-[10px] text-zinc-700 font-bold tracking-[0.5em] uppercase">KIIS v2.0</p>
      </footer>
    </div>
  );
}
