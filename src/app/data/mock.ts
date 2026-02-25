import { BookOpen, Calculator, FlaskConical, History, Languages } from "lucide-react";

export let USER = {
  name: "Alex Morgan",
  email: "alex.morgan@estudiante.edu",
  phone: "+52 555 123-4567",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
};

export const updateUser = (data: Partial<typeof USER>) => {
  USER = { ...USER, ...data };
};

// Lo hacemos let para poder modificarlo dinámicamente en esta sesión (hasta refrescar)
export let CLASSES = [
  {
    id: "1",
    name: "Matemáticas Avanzadas",
    professor: "Dra. Sarah Cohen",
    email: "scohen@uni.edu",
    phone: "555-0101",
    time: "Lun, Mié 10:00 AM",
    room: "Aula 301",
    color: "bg-blue-50 text-blue-700",
    icon: Calculator,
    nextTask: "Cuestionario de Cálculo",
    taskDate: "Mañana",
    importantTopics: ["Derivadas", "Integrales", "Regla de la Cadena", "Límites"],
  },
  {
    id: "2",
    name: "Historia Mundial",
    professor: "Prof. James Miller",
    email: "jmiller@uni.edu",
    phone: "555-0102",
    time: "Mar, Jue 2:00 PM",
    room: "Sala B",
    color: "bg-amber-50 text-amber-700",
    icon: History,
    nextTask: "Ensayo: Revolución Industrial",
    taskDate: "Vie, 12",
    importantTopics: ["Revolución Industrial", "Primera Guerra Mundial", "Guerra Fría"],
  },
  {
    id: "3",
    name: "Física 101",
    professor: "Dra. Emily Chen",
    email: "echen@uni.edu",
    phone: "555-0103",
    time: "Lun, Mié 1:00 PM",
    room: "Laboratorio 4",
    color: "bg-purple-50 text-purple-700",
    icon: FlaskConical,
    nextTask: "Reporte de Laboratorio",
    taskDate: "Lunes sig.",
    importantTopics: ["Leyes de Newton", "Cinemática", "Conservación de Energía"],
  },
  {
    id: "4",
    name: "Literatura",
    professor: "Mtra. Laura Wilson",
    email: "lwilson@uni.edu",
    phone: "555-0104",
    time: "Vie 10:00 AM",
    room: "Aula 204",
    color: "bg-emerald-50 text-emerald-700",
    icon: BookOpen,
    nextTask: "Leer Capítulos 4-5",
    taskDate: "Mié, 10",
    importantTopics: ["Cervantes", "Modernismo", "Análisis Literario"],
  },
];

export const addClass = (newClass: Omit<typeof CLASSES[0], "id" | "color" | "icon" | "importantTopics">) => {
  const id = Date.now().toString();
  const color = "bg-indigo-50 text-indigo-700"; // Default color
  const importantTopics: string[] = []; // Empieza sin temas
  CLASSES.push({ ...newClass, id, color, icon: BookOpen, importantTopics });
};

export const removeClass = (id: string) => {
  const index = CLASSES.findIndex(c => c.id === id);
  if (index !== -1) {
    CLASSES.splice(index, 1);
  }
};

export const TASKS = [
  { id: 1, title: "Cuestionario de Cálculo", classId: "1", date: "2026-02-26", completed: false },
  { id: 2, title: "Leer Capítulos 4-5", classId: "4", date: "2026-03-10", completed: true },
  { id: 3, title: "Reporte de Laboratorio", classId: "3", date: "2026-03-03", completed: false },
  { id: 4, title: "Ensayo: Revolución Industrial", classId: "2", date: "2026-03-12", completed: false },
  { id: 5, title: "Ejercicios Set 7", classId: "1", date: "2026-03-05", completed: false },
];

export const EXAMS = [
  { id: 1, title: "Parcial - Derivadas e Integrales", classId: "1", date: "2026-03-07", type: "exam" as const },
  { id: 2, title: "Examen de Ensayo de Historia", classId: "2", date: "2026-03-14", type: "exam" as const },
  { id: 3, title: "Examen Final Práctico Física", classId: "3", date: "2026-03-20", type: "exam" as const },
];

export const addExam = (exam: { title: string; classId: string; date: string }) => {
  EXAMS.push({ id: Date.now(), ...exam, type: "exam" });
};

export const removeExam = (id: number) => {
  const index = EXAMS.findIndex(e => e.id === id);
  if (index !== -1) {
    EXAMS.splice(index, 1);
  }
};

export const IMPORTANT_DATES = [
  { id: 1, title: "Límite de Inscripción", date: "2026-03-01", category: "academic" as const },
  { id: 2, title: "Inicio Vacaciones de Primavera", date: "2026-03-16", category: "holiday" as const },
];

export const AI_SUMMARIES = [
  {
    classId: "1",
    summary: "Hoy cubrimos la regla de la cadena para derivadas de funciones compuestas. Fórmula clave: d/dx[f(g(x))] = f'(g(x)) · g'(x). Tarea del capítulo 5.",
    date: "2026-02-25",
  },
  {
    classId: "2",
    summary: "Se discutieron los impactos socioeconómicos de la Revolución Industrial incluyendo urbanización, movimientos laborales e innovación. El ensayo es para el viernes.",
    date: "2026-02-24",
  },
];
