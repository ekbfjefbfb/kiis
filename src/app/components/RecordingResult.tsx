import { useState } from 'react';
import { CheckCircle2, Clock, BookOpen, AlertTriangle, Share, Download, ArrowLeft, Brain } from 'lucide-react';
import { Recording, Task, Class } from '../../services/class-manager';
import SmartChat from './SmartChat';

interface RecordingResultProps {
  recording: Recording;
  classData: Class;
  onBack: () => void;
  onViewClass: () => void;
}

export default function RecordingResult({ recording, classData, onBack, onViewClass }: RecordingResultProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'notes' | 'tasks'>('summary');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 2: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'Alta';
      case 2: return 'Media';
      default: return 'Baja';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h1 className="text-2xl font-bold text-white">Grabación Completada</h1>
          </div>
          <p className="text-zinc-400 text-sm">{formatDate(recording.date)}</p>
        </div>
      </div>

      {/* Información de la clase */}
      <div className="bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 rounded-2xl p-4 border border-zinc-700">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: classData.color }}
          />
          <h2 className="text-xl font-bold text-white">{classData.name}</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span>👨‍🏫 {classData.professor}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDuration(recording.duration)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-zinc-800">
        {[
          { id: 'summary', label: 'Resumen', icon: BookOpen },
          { id: 'tasks', label: `Tareas (${recording.tasks.length})`, icon: CheckCircle2 },
          { id: 'notes', label: 'Apuntes', icon: AlertTriangle }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id 
                ? 'bg-white text-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      <div className="min-h-[300px]">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/30 rounded-xl p-5 border border-zinc-800">
              <h3 className="text-lg font-bold text-white mb-3">📋 Resumen de la Clase</h3>
              <p className="text-zinc-300 leading-relaxed">
                {recording.summary || 'No se generó resumen para esta grabación.'}
              </p>
            </div>

            {recording.keyPoints.length > 0 && (
              <div className="bg-zinc-900/30 rounded-xl p-5 border border-zinc-800">
                <h3 className="text-lg font-bold text-white mb-4">🎯 Puntos Clave</h3>
                <div className="space-y-3">
                  {recording.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <p className="text-zinc-300 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {recording.tasks.length > 0 ? (
              recording.tasks.map((task, index) => (
                <div key={index} className={`rounded-xl p-4 border ${getPriorityColor(task.priority)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white">{task.text}</h4>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-current/20">
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                  {task.dueDate && (
                    <p className="text-sm opacity-80">
                      📅 Fecha límite: {new Date(task.dueDate).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No se detectaron tareas en esta grabación</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-zinc-900/30 rounded-xl p-5 border border-zinc-800">
            <h3 className="text-lg font-bold text-white mb-4">📝 Apuntes Completos</h3>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-zinc-300 leading-relaxed text-sm">
                {recording.notes || 'No se generaron apuntes detallados para esta grabación.'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <button
          onClick={onViewClass}
          className="flex-1 bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
        >
          Ver Clase Completa
        </button>
        
        <button 
          onClick={() => setIsChatOpen(true)}
          className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
        >
          <Brain className="w-5 h-5" />
        </button>
        
        <button className="p-4 bg-zinc-800 text-zinc-400 rounded-2xl hover:text-white transition-colors">
          <Share className="w-5 h-5" />
        </button>
      </div>

      {/* Chat IA Contextual */}
      <SmartChat 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        contextRecording={recording}
        contextClass={classData.name}
      />
    </div>
  );
}