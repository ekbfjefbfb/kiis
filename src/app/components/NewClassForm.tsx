import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Class, classManager } from '../../services/class-manager';

interface NewClassFormProps {
  onBack: () => void;
  onClassCreated: (newClass: Class) => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

const DAYS = [
  'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
];

export default function NewClassForm({ onBack, onClassCreated }: NewClassFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    professor: '',
    room: '',
    color: COLORS[0],
    schedule: [{ day: 'lunes', time: '09:00' }]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.professor.trim()) {
      alert('Nombre de clase y profesor son obligatorios');
      return;
    }

    const newClass = classManager.addClass({
      name: formData.name.trim(),
      professor: formData.professor.trim(),
      room: formData.room.trim() || undefined,
      color: formData.color,
      schedule: formData.schedule
    });

    onClassCreated(newClass);
  };

  const addScheduleSlot = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: 'lunes', time: '09:00' }]
    }));
  };

  const updateScheduleSlot = (index: number, field: 'day' | 'time', value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const removeScheduleSlot = (index: number) => {
    if (formData.schedule.length > 1) {
      setFormData(prev => ({
        ...prev,
        schedule: prev.schedule.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Nueva Clase</h2>
          <p className="text-zinc-400 text-sm">Configura los detalles de tu clase</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre de la clase */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Nombre de la clase *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="ej. Matemáticas Avanzadas"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-white focus:outline-none"
            required
          />
        </div>

        {/* Profesor */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Profesor *
          </label>
          <input
            type="text"
            value={formData.professor}
            onChange={(e) => setFormData(prev => ({ ...prev, professor: e.target.value }))}
            placeholder="ej. Dr. García López"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-white focus:outline-none"
            required
          />
        </div>

        {/* Aula (opcional) */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Aula (opcional)
          </label>
          <input
            type="text"
            value={formData.room}
            onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
            placeholder="ej. Aula 205"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-white focus:outline-none"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-3">
            Color identificativo
          </label>
          <div className="flex gap-3">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color }))}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.color === color ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Horarios */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-3">
            Horarios de clase
          </label>
          <div className="space-y-3">
            {formData.schedule.map((slot, index) => (
              <div key={index} className="flex gap-3 items-center">
                <select
                  value={slot.day}
                  onChange={(e) => updateScheduleSlot(index, 'day', e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-white focus:outline-none"
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
                
                <input
                  type="time"
                  value={slot.time}
                  onChange={(e) => updateScheduleSlot(index, 'time', e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-white focus:outline-none"
                />
                
                {formData.schedule.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScheduleSlot(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addScheduleSlot}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              + Agregar otro horario
            </button>
          </div>
        </div>

        {/* Botón guardar */}
        <button
          type="submit"
          className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
        >
          <Save className="w-5 h-5" />
          Crear Clase
        </button>
      </form>
    </div>
  );
}