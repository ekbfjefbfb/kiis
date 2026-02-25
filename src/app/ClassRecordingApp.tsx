import { useState } from 'react';
import { ClassList } from './pages/ClassList';
import { RecordClass } from './pages/RecordClass';
import { ClassDetail } from './pages/ClassDetail';
import { ClassRecordingService } from '../services/classRecording';
import { AudioService } from '../audio';
import { AuthService } from '../auth';
import { AIService } from '../api';

type ViewType = 'list' | 'record' | 'detail';

interface ClassRecordingAppProps {
  authService: AuthService;
  audioService: AudioService;
  aiService: AIService;
}

export function ClassRecordingApp({ authService, audioService, aiService }: ClassRecordingAppProps) {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);

  // Inicializar servicio de grabación
  const classRecordingService = new ClassRecordingService(authService);

  const handleNewClass = () => {
    setCurrentView('record');
  };

  const handleSelectClass = (recordingId: string) => {
    setSelectedRecordingId(recordingId);
    setCurrentView('detail');
  };

  const handleRecordingComplete = (recordingId: string) => {
    setSelectedRecordingId(recordingId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedRecordingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'list' && (
        <ClassList
          classRecordingService={classRecordingService}
          onSelectClass={handleSelectClass}
          onNewClass={handleNewClass}
        />
      )}

      {currentView === 'record' && (
        <RecordClass
          audioService={audioService}
          classRecordingService={classRecordingService}
          onRecordingComplete={handleRecordingComplete}
        />
      )}

      {currentView === 'detail' && selectedRecordingId && (
        <ClassDetail
          recordingId={selectedRecordingId}
          classRecordingService={classRecordingService}
          aiService={aiService}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
}
