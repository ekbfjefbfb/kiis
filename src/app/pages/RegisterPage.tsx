import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

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
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center justify-center py-10">
      <main className="mobile-container flex-1 justify-center space-y-12">
        {/* Branding Radical Minimal */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center">
            <span className="text-white text-lg font-black tracking-tighter">K</span>
          </div>
          <h1 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.3em]">Registro</h1>
        </div>

        {/* Formulario Terminal Puro */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="space-y-2 mb-6">
            <input
              type="text"
              placeholder="NOMBRE"
              className="w-full bg-black border border-zinc-900 rounded py-2.5 px-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-zinc-700 transition-all font-bold text-[10px] tracking-[0.2em]"
              required
            />
            <input
              type="email"
              placeholder="EMAIL"
              className="w-full bg-black border border-zinc-900 rounded py-2.5 px-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-zinc-700 transition-all font-bold text-[10px] tracking-[0.2em]"
              required
            />
            <input
              type="password"
              placeholder="PASSWORD"
              className="w-full bg-black border border-zinc-900 rounded py-2.5 px-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-zinc-700 transition-all font-bold text-[10px] tracking-[0.2em]"
              required
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 py-3 rounded flex items-center justify-center gap-2 active:scale-[0.99] transition-all font-bold text-[10px] uppercase tracking-[0.2em]"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : (
              <>
                <span>Registrarme</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <button 
          onClick={() => navigate("/login")}
          className="w-full text-center py-2 text-[10px] font-bold text-zinc-700 active:text-white transition-colors uppercase tracking-widest"
        >
          Ya tengo cuenta
        </button>
      </main>
    </div>
  );
}
