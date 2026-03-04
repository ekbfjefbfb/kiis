export interface Class {
  id: string;
  name: string;
  professor: string;
  schedule: {
    day: string;
    time: string;
  }[];
  color: string;
  room?: string;
}

export interface Recording {
  id: string;
  classId: string;
  date: string;
  duration: number;
  summary: string;
  tasks: Task[];
  keyPoints: string[];
  notes: string;
  audioUrl?: string;
}

export interface Task {
  id: string;
  text: string;
  dueDate: string;
  priority: 1 | 2 | 3;
  completed: boolean;
  classId: string;
}

export class ClassManager {
  private classes: Class[] = [];
  private recordings: Recording[] = [];
  private tasks: Task[] = [];

  constructor() {
    this.loadData();
  }

  // Gestión de clases
  addClass(classData: Omit<Class, 'id'>): Class {
    const newClass: Class = {
      id: Date.now().toString(),
      ...classData
    };
    this.classes.push(newClass);
    this.saveData();
    return newClass;
  }

  getClasses(): Class[] {
    return this.classes;
  }

  getClassById(id: string): Class | undefined {
    return this.classes.find(c => c.id === id);
  }

  // Sugerir clase basada en horario actual (infalible)
  suggestCurrentClass(): Class | null {
    const now = new Date();
    const currentDay = now.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return this.classes.find(cls => 
      cls.schedule.some(s => {
        const [hours, minutes] = s.time.split(':').map(Number);
        const scheduleMinutes = hours * 60 + minutes;
        // Margen de 15 min antes y hasta 2 horas después (clase promedio)
        return s.day.toLowerCase() === currentDay && 
               currentMinutes >= (scheduleMinutes - 15) && 
               currentMinutes <= (scheduleMinutes + 120);
      })
    ) || null;
  }

  // Gestión de grabaciones
  addRecording(recording: Omit<Recording, 'id'>): Recording {
    const newRecording: Recording = {
      id: Date.now().toString(),
      ...recording
    };
    this.recordings.push(newRecording);
    
    // Agregar tareas automáticamente
    recording.tasks.forEach(task => {
      this.addTask({
        ...task,
        classId: recording.classId
      });
    });
    
    this.saveData();
    return newRecording;
  }

  getRecordingsByClass(classId: string): Recording[] {
    return this.recordings.filter(r => r.classId === classId);
  }

  getAllRecordings(): Recording[] {
    return this.recordings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Gestión de tareas
  addTask(task: Omit<Task, 'id'>): Task {
    const newTask: Task = {
      id: Date.now().toString(),
      ...task
    };
    this.tasks.push(newTask);
    this.saveData();
    return newTask;
  }

  getTasksByClass(classId: string): Task[] {
    return this.tasks.filter(t => t.classId === classId && !t.completed);
  }

  getPendingTasks(): Task[] {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return this.tasks.filter(t => !t.completed)
      .sort((a, b) => {
        // 1. Prioridad por fecha (vencen hoy primero)
        if (a.dueDate === today && b.dueDate !== today) return -1;
        if (a.dueDate !== today && b.dueDate === today) return 1;
        
        // 2. Prioridad numérica (1-3, donde 3 es más alto)
        if (a.priority !== b.priority) return b.priority - a.priority;
        
        // 3. Fecha cronológica
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }

  completeTask(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = true;
      this.saveData();
    }
  }

  // Búsqueda inteligente
  searchInRecordings(query: string): Recording[] {
    const lowerQuery = query.toLowerCase();
    return this.recordings.filter(r => 
      r.summary.toLowerCase().includes(lowerQuery) ||
      r.notes.toLowerCase().includes(lowerQuery) ||
      r.keyPoints.some(kp => kp.toLowerCase().includes(lowerQuery))
    );
  }

  // Estadísticas
  getClassStats(classId: string) {
    const recordings = this.getRecordingsByClass(classId);
    const tasks = this.getTasksByClass(classId);
    
    return {
      totalRecordings: recordings.length,
      totalHours: recordings.reduce((acc, r) => acc + r.duration, 0) / 3600,
      pendingTasks: tasks.length,
      lastRecording: recordings[0]?.date
    };
  }

  // Persistencia
  private saveData(): void {
    localStorage.setItem('classes', JSON.stringify(this.classes));
    localStorage.setItem('recordings', JSON.stringify(this.recordings));
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  private loadData(): void {
    try {
      const classes = localStorage.getItem('classes');
      const recordings = localStorage.getItem('recordings');
      const tasks = localStorage.getItem('tasks');

      if (classes) this.classes = JSON.parse(classes);
      if (recordings) this.recordings = JSON.parse(recordings);
      if (tasks) this.tasks = JSON.parse(tasks);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
}

export const classManager = new ClassManager();