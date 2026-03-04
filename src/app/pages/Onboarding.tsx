import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Radio, Brain, Zap, Download } from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

const STEPS = [
  {
    icon: <Radio size={48} color="#ffffff" />,
    title: "GRABA_TUS_CLASES_",
    description: "Captura cada palabra del profesor. Nuestra IA se encarga de la transcripción en tiempo real.",
    color: "bg-zinc-900"
  },
  {
    icon: <Brain size={48} color="#ffffff" />,
    title: "RESÚMENES_INTELIGENTES_",
    description: "Recibe síntesis automáticas y tareas organizadas por materia apenas termina la sesión.",
    color: "bg-zinc-900"
  },
  {
    icon: <Zap size={48} color="#ffffff" />,
    title: "AGILIDAD_EXTREMA_",
    description: "Diseñado para estudiantes de ingeniería. Sin ruido, sin distracciones, solo eficiencia.",
    color: "bg-zinc-900"
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { isInstallable, installPWA } = usePWAInstall();

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col items-center justify-center relative" style={{ backgroundColor: '#000000' }}>
      {/* Botón de Instalación Premium - Centrado en el contexto del header */}
      <div className="absolute top-16 w-full max-w-md px-8 flex justify-end z-50">
        <button
          onClick={installPWA}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-white text-black border border-white rounded-full active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
        >
          <Download size={16} strokeWidth={3} />
          <span className="text-[11px] font-black uppercase tracking-widest">Instalar_App_</span>
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-8 max-w-[360px] w-full relative space-y-16">
        {/* Ilustración y Contenido */}
        <div className="text-center space-y-12">
          <div className="w-36 h-36 rounded-[56px] bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center shadow-2xl relative group">
            <div className="absolute inset-0 bg-white/5 rounded-[56px] blur-2xl group-active:bg-white/10 transition-colors" />
            <div className="relative">
              {STEPS[currentStep].icon}
            </div>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-white">
              {STEPS[currentStep].title}
            </h1>
            <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-[0.3em] leading-relaxed max-w-[280px] mx-auto">
              {STEPS[currentStep].description}
            </p>
          </div>
        </div>

        {/* Controles Inferiores - Centrados y con Aire */}
        <div className="w-full flex flex-col items-center gap-12">
          <div className="flex gap-3">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-10 bg-white' : 'w-1.5 bg-zinc-800'}`} 
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-full h-20 bg-white text-black rounded-[40px] font-black uppercase italic tracking-tighter text-xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 active:scale-[0.97] transition-all"
          >
            <span>{currentStep === STEPS.length - 1 ? "Empezar_" : "Siguiente_"}</span>
            <ArrowRight size={24} strokeWidth={3} />
          </button>
        </div>
      </main>
    </div>
  );
}
