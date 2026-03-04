import { useState } from "react";
import { useNavigate } from "react-router";
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
    <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-between py-16">
      <header className="mobile-container flex-row justify-end px-8">
        <button
          onClick={installPWA}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-white text-black rounded-full active:scale-95 transition-all shadow-xl"
        >
          <Download size={16} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-widest">Descargar_App_</span>
        </button>
      </header>

      <main className="mobile-container flex-1 justify-center space-y-16">
        <div className="text-center space-y-12">
          <div className="w-32 h-32 rounded-[48px] bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center shadow-2xl relative">
            <div className="absolute inset-0 bg-white/5 rounded-[48px] blur-2xl" />
            <div className="relative text-white">{STEPS[currentStep].icon}</div>
          </div>
          
          <div className="space-y-6 px-4">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-white">
              {STEPS[currentStep].title}
            </h1>
            <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-[0.3em] leading-relaxed max-w-[280px] mx-auto">
              {STEPS[currentStep].description}
            </p>
          </div>
        </div>
      </main>

      <footer className="mobile-container gap-12">
        <div className="flex justify-center gap-3">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-10 bg-white' : 'w-1.5 bg-zinc-800'}`} 
            />
          ))}
        </div>

        <button
          onClick={next}
          className="btn-massive w-full bg-white text-black shadow-2xl"
        >
          <span>{currentStep === STEPS.length - 1 ? "Empezar_" : "Siguiente_"}</span>
          <ArrowRight size={24} strokeWidth={3} />
        </button>
      </footer>
    </div>
  );
}
