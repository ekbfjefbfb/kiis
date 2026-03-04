import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Brain, Radio, Zap, Download } from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

const STEPS = [
  {
    icon: <Radio size={48} className="text-white" />,
    title: "GRABA_TUS_CLASES_",
    description: "Captura cada palabra del profesor. Nuestra IA se encarga de la transcripción en tiempo real.",
    color: "bg-zinc-900"
  },
  {
    icon: <Brain size={48} className="text-white" />,
    title: "RESÚMENES_INTELIGENTES_",
    description: "Recibe síntesis automáticas y tareas organizadas por materia apenas termina la sesión.",
    color: "bg-zinc-900"
  },
  {
    icon: <Zap size={48} className="text-white" />,
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
    <div className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative selection:bg-white/20">
      {isInstallable && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={installPWA}
          className="absolute top-[env(safe-area-inset-top,2rem)] right-6 z-50 flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full active:scale-95 transition-all backdrop-blur-md"
        >
          <Download size={14} className="text-zinc-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Instalar App_</span>
        </motion.button>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-8 max-w-md mx-auto w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center space-y-12"
          >
            <div className={`w-32 h-32 rounded-[48px] ${STEPS[currentStep].color} border border-zinc-800 mx-auto flex items-center justify-center shadow-2xl`}>
              {STEPS[currentStep].icon}
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold uppercase italic tracking-tighter leading-none">
                {STEPS[currentStep].title}
              </h1>
              <p className="text-[13px] font-medium text-zinc-500 uppercase tracking-[0.3em] leading-relaxed max-w-[280px] mx-auto">
                {STEPS[currentStep].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-16 inset-x-8 flex flex-col items-center gap-10">
          <div className="flex gap-2.5">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-white' : 'w-1.5 bg-zinc-800'}`} 
              />
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={next}
            className="w-full h-20 bg-white text-black rounded-[40px] font-extrabold uppercase italic tracking-tighter text-xl shadow-2xl flex items-center justify-center gap-4 active:bg-zinc-200 transition-colors"
          >
            <span>{currentStep === STEPS.length - 1 ? "Empezar_" : "Siguiente_"}</span>
            <ArrowRight size={24} />
          </motion.button>
        </div>
      </main>
    </div>
  );
}
