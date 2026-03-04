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

        <main className="flex-1 flex flex-col justify-center space-y-20 py-12">
          <div className="text-center space-y-12">
            <div className="w-32 h-32 rounded-[48px] bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center shadow-2xl relative mb-4">
              <div className="absolute inset-0 bg-white/5 rounded-[48px] blur-3xl animate-pulse" />
              <div className="relative text-white scale-110">{STEPS[currentStep].icon}</div>
            </div>
            
            <div className="space-y-6 px-4">
              <h1 className="text-4xl font-black tracking-tight leading-tight uppercase text-white">
                {STEPS[currentStep].title}
              </h1>
              <p className="text-zinc-400 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
                {STEPS[currentStep].description}
              </p>
            </div>
          </div>
        </main>

        <footer className="space-y-8 pb-6 shrink-0">
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
            className="btn-massive bg-white text-black shadow-[0_20px_60px_rgba(255,255,255,0.1)]"
          >
            <span>{currentStep === STEPS.length - 1 ? "Empezar_" : "Siguiente_"}</span>
            <ArrowRight size={20} strokeWidth={3} />
          </button>
        </footer>
      </div>
    </div>
  );
}
