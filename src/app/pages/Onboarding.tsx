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
        <header className="flex justify-end pt-3 pb-6 shrink-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={installPWA}
            className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 uppercase tracking-widest transition-all"
          >
            <Download size={12} strokeWidth={3} />
            <span>Instalar_</span>
          </motion.button>
        </header>

        <main className="flex-1 flex flex-col justify-center space-y-8 pb-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/50 mx-auto flex items-center justify-center relative mb-2">
              <div className="relative text-zinc-400 scale-75">{STEPS[currentStep].icon}</div>
            </div>
            
            <div className="space-y-2 px-4">
              <h1 className="text-xl font-bold tracking-tight text-white">
                {STEPS[currentStep].title.replace('_', '').replace('CAPTURA', 'Captura').replace('TERMINAL', 'de voz').replace('SÍNTESIS', 'Resúmenes').replace('NATIVA', 'con IA').replace('CONTROL', 'Todo').replace('TOTAL', 'organizado')}
              </h1>
              <p className="text-zinc-500 text-sm font-medium max-w-[240px] mx-auto leading-relaxed">
                {STEPS[currentStep].description}
              </p>
            </div>
          </div>
        </main>

        <footer className="space-y-8 pb-8 shrink-0">
          <div className="flex justify-center gap-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-8 bg-white' : 'w-2 bg-zinc-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-full bg-white text-black py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <span className="font-bold text-sm">
              {currentStep === STEPS.length - 1 ? "Empezar" : "Siguiente"}
            </span>
            <ArrowRight size={18} />
          </button>
        </footer>
      </div>
    </div>
  );
}
