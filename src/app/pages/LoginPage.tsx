import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center justify-center py-8">
      <main className="mobile-container flex-1 justify-center space-y-10">
        {/* Branding Simple */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-black text-2xl font-bold">K</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Hola</h1>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-1">Acceso a terminal</p>
          </div>
        </div>

        {/* Formulario Simple */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-3 mb-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-all font-medium text-sm"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-all font-medium text-sm"
                required
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-white text-black py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all font-bold text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                <span>Entrar</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <button 
          onClick={() => navigate("/register")}
          className="w-full text-center py-2 text-xs font-medium text-zinc-500 active:text-white transition-colors"
        >
          ¿No tienes cuenta? <span className="text-white border-b border-white/20 pb-0.5">Regístrate</span>
        </button>
      </main>
    </div>
  );
}
