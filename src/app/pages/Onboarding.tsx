import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Mic, Brain, Sparkles } from "lucide-react";

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
      <main className="flex-1 flex flex-col items-center justify-center px-10 text-center relative">
        {/* Decorative ambient glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000 ${
          currentStep === 0 ? 'bg-red-500' : currentStep === 1 ? 'bg-indigo-500' : 'bg-amber-500'
        }`} />

        <div key={currentStep} className="animate-in fade-in zoom-in-95 duration-1000 flex flex-col items-center relative z-10">
          <div className="w-28 h-24 rounded-[2.5rem] bg-zinc-900/40 backdrop-blur-xl border border-white/5 flex items-center justify-center mb-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)] group transition-transform duration-500 hover:scale-105">
            <div className={`${STEPS[currentStep].color} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
              {STEPS[currentStep].icon}
            </div>
          </div>
          
          <h1 className="text-6xl font-extrabold tracking-tighter leading-none mb-6 italic text-white drop-shadow-sm">
            {STEPS[currentStep].title}
          </h1>
          
          <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-[320px] tracking-tight">
            {STEPS[currentStep].description}
          </p>
        </div>
      </main>

      <footer className="p-12 flex flex-col items-center gap-12 relative z-10">
        <div className="flex gap-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
                i === currentStep ? 'w-12 bg-white' : 'w-2 bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full h-20 bg-white text-black rounded-[2.5rem] font-black text-xl active:scale-[0.96] transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(255,255,255,0.15)] flex items-center justify-center group overflow-hidden relative"
        >
          <div className="flex items-center gap-3 relative z-10">
            <span className="tracking-tighter">{currentStep === STEPS.length - 1 ? "COMENZAR" : "SIGUIENTE"}</span>
            <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform duration-300" />
          </div>
          <div className="absolute inset-0 bg-zinc-100 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </button>
      </footer>
    </div>
  );
}
