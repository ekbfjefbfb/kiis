import { useEffect, useState } from 'react';
import { Plus, Calendar, ChevronRight } from 'lucide-react';

interface ClassListProps {
  classRecordingService: any;
  onSelectClass: (recordingId: string) => void;
  onNewClass: () => void;
}

export function ClassList({ classRecordingService, onSelectClass, onNewClass }: ClassListProps) {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    setLoading(true);
    const data = await classRecordingService.getRecordings();
    setRecordings(data.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="text-gray-500 text-lg">Cargando clases...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mis Clases</h1>
        <button
          onClick={onNewClass}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Nueva Clase
        </button>
      </div>

      <div className="space-y-4">
        {recordings.length > 0 ? (
          recordings.map((recording) => (
            <div
              key={recording.id}
              onClick={() => onSelectClass(recording.id)}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar size={16} />
                    <span>
                      {new Date(recording.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {recording.topics && recording.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recording.topics.slice(0, 3).map((topic: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                  {recording.summary && (
                    <p className="text-gray-700 mt-3 line-clamp-2">{recording.summary}</p>
                  )}
                </div>
                <ChevronRight size={24} className="text-gray-400" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No tienes clases grabadas aún</p>
            <button
              onClick={onNewClass}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Grabar Primera Clase
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
