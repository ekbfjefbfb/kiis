import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, Mail, User, ArrowRight, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";
import { useDarkMode } from "../../hooks/useDarkMode";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="h-[100dvh] w-full bg-background text-foreground font-sans overflow-hidden flex flex-col relative selection:bg-primary/20 transition-colors duration-300">
      <button 
        onClick={toggleDarkMode}
        className="absolute top-[env(safe-area-inset-top,2rem)] right-6 z-50 w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform"
      >
        {isDark ? <Sun size={18} className="text-muted-foreground" /> : <Moon size={18} className="text-muted-foreground" />}
      </button>

      <main className="flex-1 flex flex-col items-center justify-center px-8 max-w-md mx-auto w-full space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-primary rounded-[24px] mx-auto flex items-center justify-center mb-8 shadow-2xl">
            <span className="text-3xl font-black text-primary-foreground italic leading-none">K</span>
          </div>
          <h1 className="text-4xl font-bold uppercase italic tracking-tighter leading-none">Únete_</h1>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.4em]">Crea tu cuenta de ingeniería</p>
        </motion.div>

        <form onSubmit={handleRegister} className="w-full space-y-4">
          <div className="space-y-2">
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
              <input
                type="text"
                placeholder="NOMBRE_COMPLETO_"
                className="w-full bg-secondary/40 border border-border rounded-[28px] pl-14 pr-6 py-5 text-sm font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/20 transition-all italic"
                required
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
              <input
                type="email"
                placeholder="EMAIL_"
                className="w-full bg-secondary/40 border border-border rounded-[28px] pl-14 pr-6 py-5 text-sm font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/20 transition-all italic"
                required
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
              <input
                type="password"
                placeholder="CONTRASEÑA_"
                className="w-full bg-secondary/40 border border-border rounded-[28px] pl-14 pr-6 py-5 text-sm font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/20 transition-all italic"
                required
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-primary text-primary-foreground rounded-[32px] font-bold uppercase italic tracking-tighter text-lg shadow-xl flex items-center justify-center gap-3 transition-all mt-8"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <span>Registrarme_</span>
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <div className="text-center pt-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
            ¿Ya tienes cuenta? <Link to="/login" className="text-foreground font-bold hover:underline underline-offset-4">Inicia Sesión_</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
