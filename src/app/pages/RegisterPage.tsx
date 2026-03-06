import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { authService } from "../../services/auth.service";

declare global {
  interface Window {
    google: any;
  }
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/", { replace: true });
    }

    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });
      }
    };
    initGoogle();
  }, [navigate]);

  const handleGoogleResponse = async (response: any) => {
    setIsLoading(true);
    setError("");
    try {
      const success = await authService.loginOAuth('google', response.credential, name);
      if (success) {
        navigate("/", { replace: true });
      } else {
        setError("Error al crear cuenta con Google");
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerGoogleRegister = () => {
    if (!name.trim()) {
      setError("Por favor, ingresa tu nombre antes de continuar.");
      return;
    }
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError("Google SDK no cargado.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      <main className="flex-1 flex flex-col px-10 pt-24 overflow-y-auto scrollbar-hide">
        <header className="mb-16">
          <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
            <span className="text-black text-2xl font-extrabold tracking-tighter">K</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter leading-none mb-4">Empezar.</h1>
          <p className="text-zinc-500 text-lg font-medium tracking-tight">Crea tu identidad en KIIS OS.</p>
        </header>

        <div className="space-y-8 pb-10">
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full h-20 bg-zinc-900/50 rounded-[2rem] px-8 text-xl font-semibold placeholder:text-zinc-700 border border-white/5 outline-none focus:border-white/20 focus:bg-zinc-900 transition-all duration-500"
              required
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={triggerGoogleRegister}
              disabled={isLoading}
              className="w-full h-20 bg-white text-black rounded-[2rem] flex items-center justify-center gap-4 active:scale-[0.97] transition-all shadow-xl group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
                  <span className="text-xl font-bold">Registrarse con Google</span>
                </>
              )}
            </button>

            <button
              disabled={true}
              className="w-full h-20 bg-zinc-900 border border-white/10 text-white rounded-[2rem] flex items-center justify-center gap-4 opacity-50 cursor-not-allowed"
            >
              <span className="text-2xl mb-1"></span>
              <span className="text-xl font-bold">Registrarse con Apple</span>
            </button>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
              <p className="text-red-500 text-sm font-bold tracking-tight text-center">{error}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="p-10 flex flex-col items-center gap-4 bg-black/80 backdrop-blur-lg border-t border-white/5">
        <button 
          onClick={() => navigate("/login")}
          className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] active:text-white transition-colors duration-300"
        >
          Ya tengo cuenta
        </button>
      </footer>
    </div>
  );
}
