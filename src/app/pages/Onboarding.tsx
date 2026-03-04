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
    <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-between py-16 overflow-hidden">
      <header className="mobile-container flex-row justify-end px-8 shrink-0">
        <button
          onClick={installPWA}
          className="flex items-center gap-2.5 px-6 py-3 bg-white text-black rounded-full active:scale-95 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.2)] border-none"
        >
          <Download size={18} strokeWidth={3} />
          <span className="text-[11px] font-black uppercase tracking-widest">Instalar_App_</span>
        </button>
      </header>

      <main className="mobile-container flex-1 justify-center space-y-16 py-8">
        <div className="text-center space-y-12">
          <div className="w-36 h-36 rounded-[56px] bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center shadow-2xl relative">
            <div className="absolute inset-0 bg-white/5 rounded-[56px] blur-3xl animate-pulse" />
            <div className="relative text-white">{STEPS[currentStep].icon}</div>
          </div>
          
          <div className="space-y-6 px-4">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-white">
              {STEPS[currentStep].title}
            </h1>
            <p className="text-[13px] font-bold text-zinc-500 uppercase tracking-[0.3em] leading-relaxed max-w-[280px] mx-auto">
              {STEPS[currentStep].description}
            </p>
          </div>
        </div>
      </main>

      <footer className="mobile-container gap-12 shrink-0 pb-8">
        <div className="flex justify-center gap-4">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-12 bg-white' : 'w-2 bg-zinc-800'}`} 
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
