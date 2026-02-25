import { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';

interface KeyPointsProps {
  recordingId: string;
  classRecordingService: any;
}

export function KeyPoints({ recordingId, classRecordingService }: KeyPointsProps) {
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
        <Lightbulb size={32} className="text-yellow-500" />
        <h1 className="text-3xl font-bold">Puntos Importantes</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {recording.keyPoints && recording.keyPoints.length > 0 ? (
          <ul className="space-y-4">
            {recording.keyPoints.map((point: string, index: number) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </span>
                <p className="flex-1 text-lg pt-1">{point}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay puntos importantes registrados</p>
        )}
      </div>
    </div>
  );
}
