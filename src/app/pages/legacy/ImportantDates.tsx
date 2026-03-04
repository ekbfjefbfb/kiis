import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface ImportantDatesProps {
  recordingId: string;
  classRecordingService: any;
}

export function ImportantDates({ recordingId, classRecordingService }: ImportantDatesProps) {
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

  const sortedDates = recording.dates 
    ? [...recording.dates].sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    : [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar size={32} className="text-purple-500" />
        <h1 className="text-3xl font-bold">Fechas Importantes</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {sortedDates.length > 0 ? (
          <div className="space-y-4">
            {sortedDates.map((dateItem: any) => {
              const date = new Date(dateItem.date);
              const isUpcoming = date > new Date();
              
              return (
                <div
                  key={dateItem.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    isUpcoming ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Clock size={20} className={isUpcoming ? 'text-purple-500' : 'text-gray-400'} />
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{dateItem.description}</p>
                      <p className="text-gray-600 mt-1">
                        {date.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay fechas importantes registradas</p>
        )}
      </div>
    </div>
  );
}
