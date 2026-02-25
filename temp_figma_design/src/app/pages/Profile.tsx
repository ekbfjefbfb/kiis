
import { User, Mail, Phone, Settings, Bell, Moon, LogOut, ChevronRight, HelpCircle } from "lucide-react";
import { USER } from "../data/mock";
import { Link } from "react-router";
import { motion } from "motion/react";

export default function ProfilePage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="bg-white p-6 pt-10 pb-8 rounded-b-3xl shadow-sm border-b border-gray-100 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-4"
        >
          <div className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-inner overflow-hidden">
            <img src={USER.avatar} alt={USER.name} className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-md">
            <Settings size={14} />
          </button>
        </motion.div>
        
        <h2 className="text-xl font-bold text-gray-900">{USER.name}</h2>
        <p className="text-sm text-gray-500">Computer Science Student</p>
        
        <div className="flex gap-3 mt-6 w-full">
          <div className="flex-1 bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 border border-gray-100">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Avg Grade</span>
            <span className="text-lg font-bold text-gray-900">3.8</span>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 border border-gray-100">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Tasks Done</span>
            <span className="text-lg font-bold text-gray-900">24</span>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 border border-gray-100">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Classes</span>
            <span className="text-lg font-bold text-gray-900">6</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Contact Info</h3>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center gap-4 border-b border-gray-50">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Mail size={16} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900 truncate">{USER.email}</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Phone size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{USER.phone}</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Settings</h3>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {[
              { icon: Bell, label: "Notifications", toggle: true },
              { icon: Moon, label: "Dark Mode", toggle: true },
              { icon: HelpCircle, label: "Help & Support" },
            ].map((item, i) => (
              <button key={i} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                </div>
                {item.toggle ? (
                  <div className={`w-9 h-5 rounded-full relative transition-colors ${i === 0 ? "bg-indigo-600" : "bg-gray-200"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${i === 0 ? "translate-x-4" : "translate-x-0.5"} left-0.5`} />
                  </div>
                ) : (
                  <ChevronRight size={18} className="text-gray-300" />
                )}
              </button>
            ))}
            <Link to="/" className="w-full p-4 flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600">
              <LogOut size={18} />
              <span className="text-sm font-medium">Log Out</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
