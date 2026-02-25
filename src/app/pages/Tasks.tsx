import { useEffect, useState } from 'react';
import { CheckSquare, Square, Calendar } from 'lucide-react';

interface TasksProps {
  recordingId: string;
  classRecordingService: any;
}

export function Tasks({ recordingId, classRecordingService }: TasksProps) {
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

  const toggleTask = async (taskId: string) => {
    if (!recording) return;
    
    const updatedTasks = recording.tasks.map((task: any) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    await classRecordingService.updateRecording(recordingId, { tasks: updatedTasks });
    setRecording({ ...recording, tasks: updatedTasks });
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
        <CheckSquare size={32} className="text-green-500" />
        <h1 className="text-3xl font-bold">Tareas</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {recording.tasks && recording.tasks.length > 0 ? (
          <ul className="space-y-3">
            {recording.tasks.map((task: any) => (
              <li
                key={task.id}
                className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0 mt-1"
                >
                  {task.completed ? (
                    <CheckSquare size={24} className="text-green-500" />
                  ) : (
                    <Square size={24} className="text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <p className={`text-lg ${task.completed ? 'line-through text-gray-400' : ''}`}>
                    {task.description}
                  </p>
                  {task.dueDate && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar size={14} />
                      {new Date(task.dueDate).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay tareas registradas</p>
        )}
      </div>
    </div>
  );
}
