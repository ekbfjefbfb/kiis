import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, Mail, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative selection:bg-white/20">
      <main className="flex-1 flex flex-col items-center justify-center px-8 max-w-md mx-auto w-full space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-white rounded-[24px] mx-auto flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            <span className="text-3xl font-black text-black italic leading-none">K</span>
          </div>
          <h1 className="text-4xl font-extrabold uppercase italic tracking-tighter leading-none">Bienvenido_</h1>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.4em]">Inicia sesión para continuar</p>
        </motion.div>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-2">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" size={18} />
              <input
                type="email"
                placeholder="EMAIL_"
                className="w-full bg-zinc-900/40 border border-white/5 rounded-[28px] pl-14 pr-6 py-5 text-sm font-bold placeholder:text-zinc-800 focus:outline-none focus:border-white/10 transition-all italic"
                required
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" size={18} />
              <input
                type="password"
                placeholder="CONTRASEÑA_"
                className="w-full bg-zinc-900/40 border border-white/5 rounded-[28px] pl-14 pr-6 py-5 text-sm font-bold placeholder:text-zinc-800 focus:outline-none focus:border-white/10 transition-all italic"
                required
              />
            </div>
          </div>

          <div className="flex justify-end px-2">
            <button type="button" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">¿Olvidaste tu contraseña?</button>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-white text-black rounded-[32px] font-extrabold uppercase italic tracking-tighter text-lg shadow-xl flex items-center justify-center gap-3 transition-all mt-8"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>Entrar_</span>
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <div className="text-center pt-4">
          <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest">
            ¿No tienes cuenta? <Link to="/register" className="text-white font-black hover:underline underline-offset-4">Regístrate_</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
