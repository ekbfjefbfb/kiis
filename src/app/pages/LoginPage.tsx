import { useState } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
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
      <div className="flex justify-center mb-20">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
          <span className="text-black text-2xl font-bold">K</span>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleLogin} className="flex-1 space-y-4">
        {error && (
          <p className="text-red-400 text-base text-center">{error}</p>
        )}
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo"
          className="w-full h-16 bg-zinc-900 rounded-2xl px-5 text-white text-lg placeholder:text-zinc-600 border-none outline-none"
          required
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full h-16 bg-zinc-900 rounded-2xl px-5 text-white text-lg placeholder:text-zinc-600 border-none outline-none"
          required
        />

        <button 
          disabled={loading}
          type="submit"
          className="w-full h-16 bg-white text-black rounded-2xl font-semibold text-lg mt-8 active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" size={22} /> : "Entrar"}
        </button>
      </form>

      {/* Crear cuenta */}
      <button 
        onClick={() => navigate("/register")}
        className="text-zinc-500 text-lg mt-6 active:text-white transition-colors"
      >
        Crear cuenta
      </button>
    </div>
  );
}
