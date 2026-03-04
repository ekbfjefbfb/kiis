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
    <div className="min-h-[100dvh] bg-black text-white flex flex-col">
      {/* Header simple */}
      <header className="px-6 pt-12 pb-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center active:opacity-50"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">{className}</h1>
      </header>

      {/* Tareas */}
      <main className="flex-1 px-6 pt-8">
        {tasks.length > 0 ? (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div key={task.id}>
                <p className="text-white text-lg">{task.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-600 text-lg">Sin tareas pendientes</p>
        )}
      </main>

      {/* Botón grabar */}
      <footer className="px-6 pb-8 pt-4">
        <button 
          onClick={() => navigate("/live")}
          className="w-full h-16 bg-white text-black rounded-2xl font-semibold text-lg active:scale-95 transition-transform"
        >
          Grabar clase
        </button>
      </footer>
    </div>
  );
}
