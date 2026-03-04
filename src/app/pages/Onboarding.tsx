import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Radio, Brain, Zap, Download } from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

const STEPS = [
  {
    icon: <Radio size={48} />,
    title: "GRABA",
    description: "Toca grabar y habla. La app transcribe todo automáticamente.",
  },
  {
    icon: <Brain size={48} />,
    title: "RESUMEN",
    description: "La IA crea resúmenes y detecta tus tareas pendientes.",
  },
  {
    icon: <Zap size={48} />,
    title: "LISTO",
    description: "Todo guardado y organizado. Nada de papeleo.",
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
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center py-10 px-6">
      <div className="mobile-container flex flex-col flex-1">
        <header className="flex justify-end pt-2 pb-12 shrink-0">
          <button
            onClick={installPWA}
            className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest transition-all active:opacity-60"
          >
            Instalar
          </button>
        </header>

        <main className="flex-1 flex flex-col justify-center space-y-16 pb-12">
          <div className="text-center space-y-10">
            <div className="w-20 h-20 rounded-[32px] bg-[#1c1c1e] border border-white/5 mx-auto flex items-center justify-center relative mb-4">
              <div className="relative text-zinc-400 scale-110">{STEPS[currentStep].icon}</div>
            </div>
            
            <div className="space-y-4 px-4">
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                {STEPS[currentStep].title}
              </h1>
              <p className="text-zinc-500 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
                {STEPS[currentStep].description}
              </p>
            </div>
          </div>
        </main>

        <footer className="space-y-10 pb-8 shrink-0">
          <div className="flex justify-center gap-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-8 bg-zinc-400' : 'w-2 bg-zinc-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="btn-main-action"
          >
            <span className="font-black text-lg">
              {currentStep === STEPS.length - 1 ? "EMPEZAR" : "SIGUIENTE"}
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}
