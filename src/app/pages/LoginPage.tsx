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
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black text-xl font-black">K</span>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-white uppercase tracking-widest">Acceso</h1>
            </div>
          </div>

        {/* Formulario Simple */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-2 mb-6">
            <input
              type="email"
              placeholder="EMAIL"
              className="w-full bg-[#09090b] border border-zinc-900 rounded py-2.5 px-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-zinc-700 transition-all font-bold text-xs tracking-widest"
              required
            />
            <input
              type="password"
              placeholder="PASSWORD"
              className="w-full bg-[#09090b] border border-zinc-900 rounded py-2.5 px-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-zinc-700 transition-all font-bold text-xs tracking-widest"
              required
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="btn-primary mt-4"
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
