import { useState, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface RecordClassProps {
  audioService: any;
  classRecordingService: any;
  onRecordingComplete: (recordingId: string) => void;
}

export function RecordClass({ audioService, classRecordingService, onRecordingComplete }: RecordClassProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = async () => {
    const hasPermission = await audioService.requestPermissions();
    if (!hasPermission) {
      alert('Necesitas dar permiso al micrófono');
      return;
    }

    setIsRecording(true);
    setTranscript('');
    
    audioService.startRecording(
      (text: string) => {
        // Actualizar con el texto completo acumulado
        setTranscript(text);
      },
      (error: string) => {
        alert('Error: ' + error);
        setIsRecording(false);
      }
    );
  };

  const stopRecording = () => {
    audioService.stopRecording();
    setIsRecording(false);
    // Obtener el texto final completo
    const finalTranscript = audioService.getFullTranscript();
    if (finalTranscript) {
      setTranscript(finalTranscript);
    }
  };

  const processAndSave = async () => {
    if (!transcript.trim()) {
      alert('No hay texto para procesar');
      return;
    }

    setIsProcessing(true);
    
    try {
      const recording = await classRecordingService.processTranscript(transcript);
      setIsProcessing(false);
      onRecordingComplete(recording.id);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la grabación');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background text-foreground min-h-screen">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Grabar Clase</h1>
      
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-destructive text-destructive-foreground animate-pulse' 
                : 'bg-foreground text-background hover:bg-foreground/90'
            } disabled:opacity-50`}
          >
            {isRecording ? <Square size={40} /> : <Mic size={40} />}
          </button>
          
          <p className="text-lg font-medium text-foreground">
            {isRecording ? 'Grabando... Toca para detener' : 'Toca para comenzar a grabar'}
          </p>
        </div>
      </div>

      {transcript && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold tracking-tight mb-4 text-foreground">Transcripción</h2>
          <div className="bg-secondary p-4 rounded-xl max-h-96 overflow-y-auto border border-border">
            <p className="whitespace-pre-wrap text-foreground">{transcript}</p>
          </div>
        </div>
      )}

      {transcript && !isRecording && (
        <button
          onClick={processAndSave}
          disabled={isProcessing}
          className="w-full bg-foreground text-background hover:bg-foreground/90 py-4 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" />
              Procesando con IA...
            </>
          ) : (
            'Procesar y Guardar'
          )}
        </button>
      )}
    </div>
  );
}
