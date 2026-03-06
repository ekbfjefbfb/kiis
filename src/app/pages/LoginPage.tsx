import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2, ArrowRight } from "lucide-react";
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // Intentamos login con el flujo OAuth usando el email como id_token para flujo passwordless
      const success = await authService.loginOAuth('google', btoa(email), email.split('@')[0]);
      if (success) {
        navigate("/", { replace: true });
      } else {
        setError("Error de autenticación");
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      <main className="flex-1 flex flex-col px-10 pt-32">
        <header className="mb-20">
          <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
            <span className="text-black text-2xl font-extrabold tracking-tighter">K</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter leading-none mb-4">Bienvenido.</h1>
          <p className="text-zinc-500 text-lg font-medium tracking-tight">Tu inteligencia académica te espera.</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full h-20 bg-zinc-900/50 rounded-[2rem] px-8 text-xl font-semibold placeholder:text-zinc-700 border border-white/5 outline-none focus:border-white/20 focus:bg-zinc-900 transition-all duration-500"
                required
              />
            </div>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
              <p className="text-red-500 text-sm font-bold tracking-tight text-center">{error}</p>
            </div>
          )}

          <button 
            disabled={loading}
            type="submit"
            className="w-full h-20 bg-white text-black rounded-[2rem] font-bold text-xl mt-10 active:scale-[0.97] transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-[0_20px_40px_rgba(255,255,255,0.1)] group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={28} strokeWidth={2.5} />
            ) : (
              <div className="flex items-center gap-3">
                <span>Continuar</span>
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </button>
        </form>
      </main>

      <footer className="p-12 flex flex-col items-center gap-6">
        <button 
          onClick={() => navigate("/register")}
          className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] active:text-white transition-colors duration-300"
        >
          Crear cuenta nueva
        </button>
        <p className="text-[10px] text-zinc-800 font-bold tracking-[0.3em] uppercase">KIIS OS V2.0</p>
      </footer>
    </div>
  );
}
