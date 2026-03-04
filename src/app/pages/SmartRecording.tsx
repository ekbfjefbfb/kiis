import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { classManager, Class } from "../../services/class-manager";
import { audioService } from "../../services/audio.service";
import { agendaService } from "../../services/agenda.service";

type Phase = 'ready' | 'recording' | 'processing' | 'done';

export default function SmartRecording() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('ready');
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [agendaState, setAgendaState] = useState<any>(null);
  const [isWaveformActive, setIsWaveformActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const suggested = classManager.suggestCurrentClass();
    setCurrentClass(suggested);
  }, []);

  useEffect(() => {
    if (phase === 'recording') {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        setIsWaveformActive(prev => !prev);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  const startRecording = async () => {
    const ok = await audioService.requestPermissions();
    if (!ok) return;

    try {
      const newSession = await agendaService.createSession({
        class_name: currentClass?.name || "Clase",
        topic_hint: "Grabación automática"
      });

      agendaService.connectWebSocket(newSession.id, {
        onAgendaState: (data) => setAgendaState(data.state),
        onConnected: () => console.log("Conectado"),
        onDisconnected: () => console.log("Desconectado"),
        onError: (err) => console.error(err)
      });

      await audioService.startAudioRecording();
      setPhase('recording');
      setRecordingTime(0);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    if (phase !== 'recording') return;
    setPhase('processing');
    
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const audioBlob = await audioService.stopAudioRecording();
      if (!audioBlob) {
        throw new Error("No audio captured");
      }

      const result = await agendaService.transcribeAudio(audioBlob);
      
      if (result && result.text) {
        agendaService.sendTranscriptChunk(result.text);
      }

      // Esperar un momento para recibir el estado final del WebSocket
      await new Promise(resolve => setTimeout(resolve, 2500));

      if (agendaState?.state) {
        const { summary, tasks, key_points } = agendaState.state;
        classManager.addRecording({
          classId: currentClass?.id || "unknown",
          date: new Date().toISOString(),
          duration: recordingTime,
          summary: summary || "Sin resumen disponible",
          tasks: tasks || [],
          keyPoints: key_points || [],
          notes: result?.text || ""
        });
      }
      
      agendaService.disconnect();
      setPhase('done');
    } catch (e) {
      console.error("Recording error:", e);
      // Limpieza de emergencia
      agendaService.disconnect();
      setPhase('ready');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (phase === 'ready') {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-between px-8 py-20 font-['Plus_Jakarta_Sans']">
        <header className="text-center">
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-2">Listo para capturar</p>
          <h1 className="text-4xl font-bold tracking-tight">
            {currentClass ? currentClass.name : "Clase"}
          </h1>
          {currentClass && (
            <p className="text-zinc-500 text-lg mt-2 font-medium">
              {currentClass.professor} • {currentClass.room || "Aula"}
            </p>
          )}
        </header>

        <button 
          onClick={startRecording}
          className="group relative w-56 h-56 flex items-center justify-center active:scale-95 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl group-hover:bg-red-500/30 transition-colors" />
          <div className="relative w-48 h-48 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(220,38,38,0.4)]">
            <div className="w-44 h-44 border-2 border-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold tracking-tighter uppercase">Iniciar</span>
            </div>
          </div>
        </button>

        <button 
          onClick={() => navigate("/")}
          className="text-zinc-600 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  if (phase === 'recording') {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-between px-8 py-20 font-['Plus_Jakarta_Sans']">
        <header className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-red-500 text-sm font-bold uppercase tracking-widest">Grabando en vivo</p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">
            {currentClass?.name || "Capturando Audio"}
          </h1>
        </header>

        <div className="flex flex-col items-center gap-12">
          <div className="flex items-end gap-1.5 h-16">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="w-1.5 bg-red-500 rounded-full transition-all duration-300"
                style={{ 
                  height: `${Math.random() * (isWaveformActive ? 100 : 20) + 10}%`,
                  opacity: Math.random() * 0.5 + 0.5
                }}
              />
            ))}
          </div>
          <p className="text-7xl font-light tracking-tighter tabular-nums">{formatTime(recordingTime)}</p>
        </div>

        <button 
          onClick={stopRecording}
          className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center active:scale-90 transition-all group"
        >
          <div className="w-8 h-8 bg-white rounded-sm group-hover:scale-90 transition-transform" />
        </button>
      </div>
    );
  }

  if (phase === 'processing') {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center px-8 font-['Plus_Jakarta_Sans']">
        <div className="relative w-24 h-24 mb-10">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">IA Analizando</h2>
        <p className="text-zinc-500 font-medium text-center max-w-[240px]">
          Extrayendo conceptos clave y tareas para tu agenda...
        </p>
      </div>
    );
  }

  if (phase === 'done') {
    const tasks = agendaState?.state?.tasks || [];
    const summary = agendaState?.state?.summary || "Clase procesada con éxito";

    return (
      <div className="min-h-[100dvh] bg-black text-white px-7 pt-20 pb-12 flex flex-col font-['Plus_Jakarta_Sans']">
        <div className="flex-1 overflow-y-auto">
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
            <div className="w-5 h-5 bg-green-500 rounded-full" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-8">Captura Lista</h1>
          
          <div className="space-y-10">
            <section>
              <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Resumen Inteligente</h2>
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6">
                <p className="text-[17px] leading-relaxed text-white/90 font-medium italic">"{summary}"</p>
              </div>
            </section>

            {tasks.length > 0 && (
              <section>
                <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Acciones Detectadas</h2>
                <div className="space-y-3">
                  {tasks.map((task: any, idx: number) => (
                    <div key={idx} className="bg-zinc-900/20 border border-white/5 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2.5" />
                      <p className="text-[15px] font-semibold text-white/80">{task.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <button 
          onClick={() => navigate("/")}
          className="w-full h-18 mt-10 bg-white text-black rounded-[2rem] font-bold text-lg active:scale-[0.98] transition-all shadow-xl shadow-white/5"
        >
          Finalizar
        </button>
      </div>
    );
  }

  return null;
}
