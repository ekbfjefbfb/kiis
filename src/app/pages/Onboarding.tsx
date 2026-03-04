import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Radio, Brain, Zap, Download } from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

const STEPS = [
  {
    icon: <Radio size={48} />,
    title: "CAPTURA_TERMINAL_",
    description: "Transcripción de ingeniería en tiempo real. Cero fricción, máximo impacto.",
  },
  {
    icon: <Brain size={48} />,
    title: "SÍNTESIS_NATIVA_",
    description: "Resúmenes automáticos y tareas extraídas con precisión IA absoluta.",
  },
  {
    icon: <Zap size={48} />,
    title: "CONTROL_TOTAL_",
    description: "Tu cerebro académico sincronizado en una terminal minimalista.",
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { installPWA } = usePWAInstall();

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-black flex flex-col items-center py-10 relative">
      <div className="mobile-container flex flex-col flex-1">
        <header className="flex justify-end pt-2 pb-4 shrink-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={installPWA}
            className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest transition-all"
          >
            Instalar_
          </motion.button>
        </header>

        <main className="flex-1 flex flex-col justify-center space-y-10 pb-6">
          <div className="text-center space-y-6">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800/50 mx-auto flex items-center justify-center relative mb-2">
              <div className="relative text-zinc-600 scale-75">{STEPS[currentStep].icon}</div>
            </div>
            
            <div className="space-y-2 px-4">
              <h1 className="text-lg font-bold tracking-tight text-white uppercase">
                {STEPS[currentStep].title.replace('_', '').replace('Captura', 'Sesión').replace('Resúmenes', 'Síntesis').replace('Todo', 'Estado')}
              </h1>
              <p className="text-zinc-600 text-xs font-medium max-w-[240px] mx-auto leading-relaxed">
                {STEPS[currentStep].description}
              </p>
            </div>
          </div>
        </main>

        <footer className="space-y-6 pb-6 shrink-0">
          <div className="flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-6 bg-zinc-400' : 'w-1.5 bg-zinc-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 py-3 rounded-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-all font-bold text-xs uppercase tracking-widest"
          >
            <span>{currentStep === STEPS.length - 1 ? "Entrar" : "Siguiente"}</span>
            <ArrowRight size={14} />
          </button>
        </footer>
      </div>
    </div>
  );
}
