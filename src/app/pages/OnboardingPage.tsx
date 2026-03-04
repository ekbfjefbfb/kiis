import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { Mic, Zap, Radio, ChevronRight } from "lucide-react";

export default function OnboardingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const done = localStorage.getItem("onboarding_done");
    if (done === "true") navigate("/dashboard", { replace: true });
  }, [navigate]);

  const finish = () => {
    localStorage.setItem("onboarding_done", "true");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-sans px-6 pt-12 pb-10">
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
            Notdeer
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mt-2">
            2 pasos. 1 toque.
          </p>
        </motion.div>

        <div className="mt-8 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-zinc-900 border border-white/5 rounded-3xl p-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Zap size={18} className="text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black uppercase italic leading-none">Nota Rápida</p>
                <p className="text-[12px] text-white/50 mt-1 leading-snug">
                  Graba una idea. La IA la escribe y la guarda.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border border-white/5 rounded-3xl p-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 flex items-center justify-center shrink-0">
                <Radio size={18} className="text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black uppercase italic leading-none">Clase en Vivo</p>
                <p className="text-[12px] text-white/50 mt-1 leading-snug">
                  Graba la clase. La IA resume, saca puntos clave y agenda tareas.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white text-black rounded-3xl p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center">
                  <Mic size={18} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase italic leading-none">Asistente IA</p>
                  <p className="text-[11px] text-black/40 font-bold uppercase tracking-widest mt-1">
                    Chat + voz en un solo lugar
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-black/30" />
            </div>
          </motion.div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={finish}
            className="w-full h-12 rounded-2xl bg-white text-black font-black uppercase italic tracking-tight active:scale-[0.99] transition-transform"
          >
            Empezar
          </button>
          <div className="text-center text-[11px] text-white/40 font-bold uppercase tracking-widest">
            <Link to="/login" className="hover:text-white">Ya tengo cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
