import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { authService } from "../../services/auth.service";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const success = await authService.login(email, password);
      if (success) {
        navigate("/", { replace: true });
      } else {
        setError("Correo o contraseña incorrectos");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col px-6 pt-24 pb-8">
      {/* Logo centrado */}
      <div className="flex justify-center mb-16">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-black text-xl font-bold">K</span>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleLogin} className="flex-1 space-y-3">
        {error && (
          <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-xl border border-red-400/20">{error}</p>
        )}
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo"
          className="w-full h-14 bg-zinc-900 rounded-xl px-5 text-white text-base placeholder:text-zinc-600 border border-white/5 outline-none focus:border-white/20 transition-all"
          required
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full h-14 bg-zinc-900 rounded-xl px-5 text-white text-base placeholder:text-zinc-600 border border-white/5 outline-none focus:border-white/20 transition-all"
          required
        />

        <button 
          disabled={loading}
          type="submit"
          className="w-full h-14 bg-white text-black rounded-xl font-bold text-base mt-6 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center shadow-md shadow-white/5"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar"}
        </button>
      </form>

      <button 
        onClick={() => navigate("/register")}
        className="text-zinc-500 text-sm mt-4 active:text-white transition-colors"
      >
        Crear cuenta
      </button>
    </div>
  );
}
