
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
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 bg-surface relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" style={{ background: "var(--primary-light)" }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl -ml-20 -mb-20 opacity-40" style={{ background: "var(--primary-muted)" }} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm text-center relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-5 relative group overflow-hidden">
            <BookOpen size={32} className="text-white" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-themed">Bienvenido a Notdeer</h1>
          <p className="text-sm mt-2 max-w-[280px] text-themed-secondary">
            Inicia sesión para acceder a tus notas y clases.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full card-premium rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-5 bg-red-50 text-red-600 text-[13px] p-3 rounded-2xl border border-red-100/50 font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-input-themed border border-themed rounded-2xl py-3.5 pl-11 pr-4 text-[15px] focus:outline-none focus:bg-surface transition-all text-themed placeholder:text-themed-tertiary"
                  placeholder="tu@correo.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-input-themed border border-themed rounded-2xl py-3.5 pl-11 pr-4 text-[15px] focus:outline-none focus:bg-surface transition-all text-themed placeholder:text-themed-tertiary"
                  placeholder="Tu contraseña"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-semibold text-[15px] mt-2 shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none hover:bg-indigo-700 active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-themed-secondary">¿No tienes una cuenta? </span>
            <Link
              to="/register"
              className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline underline-offset-4 transition-all"
            >
              Registrarme
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
