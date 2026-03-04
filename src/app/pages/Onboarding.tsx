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
    <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-between py-16 overflow-hidden">
      <header className="mobile-container flex-row justify-end px-8 shrink-0">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={installPWA}
          className="absolute top-12 right-6 bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white uppercase tracking-widest shadow-xl z-50"
        >
          <Download size={12} strokeWidth={3} />
          <span>Instalar_</span>
        </motion.button>
      </header>

      <main className="mobile-container flex-1 justify-center space-y-16 py-8">
        <div className="text-center space-y-12">
          <div className="w-28 h-28 rounded-[42px] bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center shadow-2xl relative">
            <div className="absolute inset-0 bg-white/5 rounded-[42px] blur-3xl animate-pulse" />
            <div className="relative text-white">{STEPS[currentStep].icon}</div>
          </div>
          
          <div className="space-y-6 px-4">
            <h1 className="text-3xl font-black tracking-tighter leading-none mb-2">
              {STEPS[currentStep].title}
            </h1>
            <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase max-w-[280px] mx-auto leading-relaxed">
              {STEPS[currentStep].description}
            </p>
          </div>
        </div>
      </main>

      <footer className="mobile-container gap-12 shrink-0 pb-8">
        <div className="flex justify-center gap-3 mb-12">
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
          className="btn-massive w-full bg-white text-black shadow-[0_20px_60px_rgba(255,255,255,0.1)] border-none"
        >
          <span>{currentStep === STEPS.length - 1 ? "Empezar_" : "Siguiente_"}</span>
          <ArrowRight size={24} strokeWidth={3} />
        </button>
      </footer>
    </div>
  );
}
