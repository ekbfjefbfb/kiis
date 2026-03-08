import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { classManager, Task } from "../../services/class-manager";

export default function ClassDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [className, setClassName] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (classId) {
      const cls = classManager.getClassById(classId);
      if (cls) {
        setClassName(cls.name);
        const pending = classManager.getPendingTasks().filter(t => t.classId === classId);
        setTasks(pending);
      }
    }
  }, [classId]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] overflow-hidden">
      {/* Header */}
      <header className="px-8 pt-16 pb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white">{className}</h1>
      </header>

      {/* Tareas */}
      <main className="flex-1 px-8 pt-4 overflow-y-auto scrollbar-hide">
        {tasks.length > 0 ? (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6">
                <p className="text-white text-lg font-medium">{task.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-zinc-600 text-lg">Sin tareas pendientes</p>
          </div>
        )}
      </main>

      {/* Botón grabar */}
      <footer className="p-8">
        <button 
          onClick={() => navigate("/live")}
          className="w-full h-20 bg-white text-black rounded-[2.5rem] font-black text-lg active:scale-[0.96] transition-all duration-500 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center"
          aria-label="Grabar clase"
        >
          <span>Grabar clase</span>
        </button>
      </footer>
    </div>
  );
}
