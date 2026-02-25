
import { Clock, Calendar, CheckCircle2, ChevronRight, Bookmark } from "lucide-react";
import { Link } from "react-router";
import { CLASSES, TASKS, USER } from "../data/mock";
import { motion } from "motion/react";
import { clsx } from "clsx";

export default function Dashboard() {
  const upcomingTasks = TASKS.filter(t => !t.completed).slice(0, 3);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <header className="mb-8">
        <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">{today}</h2>
        <h1 className="text-2xl font-bold text-gray-900">Hello, {USER.name.split(" ")[0]}</h1>
      </header>

      {/* Upcoming Tasks Section */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Next Up</h3>
          <button className="text-indigo-600 text-xs font-medium hover:underline">See All</button>
        </div>
        
        <div className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide flex gap-4">
          {upcomingTasks.map((task) => {
            const cls = CLASSES.find(c => c.id === task.classId);
            return (
              <motion.div 
                key={task.id}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  "flex-shrink-0 w-64 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden",
                  cls?.color.replace("bg-", "border-l-4 border-")
                )}
              >
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  {cls && <cls.icon size={64} />}
                </div>
                <div>
                  <span className={clsx("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-opacity-20 inline-block mb-2", cls?.color)}>
                    {task.date}
                  </span>
                  <h4 className="font-semibold text-gray-900 line-clamp-2 leading-tight">{task.title}</h4>
                </div>
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Bookmark size={12} />
                  {cls?.name}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Classes Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">My Classes</h3>
        </div>

        <div className="space-y-3">
          {CLASSES.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/class/${cls.id}`} className="block group">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", cls.color)}>
                      <cls.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{cls.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>{cls.time}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>{cls.room}</span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-indigo-600 transition-colors" size={20} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
