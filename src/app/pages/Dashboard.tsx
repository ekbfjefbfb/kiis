import { useState, useEffect } from "react";
import {
  Calendar, ChevronRight, Plus, BookOpen, Brain, Radio, User, Clock, FileText
} from "lucide-react";
import { Link } from "react-router";
import { CLASSES } from "../data/mock";
import { notesService, BackendNote } from "../../services/notes.service";
import AddClassModal from "../components/AddClassModal";

export default function Dashboard() {
  const [recentNotes, setRecentNotes] = useState<BackendNote[]>([]);
  const [isAddingClass, setIsAddingClass] = useState(false);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long", month: "long", day: "numeric",
  });

  useEffect(() => {
    loadRecentNotes();
  }, []);

  const loadRecentNotes = async () => {
    try {
       const backendNotes = await notesService.listNotes(3, 0);
       setRecentNotes(backendNotes);
    } catch (e) { console.error(e); }
  };

  return (
    <div 
      className="h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col relative"
      style={{ backgroundColor: '#000000', color: '#ffffff' }}
    >
      <header className="px-6 pt-12 pb-6 flex justify-between items-end border-b border-zinc-800 bg-black sticky top-0 z-20 shrink-0">
        <div style={{ opacity: 1, visibility: 'visible' }}>
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.3em] mb-1.5">Hoy_</p>
          <h1 className="text-2xl font-bold uppercase italic tracking-tighter leading-none text-white">{today}</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/calendar" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Calendar size={18} className="text-zinc-400" />
          </Link>
          <Link to="/profile" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <User size={18} className="text-zinc-400" />
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-8 max-w-2xl mx-auto w-full pb-20 space-y-12 bg-black">
        <section className="grid grid-cols-1 gap-4">
          <Link to="/live" className="block">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 flex items-center justify-between relative overflow-hidden" style={{ opacity: 1, visibility: 'visible' }}>
              <div className="absolute top-0 left-0 w-1 h-full bg-white/10" />
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                  <Radio size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold uppercase italic leading-none tracking-tight text-white">Grabar_Ahora</p>
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-2">Captura IA instantánea</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-zinc-600" />
            </div>
          </Link>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3 text-zinc-500">
              <BookOpen size={16} />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] italic">Materias_</h3>
            </div>
            <button 
              onClick={() => setIsAddingClass(true)} 
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500"
              style={{ opacity: 1, visibility: 'visible' }}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {CLASSES.map((cls) => (
              <Link key={cls.id} to={`/class/${cls.id}`} className="block">
                <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-5 flex items-center gap-5 relative overflow-hidden" style={{ opacity: 1, visibility: 'visible' }}>
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold uppercase italic tracking-tighter truncate leading-none mb-1 text-white">{cls.name}</p>
                    <p className="text-[10px] text-zinc-500 font-medium uppercase truncate tracking-[0.2em]">{cls.professor}</p>
                  </div>
                  <ChevronRight size={20} className="text-zinc-600 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3 text-zinc-500">
              <FileText size={16} />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] italic">Recientes_</h3>
            </div>
          </div>
          <div className="space-y-3">
            {recentNotes.length === 0 ? (
              <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[32px] p-10 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700">Sin actividad</p>
              </div>
            ) : (
              recentNotes.slice(0, 2).map((n) => (
                <Link key={n.id} to={`/note/${n.id}`} className="block">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 flex items-center justify-between text-left" style={{ opacity: 1, visibility: 'visible' }}>
                    <div className="min-w-0 flex-1 pr-6">
                      <p className="text-[14px] font-bold uppercase italic truncate tracking-tight text-white leading-none mb-2">{n.title || "Nota"}</p>
                      <p className="text-[11px] text-zinc-500 font-medium truncate italic tracking-tight">{n.summary || "Detalles de sesión"}</p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 shrink-0" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>

      <AddClassModal 
        isOpen={isAddingClass} 
        onClose={() => setIsAddingClass(false)} 
      />
    </div>
  );
}
