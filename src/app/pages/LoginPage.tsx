import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2, ArrowRight } from "lucide-react";
import { authService } from "../../services/auth.service";

declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/", { replace: true });
    }

    // Inicializar Google Sign-In
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // El usuario debe proveer esto
          callback: handleGoogleResponse,
        });
      }
    };

    initGoogle();
  }, [navigate]);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    setError("");
    try {
      const success = await authService.loginOAuth('google', response.credential);
      if (success) {
        navigate("/", { replace: true });
      } else {
        setError("Error al iniciar sesión con Google");
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // En el flujo actual, redirigimos al usuario a usar Google/Apple 
    // ya que el backend requiere un id_token JWT real.
    setError("Por favor, utiliza Google o Apple para iniciar sesión de forma segura.");
  };

  const triggerGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError("Google SDK no cargado.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      <main className="flex-1 flex flex-col px-10 pt-32">
        <header className="mb-20">
          <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
            <span className="text-black text-2xl font-extrabold tracking-tighter">K</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter leading-none mb-4">Bienvenido.</h1>
          <p className="text-zinc-500 text-lg font-medium tracking-tight">Tu inteligencia académica te espera.</p>
        </header>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={triggerGoogleLogin}
              disabled={loading}
              className="h-20 bg-white text-black rounded-[2rem] flex items-center justify-center gap-4 active:scale-[0.97] transition-all shadow-xl group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
                  <span className="text-xl font-bold">Continuar con Google</span>
                </>
              )}
            </button>

            <button
              disabled={true} // Apple requiere configuración de dominio/redirect
              className="h-20 bg-zinc-900 border border-white/10 text-white rounded-[2rem] flex items-center justify-center gap-4 opacity-50 cursor-not-allowed"
            >
              <span className="text-2xl mb-1"></span>
              <span className="text-xl font-bold">Continuar con Apple</span>
            </button>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.3em]">
              <span className="bg-black px-4 text-zinc-700 font-bold">Opcional</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="w-full h-20 bg-zinc-900/30 rounded-[2rem] px-8 text-xl font-semibold placeholder:text-zinc-800 border border-white/5 outline-none focus:border-white/10 transition-all"
            />
            {error && (
              <p className="text-red-500 text-sm font-bold tracking-tight text-center px-4">{error}</p>
            )}
          </form>
        </div>
      </main>

      <footer className="p-12 flex flex-col items-center gap-6">
        <button 
          onClick={() => navigate("/register")}
          className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] active:text-white transition-colors duration-300"
        >
          Crear cuenta nueva
        </button>
        <p className="text-[10px] text-zinc-800 font-bold tracking-[0.3em] uppercase">KIIS OS V2.0</p>
      </footer>
    </div>
  );
}
