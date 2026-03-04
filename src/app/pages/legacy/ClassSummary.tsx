import { useEffect, useState } from 'react';
import { FileText, Calendar } from 'lucide-react';

interface ClassSummaryProps {
  recordingId: string;
  classRecordingService: any;
}

export function ClassSummary({ recordingId, classRecordingService }: ClassSummaryProps) {
  const [recording, setRecording] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecording();
  }, [recordingId]);

  const loadRecording = async () => {
    setLoading(true);
    const data = await classRecordingService.getRecordingById(recordingId);
    setRecording(data);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  if (!recording) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText size={32} className="text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">Resumen de Clase</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Calendar size={16} />
            {new Date(recording.date).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {recording.processed ? (
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{recording.summary}</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Esta clase aún no ha sido procesada</p>
          </div>
        )}
      </div>
    </div>
  );
}
