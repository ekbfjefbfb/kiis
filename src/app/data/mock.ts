
import { BookOpen, Calculator, FlaskConical, History, Languages } from "lucide-react";

export const USER = {
  name: "Alex Morgan",
  email: "alex.morgan@student.edu",
  phone: "+1 (555) 123-4567",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
};

export const CLASSES = [
  {
    id: "1",
    name: "Advanced Mathematics",
    professor: "Dr. Sarah Cohen",
    email: "scohen@uni.edu",
    phone: "555-0101",
    time: "Mon, Wed 10:00 AM",
    room: "Room 301",
    color: "bg-blue-50 text-blue-700",
    icon: Calculator,
    nextTask: "Calculus Quiz",
    taskDate: "Tomorrow",
    importantTopics: ["Derivatives", "Integrals", "Chain Rule", "Limits"],
  },
  {
    id: "2",
    name: "World History",
    professor: "Prof. James Miller",
    email: "jmiller@uni.edu",
    phone: "555-0102",
    time: "Tue, Thu 2:00 PM",
    room: "Hall B",
    color: "bg-amber-50 text-amber-700",
    icon: History,
    nextTask: "Essay: Industrial Revolution",
    taskDate: "Fri, 12th",
    importantTopics: ["Industrial Revolution", "World War I", "Cold War"],
  },
  {
    id: "3",
    name: "Physics 101",
    professor: "Dr. Emily Chen",
    email: "echen@uni.edu",
    phone: "555-0103",
    time: "Mon, Wed 1:00 PM",
    room: "Lab 4",
    color: "bg-purple-50 text-purple-700",
    icon: FlaskConical,
    nextTask: "Lab Report",
    taskDate: "Next Mon",
    importantTopics: ["Newton's Laws", "Kinematics", "Energy Conservation"],
  },
  {
    id: "4",
    name: "English Literature",
    professor: "Ms. Laura Wilson",
    email: "lwilson@uni.edu",
    phone: "555-0104",
    time: "Fri 10:00 AM",
    room: "Room 204",
    color: "bg-emerald-50 text-emerald-700",
    icon: BookOpen,
    nextTask: "Read Chapter 4-5",
    taskDate: "Wed, 10th",
    importantTopics: ["Shakespeare", "Modernism", "Literary Analysis"],
  },
];

export const TASKS = [
  { id: 1, title: "Calculus Quiz", classId: "1", date: "2026-02-26", completed: false },
  { id: 2, title: "Read Chapter 4-5", classId: "4", date: "2026-03-10", completed: true },
  { id: 3, title: "Lab Report", classId: "3", date: "2026-03-03", completed: false },
  { id: 4, title: "Essay: Industrial Revolution", classId: "2", date: "2026-03-12", completed: false },
  { id: 5, title: "Homework Set 7", classId: "1", date: "2026-03-05", completed: false },
  { id: 6, title: "Reading Response", classId: "4", date: "2026-03-15", completed: false },
];

export const EXAMS = [
  { id: 1, title: "Midterm - Derivatives & Integrals", classId: "1", date: "2026-03-07", type: "exam" as const },
  { id: 2, title: "History Essay Exam", classId: "2", date: "2026-03-14", type: "exam" as const },
  { id: 3, title: "Physics Lab Final", classId: "3", date: "2026-03-20", type: "exam" as const },
  { id: 4, title: "Literature Analysis Exam", classId: "4", date: "2026-03-25", type: "exam" as const },
];

export const IMPORTANT_DATES = [
  { id: 1, title: "Registration Deadline", date: "2026-03-01", category: "academic" as const },
  { id: 2, title: "Spring Break Starts", date: "2026-03-16", category: "holiday" as const },
  { id: 3, title: "Project Proposals Due", date: "2026-03-08", category: "deadline" as const },
  { id: 4, title: "Guest Speaker: AI in Education", date: "2026-03-04", category: "event" as const },
];

export const AI_SUMMARIES = [
  {
    classId: "1",
    summary: "Today's class covered the chain rule for derivatives of composite functions. Key formula: d/dx[f(g(x))] = f'(g(x)) · g'(x). Practice problems assigned from Chapter 5.",
    date: "2026-02-25",
  },
  {
    classId: "2",
    summary: "Discussed the socioeconomic impacts of the Industrial Revolution including urbanization, labor movements, and technological innovation. Essay due Friday on the topic.",
    date: "2026-02-24",
  },
  {
    classId: "3",
    summary: "Lab session on Newton's Second Law. Measured acceleration with different masses on an air track. Results showed F=ma within 5% error margin.",
    date: "2026-02-24",
  },
];

export const CHAT_HISTORY = [
  { id: 1, sender: "ai", text: "Hello Alex! How can I help you with your studies today?" },
  { id: 2, sender: "user", text: "I need help summarizing the key points of the Industrial Revolution." },
  { id: 3, sender: "ai", text: "Sure! The Industrial Revolution was a period of major industrialization that took place during the late 1700s and early 1800s. Key points include:\n\n1. Shift from hand tools to power machinery.\n2. Rise of the factory system.\n3. Urbanization as people moved to cities.\n4. Expansion of transportation (steam engine, railways)." },
];
