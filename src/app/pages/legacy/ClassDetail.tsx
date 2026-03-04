import { useState } from 'react';
import { ArrowLeft, FileText, Lightbulb, CheckSquare, Calendar, BookOpen, Tag, MessageSquare } from 'lucide-react';
import { ClassSummary } from './ClassSummary';
import { KeyPoints } from './KeyPoints';
import { Tasks } from './Tasks';
import { ImportantDates } from './ImportantDates';
import { ClassNotes } from './ClassNotes';
import { Topics } from './Topics';
import { ClassChat } from './ClassChat';

interface ClassDetailProps {
  recordingId: string;
  classRecordingService: any;
  aiService: any;
  onBack: () => void;
}

type TabType = 'summary' | 'keyPoints' | 'tasks' | 'dates' | 'notes' | 'topics' | 'chat';

export function ClassDetail({ recordingId, classRecordingService, aiService, onBack }: ClassDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs = [
    { id: 'summary', label: 'Resumen', icon: FileText, color: 'blue' },
    { id: 'keyPoints', label: 'Puntos Clave', icon: Lightbulb, color: 'yellow' },
    { id: 'tasks', label: 'Tareas', icon: CheckSquare, color: 'green' },
    { id: 'dates', label: 'Fechas', icon: Calendar, color: 'purple' },
    { id: 'topics', label: 'Temas', icon: Tag, color: 'indigo' },
    { id: 'notes', label: 'Apuntes', icon: BookOpen, color: 'blue' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'pink' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Volver a Clases
          </button>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? `bg-${tab.color}-500 text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="py-6">
        {activeTab === 'summary' && (
          <ClassSummary recordingId={recordingId} classRecordingService={classRecordingService} />
        )}
        {activeTab === 'keyPoints' && (
          <KeyPoints recordingId={recordingId} classRecordingService={classRecordingService} />
        )}
        {activeTab === 'tasks' && (
          <Tasks recordingId={recordingId} classRecordingService={classRecordingService} />
        )}
        {activeTab === 'dates' && (
          <ImportantDates recordingId={recordingId} classRecordingService={classRecordingService} />
        )}
        {activeTab === 'topics' && (
          <Topics recordingId={recordingId} classRecordingService={classRecordingService} />
        )}
        {activeTab === 'notes' && (
          <ClassNotes recordingId={recordingId} classRecordingService={classRecordingService} />
        )}
        {activeTab === 'chat' && (
          <ClassChat recordingId={recordingId} classRecordingService={classRecordingService} aiService={aiService} />
        )}
      </div>
    </div>
  );
}
