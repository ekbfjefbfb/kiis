
import { useParams, Link } from "react-router";
import { ArrowLeft, MapPin, Mail, Phone, Calendar, NotebookPen, ListTodo, Info } from "lucide-react";
import { CLASSES, TASKS } from "../data/mock";
import { useState } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";

export default function ClassDetail() {
  const { id } = useParams();
  const cls = CLASSES.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "tasks">("overview");

  if (!cls) return <div className="p-6 text-center text-gray-500">Class not found</div>;

  const tasks = TASKS.filter(t => t.classId === cls.id);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className={clsx("h-48 relative overflow-hidden flex flex-col justify-end p-6 pb-4", cls.color)}>
        <Link to="/dashboard" className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div className="absolute top-0 right-0 p-6 opacity-20">
          <cls.icon size={120} />
        </div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <span className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1 block">{cls.code || "CS101"}</span>
          <h1 className="text-3xl font-bold text-white mb-2">{cls.name}</h1>
          <div className="flex items-center gap-4 text-white/90 text-sm">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {cls.time}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {cls.room}</span>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10 px-6 pt-2">
        {[
          { id: "overview", label: "Overview", icon: Info },
          { id: "notes", label: "Notes", icon: NotebookPen },
          { id: "tasks", label: "Tasks", icon: ListTodo },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              "flex-1 pb-3 text-sm font-medium transition-colors relative flex items-center justify-center gap-2",
              activeTab === tab.id ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Instructor</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {cls.professor.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{cls.professor}</h4>
                    <p className="text-xs text-gray-500">Professor</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <a href={`mailto:${cls.email}`} className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors">
                    <Mail size={14} /> Email
                  </a>
                  <a href={`tel:${cls.phone}`} className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors">
                    <Phone size={14} /> Call
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Upcoming Dates</h3>
                <div className="space-y-3">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center text-xs font-bold shrink-0">
                      <span className="text-red-500">MAY</span>
                      <span className="text-gray-900 text-sm">12</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Midterm Exam</h4>
                      <p className="text-xs text-gray-500">Chapters 1-5 covered</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center text-xs font-bold shrink-0">
                      <span className="text-indigo-500">JUN</span>
                      <span className="text-gray-900 text-sm">04</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Final Project Due</h4>
                      <p className="text-xs text-gray-500">Submission via portal</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900">My Notes</h3>
                <button className="text-indigo-600 text-sm font-medium hover:underline">+ New Note</button>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium text-gray-900 mb-1">Lecture {i}: Introduction</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    Topics covered: The history of the subject, basic principles, and course expectations. Remember to review the syllabus...
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400">
                    <span>Oct {10 + i}, 2023</span>
                    <span>2 mins read</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "tasks" && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${task.completed ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                      {task.completed && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${task.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-500">Due: {task.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">No tasks for this class.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
