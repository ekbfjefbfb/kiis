import { useState, useEffect } from 'react';
import { Plus, Clock, User, MapPin } from 'lucide-react';
import { Class, classManager } from '../../services/class-manager';

interface ClassSelectorProps {
  onClassSelected: (classData: Class) => void;
  onNewClass: () => void;
}

export default function ClassSelector({ onClassSelected, onNewClass }: ClassSelectorProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [suggestedClass, setSuggestedClass] = useState<Class | null>(null);

  useEffect(() => {
    const allClasses = classManager.getClasses();
    setClasses(allClasses);
    
    const suggested = classManager.suggestCurrentClass();
    setSuggestedClass(suggested);
  }, []);

  const formatSchedule = (schedule: Class['schedule']) => {
    return schedule.map(s => `${s.day} ${s.time}`).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">¿Qué clase vas a grabar?</h2>
        <p className="text-zinc-400 text-sm">Selecciona o crea una nueva clase</p>
      </div>

      {/* Clase sugerida */}
      {suggestedClass && (
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
              Sugerida para ahora
            </span>
          </div>
          <button
            onClick={() => onClassSelected(suggestedClass)}
            className="w-full text-left"
          >
            <h3 className="text-white font-bold text-lg">{suggestedClass.name}</h3>
            <p className="text-zinc-300 text-sm">{suggestedClass.professor}</p>
            <p className="text-zinc-400 text-xs mt-1">{formatSchedule(suggestedClass.schedule)}</p>
          </button>
        </div>
      )}

      {/* Lista de clases */}
      <div className="space-y-3">
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => onClassSelected(cls)}
            className="w-full bg-zinc-900/50 hover:bg-zinc-800/50 rounded-xl p-4 border border-zinc-800 transition-all text-left group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: cls.color }}
                  />
                  <h3 className="text-white font-semibold">{cls.name}</h3>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <User className="w-3 h-3" />
                    <span>{cls.professor}</span>
                  </div>
                  
                  {cls.room && (
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <MapPin className="w-3 h-3" />
                      <span>{cls.room}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-zinc-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{formatSchedule(cls.schedule)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
                →
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Botón nueva clase */}
      <button
        onClick={onNewClass}
        className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 border border-white/20 transition-all flex items-center justify-center gap-2 text-white"
      >
        <Plus className="w-5 h-5" />
        <span className="font-semibold">Crear Nueva Clase</span>
      </button>
    </div>
  );
}