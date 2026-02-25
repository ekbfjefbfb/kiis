
import { User, Mail, Phone, Settings, Bell, Moon, LogOut, ChevronRight, HelpCircle, BookOpen, Award, CheckSquare } from "lucide-react";
import { USER, CLASSES, TASKS } from "../data/mock";
import { Link } from "react-router";
import { motion } from "motion/react";

export default function ProfilePage() {
  const completedTasks = TASKS.filter(t => t.completed).length;
  const totalTasks = TASKS.length;

  return (
    <div className="bg-gray-50 min-h-screen pb-4">
      {/* Profile Header */}
      <div className="bg-white px-5 pt-8 pb-6 border-b border-gray-100/60">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-2xl border-3 border-indigo-100 shadow-sm overflow-hidden">
              <img src={USER.avatar} alt={USER.name} className="w-full h-full object-cover" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-xl border-2 border-white flex items-center justify-center text-white shadow-md active:bg-indigo-700">
              <Settings size={13} />
            </button>
          </div>

          <h2 className="text-lg font-bold text-gray-900">{USER.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Computer Science Student</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-0.5 border border-gray-100">
            <Award size={14} className="text-indigo-500 mb-0.5" />
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">GPA</span>
            <span className="text-lg font-bold text-gray-900">3.8</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-0.5 border border-gray-100">
            <CheckSquare size={14} className="text-emerald-500 mb-0.5" />
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Tasks</span>
            <span className="text-lg font-bold text-gray-900">{completedTasks}/{totalTasks}</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-0.5 border border-gray-100">
            <BookOpen size={14} className="text-blue-500 mb-0.5" />
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Classes</span>
            <span className="text-lg font-bold text-gray-900">{CLASSES.length}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Contact Info */}
        <section>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 px-1">
            Contact Info
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-4 flex items-center gap-3.5 border-b border-gray-50">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Mail size={14} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] text-gray-400 font-medium">Email</p>
                <p className="text-sm font-medium text-gray-900 truncate">{USER.email}</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Phone size={14} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-medium">Phone</p>
                <p className="text-sm font-medium text-gray-900">{USER.phone}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Settings */}
        <section>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 px-1">
            Settings
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
            {[
              { icon: Bell, label: "Notifications", toggleState: true },
              { icon: Moon, label: "Dark Mode", toggleState: false },
              { icon: HelpCircle, label: "Help & Support" },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full min-h-[52px] p-4 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                </div>
                {"toggleState" in item ? (
                  <div
                    className={`w-10 h-[22px] rounded-full relative transition-colors ${
                      item.toggleState ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        item.toggleState ? "translate-x-[22px]" : "translate-x-[3px]"
                      }`}
                    />
                  </div>
                ) : (
                  <ChevronRight size={16} className="text-gray-300" />
                )}
              </button>
            ))}

            <Link
              to="/"
              className="w-full min-h-[52px] p-4 flex items-center gap-3 hover:bg-red-50 transition-colors text-red-500 active:bg-red-100"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Sign Out</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
