import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2, ArrowRight } from "lucide-react";
import { authService } from "../../services/auth.service";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Usamos el flujo OAuth para registro también (Passwordless/OLED Style)
      const success = await authService.loginOAuth('google', btoa(email), name);
      if (!success) {
        setError("Error al crear la cuenta");
        return;
      }
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Error de registro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      <main className="flex-1 flex flex-col px-10 pt-24 overflow-y-auto scrollbar-hide">
        <header className="mb-16">
          <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
            <span className="text-black text-2xl font-extrabold tracking-tighter">K</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter leading-none mb-4">Empezar.</h1>
          <p className="text-zinc-500 text-lg font-medium tracking-tight">Crea tu identidad en KIIS OS.</p>
        </header>

        <form onSubmit={handleRegister} className="space-y-4 pb-10">
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full h-20 bg-zinc-900/50 rounded-[2rem] px-8 text-lg font-semibold placeholder:text-zinc-700 border border-white/5 outline-none focus:border-white/20 focus:bg-zinc-900 transition-all duration-500"
              required
            />
            
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="w-full h-20 bg-zinc-900/50 rounded-[2rem] px-8 text-lg font-semibold placeholder:text-zinc-700 border border-white/5 outline-none focus:border-white/20 focus:bg-zinc-900 transition-all duration-500"
              required
            />
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
              <p className="text-red-500 text-sm font-bold tracking-tight text-center">{error}</p>
            </div>
          )}

          <button 
            disabled={isLoading}
            type="submit"
            className="w-full h-20 bg-white text-black rounded-[2.5rem] font-bold text-xl mt-6 active:scale-[0.97] transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-[0_20px_40px_rgba(255,255,255,0.1)] group"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={28} strokeWidth={2.5} />
            ) : (
              <div className="flex items-center gap-3">
                <span>Crear Cuenta</span>
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </button>
        </form>
      </main>

      <footer className="p-10 flex flex-col items-center gap-4 bg-black/80 backdrop-blur-lg border-t border-white/5">
        <button 
          onClick={() => navigate("/login")}
          className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] active:text-white transition-colors duration-300"
        >
          Ya tengo cuenta
        </button>
      </footer>
    </div>
  );
}
