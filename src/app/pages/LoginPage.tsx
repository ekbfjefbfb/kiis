import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { authService } from "../../services/auth.service";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      <main className="flex-1 flex flex-col px-10 pt-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-white/5 blur-[100px] rounded-full -z-10" />

        <header className="mb-20">
          <div className="w-16 h-16 bg-white rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl">
            <span className="text-black text-2xl font-extrabold tracking-tighter">K</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter leading-none mb-4 italic text-white">Acceso.</h1>
          <p className="text-zinc-500 text-lg font-medium tracking-tight">Tu inteligencia de agenda te espera.</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="group relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className={`w-full h-20 bg-zinc-900/40 backdrop-blur-xl border rounded-[2.5rem] px-8 text-xl font-semibold placeholder:text-zinc-800 outline-none transition-all duration-500 ${
                  email && !validateEmail(email) ? 'border-red-500/50' : email ? 'border-green-500/30' : 'border-white/5'
                } focus:bg-zinc-900/60`}
                required
              />
              {email && validateEmail(email) && (
                <CheckCircle2 size={20} className="absolute right-8 top-7 text-green-500/50 animate-in fade-in zoom-in" />
              )}
            </div>

            <div className="group relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full h-20 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] px-8 text-xl font-semibold placeholder:text-zinc-800 outline-none focus:border-white/20 focus:bg-zinc-900/60 transition-all duration-500"
                required
              />
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
            className="w-full h-20 bg-white text-black rounded-[2.5rem] font-black text-xl mt-4 active:scale-[0.96] transition-all duration-500 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center group overflow-hidden relative"
          >
            {loading ? (
              <Loader2 className="animate-spin relative z-10" size={28} strokeWidth={2.5} />
            ) : (
              <div className="flex items-center gap-3 relative z-10">
                <span>ENTRAR</span>
                <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
            <div className="absolute inset-0 bg-zinc-100 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </form>
      </main>

      <footer className="p-12 flex flex-col items-center gap-6">
        <button 
          onClick={() => navigate("/register")}
          className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] active:text-white transition-colors duration-300 italic"
        >
          Crear cuenta nueva
        </button>
        <p className="text-[10px] text-zinc-900 font-bold tracking-[0.5em] uppercase">KIIS OS V2.0</p>
      </footer>
    </div>
  );
}
