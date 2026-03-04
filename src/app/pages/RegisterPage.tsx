import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";

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
    <div className="h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center justify-center px-8 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      <main className="w-full max-w-[340px] flex flex-col items-center space-y-12">
        {/* Branding Centrado - Jerarquía 1 */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)]">
            <span className="text-black text-3xl font-black italic">K</span>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Únete_</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Crea tu cuenta de ingeniería</p>
          </div>
        </div>

        {/* Formulario Estructurado - Jerarquía 2 */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-3">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
                <User size={18} />
              </div>
              <input 
                required
                type="text"
                placeholder="NOMBRE_COMPLETO_"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-[22px] py-5 pl-14 pr-6 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
                <Mail size={18} />
              </div>
              <input 
                required
                type="email"
                placeholder="EMAIL_"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-[22px] py-5 pl-14 pr-6 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
                <Lock size={18} />
              </div>
              <input 
                required
                type="password"
                placeholder="CONTRASEÑA_"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-[22px] py-5 pl-14 pr-6 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all placeholder:text-zinc-700"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-white text-black h-20 rounded-[32px] font-black uppercase italic tracking-tighter text-xl flex items-center justify-center gap-3 active:scale-[0.97] disabled:opacity-50 transition-all shadow-xl mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <span>Registrarme_</span>
                <ArrowRight size={22} strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link - Jerarquía 3 */}
        <button 
          onClick={() => navigate("/login")}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
        >
          ¿Ya tienes cuenta? <span className="text-white border-b border-white/20 pb-0.5">Inicia Sesión_</span>
        </button>
      </main>
    </div>
  );
}
