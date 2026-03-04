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
    <div className="h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: '#000000' }}>
      <main className="mobile-container flex-1 justify-center space-y-16">
        {/* Branding Centrado - Apple Style */}
        <div className="flex flex-col items-center space-y-8">
          <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)]">
            <span className="text-black text-4xl font-black italic">K</span>
          </div>
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Hola_</h1>
            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em]">Acceso_a_Terminal_</p>
          </div>
        </div>

        {/* Formulario Estructurado y Centrado */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
                <Mail size={20} />
              </div>
              <input 
                required
                type="email"
                placeholder="EMAIL_"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-[28px] py-6 pl-16 pr-8 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white focus:bg-zinc-800 transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
                <Lock size={20} />
              </div>
              <input 
                required
                type="password"
                placeholder="CONTRASEÑA_"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-[28px] py-6 pl-16 pr-8 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white focus:bg-zinc-800 transition-all placeholder:text-zinc-700"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="btn-massive w-full bg-white text-black shadow-2xl mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <span>Entrar_</span>
                <ArrowRight size={26} strokeWidth={3} />
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
