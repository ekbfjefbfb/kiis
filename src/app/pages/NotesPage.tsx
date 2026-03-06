import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  ChevronLeft, Search, FileText, ChevronRight, 
  Sparkles, Plus
} from "lucide-react";

export default function NotesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const notes = [
    { id: 1, date: "02 MAR", title: "Teorema de Bayes", subject: "MATEMÁTICAS", summary: "Análisis de probabilidades condicionales..." },
    { id: 2, date: "28 FEB", title: "Revolución Industrial", subject: "HISTORIA", summary: "Impacto socioeconómico en Europa..." },
    { id: 3, date: "25 FEB", title: "Leyes de Newton", subject: "FÍSICA", summary: "Principios de dinámica y estática..." }
  ];

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      <header className="px-8 pt-16 pb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Mis Notas</h1>
        <button className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full active:bg-white/10 transition-colors">
          <Plus size={24} />
        </button>
      </header>

      <main className="flex-1 flex flex-col px-8 pt-4 overflow-hidden">
        <div className="relative mb-10 group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600">
            <Search size={20} />
          </div>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en el cerebro..."
            className="w-full h-16 bg-zinc-900/40 border border-white/5 rounded-[2rem] pl-16 pr-6 text-lg font-medium focus:outline-none focus:border-white/10 focus:bg-zinc-900/60 transition-all placeholder:text-zinc-700"
          />
        </div>

        <section className="flex-1 overflow-y-auto scrollbar-hide pb-20">
          <div className="space-y-4">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => navigate(`/note/${note.id}`)}
                className="w-full bg-zinc-900/30 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between active:scale-[0.98] active:bg-zinc-900/50 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center justify-center min-w-[48px] h-12 bg-white/5 rounded-2xl">
                    <span className="text-[10px] font-extrabold text-white leading-none">{note.date.split(' ')[0]}</span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter mt-1">{note.date.split(' ')[1]}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-2">{note.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{note.subject}</span>
                      <div className="w-1 h-1 rounded-full bg-zinc-800" />
                      <p className="text-[11px] text-zinc-500 font-medium truncate max-w-[140px]">{note.summary}</p>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-zinc-800" />
              </button>
            ))}
          </div>

          <div className="mt-20 flex flex-col items-center gap-4 opacity-20">
            <Sparkles size={32} strokeWidth={1.5} />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Cerebro Sincronizado</p>
          </div>
        </section>
      </main>
    </div>
  );
}
