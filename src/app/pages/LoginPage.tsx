
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, Mail, BookOpen } from "lucide-react";
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
    
    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña");
      setLoading(false);
      return;
    }

    try {
      const success = await authService.login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Correo o contraseña incorrectos");
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 bg-background text-foreground relative overflow-hidden font-sans transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm text-center relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-11 h-11 bg-foreground rounded-xl flex items-center justify-center mb-4">
            <BookOpen size={22} className="text-background" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Bienvenido</h1>
          <p className="text-xs mt-1.5 text-muted-foreground">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full bg-card border border-border rounded-2xl p-5 relative">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-5 bg-destructive/10 text-destructive text-[13px] p-3 rounded-xl border border-destructive/20 font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pl-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
                  placeholder="tu@correo.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pl-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
                  placeholder="Tu contraseña"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-foreground text-background rounded-xl py-3 font-semibold text-sm mt-1 disabled:opacity-50 hover:bg-foreground/90 active:scale-[0.98] transition-all flex items-center justify-center h-11"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-muted-foreground">¿No tienes una cuenta? </span>
            <Link
              to="/register"
              className="font-semibold text-foreground hover:underline underline-offset-4 transition-all"
            >
              Registrarme
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
