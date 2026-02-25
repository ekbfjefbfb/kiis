import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';

interface TopicsProps {
  recordingId: string;
  classRecordingService: any;
}

export function Topics({ recordingId, classRecordingService }: TopicsProps) {
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
        <Tag size={32} className="text-indigo-500" />
        <h1 className="text-3xl font-bold">Temas Discutidos</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {recording.topics && recording.topics.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {recording.topics.map((topic: string, index: number) => (
              <div
                key={index}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-lg"
              >
                {topic}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay temas registrados</p>
        )}
      </div>
    </div>
  );
}
