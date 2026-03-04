import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Brain, Radio, Zap, Download } from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

const STEPS = [
  {
    icon: <Radio size={48} className="text-foreground" />,
    title: "GRABA_TUS_CLASES_",
    description: "Captura cada palabra del profesor. Nuestra IA se encarga de la transcripción en tiempo real.",
    color: "bg-secondary/40"
  },
  {
    icon: <Brain size={48} className="text-foreground" />,
    title: "RESÚMENES_INTELIGENTES_",
    description: "Recibe síntesis automáticas y tareas organizadas por materia apenas termina la sesión.",
    color: "bg-secondary/40"
  },
  {
    icon: <Zap size={48} className="text-foreground" />,
    title: "AGILIDAD_EXTREMA_",
    description: "Diseñado para estudiantes de ingeniería. Sin ruido, sin distracciones, solo eficiencia.",
    color: "bg-secondary/40"
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
    <div className="h-[100dvh] w-full bg-background text-foreground font-sans overflow-hidden flex flex-col relative selection:bg-primary/20 transition-colors duration-300">
      {isInstallable && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={installPWA}
          className="absolute top-[env(safe-area-inset-top,2rem)] right-6 z-50 flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full active:scale-95 transition-all backdrop-blur-md"
        >
          <Download size={14} className="text-muted-foreground" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Instalar App_</span>
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
            <div className={`w-32 h-32 rounded-[48px] ${STEPS[currentStep].color} mx-auto flex items-center justify-center shadow-2xl border border-border`}>
              {STEPS[currentStep].icon}
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl font-bold uppercase italic tracking-tighter leading-none text-foreground">
                {STEPS[currentStep].title}
              </h1>
              <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-[0.3em] leading-relaxed max-w-[280px] mx-auto">
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
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-primary' : 'w-1.5 bg-secondary'}`} 
              />
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={next}
            className="w-full h-20 bg-primary text-primary-foreground rounded-[40px] font-bold uppercase italic tracking-tighter text-xl shadow-2xl flex items-center justify-center gap-4 active:opacity-90 transition-colors"
          >
            <span>{currentStep === STEPS.length - 1 ? "Empezar_" : "Siguiente_"}</span>
            <ArrowRight size={24} />
          </motion.button>
        </div>
      </main>
    </div>
  );
}
