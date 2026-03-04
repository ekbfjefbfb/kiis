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
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center justify-center py-10">
      <main className="mobile-container flex-1 justify-center space-y-12">
        {/* Branding Centrado - Apple Style */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-20 h-20 bg-white rounded-[26px] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.18)]">
            <span className="text-black text-3xl font-black italic">K</span>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-[34px] font-black uppercase italic tracking-tighter text-white">Hola_</h1>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] italic">Acceso_a_Terminal_</p>
          </div>
        </div>

        {/* Formulario Estructurado y Centrado */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-3 mb-8">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-white" size={18} strokeWidth={2.5} />
              <input
                type="email"
                placeholder="MAIL_"
                className="w-full bg-[#121212] border-2 border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all font-bold tracking-tight text-sm"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-white" size={18} strokeWidth={2.5} />
              <input
                type="password"
                placeholder="CONTRASEÑA_"
                className="w-full bg-[#121212] border-2 border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all font-bold tracking-tight text-sm"
                required
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="btn-massive bg-white text-black shadow-xl mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <span className="font-black tracking-tight">ENTRAR_</span>
                <ArrowRight size={20} strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <button 
          onClick={() => navigate("/register")}
          className="w-full text-center py-4 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 active:text-white transition-colors"
        >
          ¿No tienes cuenta? <span className="text-white border-b-2 border-white/20 pb-1">Regístrate_</span>
        </button>
      </main>
    </div>
  );
}
