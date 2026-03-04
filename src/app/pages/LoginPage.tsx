import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, Mail, BookOpen, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { authService } from "../../services/auth.service";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const success = await authService.login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Credenciales incorrectas");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-sans selection:bg-white/20 flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-10"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Bienvenido</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Tu agenda inteligente</p>
        </div>

        {/* Form */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-widest p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase"
                  placeholder="TU@EMAIL.COM"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black rounded-2xl py-4 text-lg font-black uppercase italic tracking-tight mt-4 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Entrar"}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              ¿No tienes cuenta? <Link to="/register" className="text-white hover:underline">Regístrate</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
