
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
  },
];

export const TASKS = [
  { id: 1, title: "Calculus Quiz", classId: "1", date: "Tomorrow", completed: false },
  { id: 2, title: "Read Chapter 4-5", classId: "4", date: "Wed, 10th", completed: true },
  { id: 3, title: "Lab Report", classId: "3", date: "Next Mon", completed: false },
  { id: 4, title: "Essay: Industrial Revolution", classId: "2", date: "Fri, 12th", completed: false },
];

export const CHAT_HISTORY = [
  { id: 1, sender: "ai", text: "Hello Alex! How can I help you with your studies today?" },
  { id: 2, sender: "user", text: "I need help summarizing the key points of the Industrial Revolution." },
  { id: 3, sender: "ai", text: "Sure! The Industrial Revolution was a period of major industrialization that took place during the late 1700s and early 1800s. Key points include:\n\n1. Shift from hand tools to power machinery.\n2. Rise of the factory system.\n3. Urbanization as people moved to cities.\n4. Expansion of transportation (steam engine, railways)." },
];
