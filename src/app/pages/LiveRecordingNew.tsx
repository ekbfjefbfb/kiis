import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import ClassSelector from '../components/ClassSelector';
import NewClassForm from '../components/NewClassForm';
import RecordingResult from '../components/RecordingResult';
import { Class, classManager, Recording } from '../../services/class-manager';
import { audioService } from '../../services/audio.service';
import { agendaService } from '../../services/agenda.service';

type ViewState = 'selector' | 'newClass' | 'recording' | 'result';

export default function LiveRecordingNew() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('selector');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  
  // Estados de grabación
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [session, setSession] = useState<any>(null);
  const [agendaState, setAgendaState] = useState<any>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleClassSelected = async (classData: Class) => {
    setSelectedClass(classData);
    await initializeSession(classData);
    setViewState('recording');
  };

  const handleNewClass = () => {
    setViewState('newClass');
  };

  const handleClassCreated = async (newClass: Class) => {
    setSelectedClass(newClass);
    await initializeSession(newClass);
    setViewState('recording');
  };

  const initializeSession = async (classData: Class) => {
    try {
      const newSession = await agendaService.createSession({
        class_name: classData.name,
        topic_hint: `Clase de ${classData.name} con ${classData.professor}`
      });
      
      setSession(newSession);
      
      // Conectar WebSocket
      agendaService.connectWebSocket(newSession.id, {
        onAgendaState: (data) => {
          setAgendaState(data);
        },
        onConnected: () => console.log('✅ Conectado'),
        onDisconnected: () => console.log('❌ Desconectado'),
        onError: (error) => console.error('Error:', error)
      });
    } catch (error) {
      console.error('Error inicializando sesión:', error);
    }
  };

  const startRecording = async () => {
    const hasPermission = await audioService.requestPermissions();
    if (!hasPermission) {
      alert("Se necesitan permisos de micrófono");
      return;
    }

    try {
      await audioService.startAudioRecording();
      
      if (audioService.isSupported()) {
        audioService.startRecording((text) => {
          setCurrentTranscript(text);
        });
      }

      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error al iniciar grabación:", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (audioService.getIsRecording()) {
        audioService.stopRecording();
      }

      const audioBlob = await audioService.stopAudioRecording();
      setIsRecording(false);

      // Crear recording con datos reales
      const recording: Recording = {
        id: Date.now().toString(),
        classId: selectedClass!.id,
        date: new Date().toISOString(),
        duration: recordingTime,
        summary: agendaState?.state.summary || 'Resumen generado automáticamente de la clase.',
        tasks: agendaState?.state.tasks || [],
        keyPoints: agendaState?.state.key_points || [],
        notes: agendaState?.state.lecture_notes || currentTranscript
      };

      // Guardar en el sistema
      const savedRecording = classManager.addRecording(recording);
      setCurrentRecording(savedRecording);
      
      // Finalizar sesión
      if (session) {
        await agendaService.finalizeSession(session.id);
        agendaService.disconnect();
      }

      setViewState('result');
    } catch (error) {
      console.error("Error al detener grabación:", error);
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBackToSelector = () => {
    setViewState('selector');
    setSelectedClass(null);
    setCurrentRecording(null);
    setAgendaState(null);
    setCurrentTranscript("");
  };

  const handleViewClass = () => {
    navigate(`/class/${selectedClass!.id}`);
  };

  // Renderizado condicional basado en el estado
  if (viewState === 'selector') {
    return (
      <div className="min-h-[100dvh] bg-background px-6 py-8">
        <ClassSelector 
          onClassSelected={handleClassSelected}
          onNewClass={handleNewClass}
        />
      </div>
    );
  }

  if (viewState === 'newClass') {
    return (
      <div className="min-h-[100dvh] bg-background px-6 py-8">
        <NewClassForm 
          onBack={() => setViewState('selector')}
          onClassCreated={handleClassCreated}
        />
      </div>
    );
  }

  if (viewState === 'result' && currentRecording && selectedClass) {
    return (
      <div className="min-h-[100dvh] bg-background px-6 py-8">
        <RecordingResult 
          recording={currentRecording}
          classData={selectedClass}
          onBack={handleBackToSelector}
          onViewClass={handleViewClass}
        />
      </div>
    );
  }

  // Vista de grabación
  return (
    <div className="min-h-[100dvh] bg-background px-6 pb-32 flex flex-col">
      {/* Header con información de la clase */}
      <header className="mb-6 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: selectedClass?.color }}
          />
          <div>
            <h1 className="text-2xl font-semibold text-white">{selectedClass?.name}</h1>
            <p className="text-sm text-zinc-400">{selectedClass?.professor}</p>
          </div>
        </div>
      </header>

      {/* Botón de grabación */}
      <div className="flex flex-col items-center justify-center flex-1 min-h-[40vh]">
        <button
          onClick={handleRecord}
          className={`relative flex items-center justify-center w-32 h-32 rounded-full transition-colors duration-500 ${
            isRecording 
              ? "bg-red-500 text-white shadow-[0_0_40px_-5px_rgba(255,0,0,0.3)]" 
              : "bg-white text-black shadow-2xl"
          }`}
        >
          {isRecording ? "⏹️" : "🎙️"}
          {isRecording && (
            <div className="absolute inset-0 rounded-full border border-red-500 animate-ping" />
          )}
        </button>

        {/* Timer y transcripción */}
        <div className="text-center mt-12 w-full max-w-md">
          {isRecording && (
            <div>
              <p className="text-4xl font-light text-white mb-4">
                {formatTime(recordingTime)}
              </p>
              <div className="bg-zinc-900/30 rounded-2xl p-4 min-h-[80px] max-h-[120px] overflow-y-auto">
                <p className="text-sm text-white leading-relaxed">
                  {currentTranscript || "Escuchando..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Análisis en tiempo real */}
      {isRecording && agendaState && (
        <div className="space-y-4 mt-6">
          {agendaState.state.summary && (
            <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20">
              <h3 className="text-sm font-bold text-blue-400 mb-2">📋 Resumen</h3>
              <p className="text-sm text-white">{agendaState.state.summary}</p>
            </div>
          )}

          {agendaState.state.tasks.length > 0 && (
            <div className="bg-yellow-500/10 rounded-2xl p-4 border border-yellow-500/20">
              <h3 className="text-sm font-bold text-yellow-400 mb-2">
                ✅ Tareas ({agendaState.state.tasks.length})
              </h3>
              {agendaState.state.tasks.slice(0, 2).map((task: any, idx: number) => (
                <p key={idx} className="text-sm text-white mb-1">• {task.text}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}