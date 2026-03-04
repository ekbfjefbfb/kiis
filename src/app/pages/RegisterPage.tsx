import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center justify-center py-12">
      <main className="mobile-container flex-1 justify-center space-y-16">
        {/* Branding Centrado - Apple Style */}
        <div className="flex flex-col items-center space-y-10">
          <div className="w-28 h-28 bg-white rounded-[40px] flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.2)]">
            <span className="text-black text-5xl font-black italic">K</span>
          </div>
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Únete_</h1>
            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em]">Terminal_de_Ingeniería_</p>
          </div>
        </div>

        {/* Formulario Estructurado y Centrado */}
        <form onSubmit={handleSubmit} className="w-full space-y-8">
          <div className="space-y-5 mb-12">
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-white" size={20} strokeWidth={2.5} />
              <input
                type="text"
                placeholder="NOMBRE_COMPLETO_"
                className="w-full bg-[#121212] border-2 border-zinc-800 rounded-3xl py-6 pl-14 pr-6 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all font-bold tracking-tight text-lg"
                required
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-white" size={20} strokeWidth={2.5} />
              <input
                type="email"
                placeholder="MAIL_"
                className="w-full bg-[#121212] border-2 border-zinc-800 rounded-3xl py-6 pl-14 pr-6 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all font-bold tracking-tight text-lg"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-white" size={20} strokeWidth={2.5} />
              <input
                type="password"
                placeholder="CONTRASEÑA_"
                className="w-full bg-[#121212] border-2 border-zinc-800 rounded-3xl py-6 pl-14 pr-6 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all font-bold tracking-tight text-lg"
                required
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="btn-massive w-full bg-white text-black shadow-2xl mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <span className="text-xl italic font-black tracking-tighter">REGISTRARME_</span>
                <ArrowRight size={28} strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <button 
          onClick={() => navigate("/login")}
          className="w-full text-center py-6 text-[12px] font-black uppercase tracking-[0.4em] text-zinc-500 active:text-white transition-colors"
        >
          ¿Ya tienes cuenta? <span className="text-white border-b-2 border-white/20 pb-1">Inicia Sesión_</span>
        </button>
      </main>
    </div>
  );
}
