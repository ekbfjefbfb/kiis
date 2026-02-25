import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface ClassNotesProps {
  recordingId: string;
  classRecordingService: any;
}

export function ClassNotes({ recordingId, classRecordingService }: ClassNotesProps) {
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
        <BookOpen size={32} className="text-blue-500" />
        <h1 className="text-3xl font-bold">Apuntes</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {recording.notes ? (
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{recording.notes}</p>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay apuntes adicionales</p>
        )}
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Transcripción Original</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{recording.rawTranscript}</p>
      </div>
    </div>
  );
}
