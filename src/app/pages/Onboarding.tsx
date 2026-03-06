import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Mic, Brain, Zap, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: <Mic size={40} />,
    title: "Captura.",
    description: "Graba tus clases en tiempo real. La IA transcribe cada palabra con precisión quirúrgica.",
    color: "text-red-500"
  },
  {
    icon: <Brain size={40} />,
    title: "Sintetiza.",
    description: "Genera resúmenes ejecutivos y detecta tareas automáticamente para que tú no tengas que hacerlo.",
    color: "text-indigo-500"
  },
  {
    icon: <Sparkles size={40} />,
    title: "Evoluciona.",
    description: "Tu asistente académico personal, diseñado para llevar tu productividad al siguiente nivel.",
    color: "text-amber-500"
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem("onboarding_complete", "true");
      navigate("/register", { replace: true });
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-10 text-center">
        <div key={currentStep} className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 flex items-center justify-center mb-12 shadow-2xl">
            <div className={STEPS[currentStep].color}>
              {STEPS[currentStep].icon}
            </div>
          </div>
          
          <h1 className="text-6xl font-extrabold tracking-tighter leading-none mb-6 italic">
            {STEPS[currentStep].title}
          </h1>
          
          <p className="text-zinc-500 text-xl font-medium leading-relaxed max-w-[320px]">
            {STEPS[currentStep].description}
          </p>
        </div>
      </main>

      <footer className="p-12 flex flex-col items-center gap-12">
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentStep ? 'w-10 bg-white' : 'w-2 bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full h-20 bg-white text-black rounded-[2.5rem] font-extrabold text-xl active:scale-[0.97] transition-all duration-300 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center group"
        >
          <div className="flex items-center gap-3">
            <span>{currentStep === STEPS.length - 1 ? "EMPEZAR" : "CONTINUAR"}</span>
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </footer>
    </div>
  );
}
