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

        <main className="flex-1 flex flex-col justify-center space-y-10 pb-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-[32px] bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center shadow-xl relative mb-2">
              <div className="absolute inset-0 bg-white/5 rounded-[32px] blur-xl animate-pulse" />
              <div className="relative text-white scale-100">{STEPS[currentStep].icon}</div>
            </div>
            
            <div className="space-y-3 px-4">
              <h1 className="text-2xl font-black tracking-tight leading-tight uppercase text-white">
                {STEPS[currentStep].title}
              </h1>
              <p className="text-zinc-400 text-sm font-medium max-w-[260px] mx-auto leading-relaxed">
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
            className="btn-massive bg-white text-black shadow-lg"
          >
            <span className="text-base font-black tracking-tight">
              {currentStep === STEPS.length - 1 ? "EMPEZAR_" : "SIGUIENTE_"}
            </span>
            <ArrowRight size={20} strokeWidth={3} />
          </button>
        </footer>
      </div>
    </div>
  );
}
