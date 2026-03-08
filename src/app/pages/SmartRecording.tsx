import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Mic, Square, Loader2, CheckCircle2 } from "lucide-react";
import { classManager, Class } from "../../services/class-manager";
import { audioService } from "../../services/audio.service";
import { agendaService } from "../../services/agenda.service";
import { backgroundRecordingService } from "../../services/background-recording.service";

type Phase = 'ready' | 'recording' | 'processing' | 'done';

export default function SmartRecording() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('ready');
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [agendaState, setAgendaState] = useState<{
    summary?: string;
    tasks?: Array<{ text: string; description?: string }>;
    key_points?: string[];
  } | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  
  const transcriptRef = useRef<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const suggested = classManager.suggestCurrentClass();
    setCurrentClass(suggested);
    
    // Auto-check scheduled classes
    const classes = classManager.getClasses();
    backgroundRecordingService.checkScheduledClasses(classes);
    
    const checkInterval = setInterval(() => {
      backgroundRecordingService.checkScheduledClasses(classManager.getClasses());
    }, 60000);
    
    return () => {
      clearInterval(checkInterval);
      backgroundRecordingService.destroy();
    };
  }, []);

  useEffect(() => {
    if (phase === 'recording') {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  const handleLiveTranscript = (transcript: { text: string; isFinal: boolean; timestamp: number }) => {
    if (transcript.isFinal) {
      transcriptRef.current += transcript.text + " ";
      setLiveTranscript(transcriptRef.current);
    }
  };

  const startRecording = async () => {
    const ok = await audioService.requestPermissions();
    if (!ok) return;

    try {
      const newSession = await agendaService.createSession({
        class_name: currentClass?.name || "Clase",
        topic_hint: "Grabación inteligente"
      });

      agendaService.connectWebSocket(newSession.id, {
        onAgendaState: (data) => setAgendaState(data.state),
        onConnected: () => {},
        onError: () => {}
      });

      await backgroundRecordingService.startRecording(
        currentClass?.id || "unknown",
        currentClass?.name || "Clase",
        handleLiveTranscript,
        (state) => { if (state === 'error') setPhase('ready'); }
      );

      setPhase('recording');
      setRecordingTime(0);
      transcriptRef.current = "";
      setLiveTranscript("");
    } catch (e) {
      // Silently handle error
    }
  };

  const stopRecording = async () => {
    if (phase !== 'recording') return;
    setPhase('processing');
    
    try {
      const session = await backgroundRecordingService.stopRecording();
      
      // Send final chunk if needed
      if (transcriptRef.current) {
        agendaService.sendTranscriptChunk(transcriptRef.current);
      }

      // Buffer for AI to settle
      await new Promise(resolve => setTimeout(resolve, 3000));

      if (agendaState) {
        const { summary, tasks, key_points } = agendaState;
        classManager.addRecording({
          classId: currentClass?.id || "unknown",
          date: new Date().toISOString(),
          duration: recordingTime,
          summary: summary || "Resumen generado por IA",
          tasks: (tasks || []) as any[],
          keyPoints: key_points || [],
          notes: transcriptRef.current || ""
        });
      }
      
      agendaService.disconnect();
      setPhase('done');
    } catch (e) {
      agendaService.disconnect();
      setPhase('ready');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // UI: Ready Phase
  if (phase === 'ready') {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset">
        <header className="px-8 pt-16 pb-6 flex items-center">
          <button onClick={() => navigate("/")} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-white/10 transition-colors" aria-label="Volver al inicio">
            <ChevronLeft size={24} />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Listo para capturar</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3 leading-tight">
            {currentClass ? currentClass.name : "Nueva Grabación"}
          </h1>
          {currentClass && (
            <p className="text-zinc-500 text-lg font-medium opacity-80">
              {currentClass.professor} • {currentClass.room || "Aula"}
            </p>
          )}

          <div className="mt-20">
            <button 
              onClick={startRecording}
              className="relative group w-32 h-32 flex items-center justify-center"
              aria-label="Iniciar grabación"
            >
              <div className="absolute inset-0 bg-red-600/20 rounded-full animate-pulse scale-110" />
              <div className="relative w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.3)] group-active:scale-90 transition-transform duration-300">
                <Mic size={32} className="text-white" fill="white" />
              </div>
            </button>
          </div>
        </main>

        <footer className="p-12 flex justify-center">
          <p className="text-[11px] text-zinc-600 font-medium tracking-wide">KIIS AUDIO ENGINE V2.0</p>
        </footer>
      </div>
    );
  }

  // UI: Recording Phase
  if (phase === 'recording') {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />
        
        <header className="relative z-10 px-8 pt-16 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Live Recording</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white/90 truncate max-w-[80vw]">
            {currentClass?.name || "Clase en vivo"}
          </h1>
        </header>

        <main className="flex-1 relative z-10 flex flex-col px-8 pt-10 overflow-hidden">
          {/* Live Transcript Container */}
          <div className="flex-1 overflow-y-auto mb-8 scrollbar-hide flex flex-col-reverse">
            <div className="space-y-4 pb-10">
              {liveTranscript ? (
                <p className="text-2xl font-medium leading-relaxed text-zinc-300 transition-all duration-700">
                  {liveTranscript}
                  <span className="inline-block w-1.5 h-6 ml-1 bg-red-500/40 animate-pulse align-middle" />
                </p>
              ) : (
                <p className="text-2xl font-medium text-zinc-700 animate-pulse">
                  Escuchando al profesor...
                </p>
              )}
            </div>
          </div>

          {/* Visuals & Controls */}
          <div className="pb-12 flex flex-col items-center gap-10 bg-black/80 backdrop-blur-md -mx-8 px-8 pt-6 border-t border-white/5">
            <div className="flex flex-col items-center gap-2">
              <p className="text-6xl font-light tracking-tighter tabular-nums font-['Inter']">{formatTime(recordingTime)}</p>
              <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-600 uppercase">Tiempo transcurrido</p>
            </div>

            <button 
              onClick={stopRecording}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-2xl"
              aria-label="Detener grabación"
            >
              <Square size={24} className="text-black fill-black" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // UI: Processing Phase
  if (phase === 'processing') {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center px-12 text-center font-['Plus_Jakarta_Sans']">
        <div className="mb-10 relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl animate-pulse" />
          <Loader2 size={64} className="text-indigo-500 animate-spin relative z-10" strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Analizando Clase</h2>
        <div className="space-y-1 w-full max-w-[280px]">
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 animate-[loading_3s_ease-in-out_infinite]" />
          </div>
          <p className="text-zinc-500 text-sm font-medium pt-2">
            La IA está extrayendo conceptos clave, tareas y el resumen ejecutivo...
          </p>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // UI: Done Phase
  if (phase === 'done') {
    const tasks = agendaState?.tasks || [];
    const summary = agendaState?.summary || "Resumen procesado con éxito";

    return (
      <div className="fixed inset-0 bg-black text-white px-8 pt-20 pb-12 flex flex-col font-['Plus_Jakarta_Sans'] overflow-y-auto">
        <header className="mb-12">
          <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Captura Lista</h1>
          <p className="text-zinc-500 font-medium mt-2">Tu clase ha sido sintetizada.</p>
        </header>
        
        <div className="flex-1 space-y-12">
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-5">Resumen Ejecutivo</h2>
            <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 shadow-inner">
              <p className="text-xl leading-relaxed text-white/90 font-medium italic">"{summary}"</p>
            </div>
          </section>

          {tasks.length > 0 && (
            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-5">Próximas Acciones</h2>
              <div className="space-y-4">
                {tasks.map((task: any, idx: number) => (
                  <div key={idx} className="bg-zinc-900/10 border border-white/5 rounded-3xl p-5 flex items-start gap-4 active:bg-white/5 transition-colors">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0" />
                    <p className="text-lg font-semibold text-white/80">{task.text || task.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <button 
          onClick={() => navigate("/")}
          className="w-full h-20 mt-16 bg-white text-black rounded-[2.5rem] font-bold text-xl active:scale-[0.97] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          aria-label="Finalizar y guardar"
        >
          Finalizar
        </button>
      </div>
    );
  }

  return null;
}
