import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, Search, FileText, ChevronRight, 
  Sparkles, Calendar, BookOpen
} from "lucide-react";
import { motion } from "motion/react";

export default function NotesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const notes = [
    { id: 1, date: "02 MAR", title: "Teorema de Bayes", subject: "MATEMÁTICAS", summary: "Análisis de probabilidades condicionales..." },
    { id: 2, date: "28 FEB", title: "Revolución Industrial", subject: "HISTORIA", summary: "Impacto socioeconómico en Europa..." },
    { id: 3, date: "25 FEB", title: "Leyes de Newton", subject: "FÍSICA", summary: "Principios de dinámica y estática..." }
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center overflow-x-hidden" style={{ backgroundColor: '#000000' }}>
      <header className="w-full bg-black/80 backdrop-blur-xl z-30 pt-10 pb-6 shrink-0 border-b border-white/5">
        <div className="mobile-container flex-row justify-between items-center">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
          <h1 className="text-sm font-bold uppercase tracking-widest text-zinc-200">Notas</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="mobile-container flex-1 py-8 space-y-10">
        {/* Search Bar Simple */}
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors">
            <Search size={16} />
          </div>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar notas..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-14 pr-4 text-sm font-medium focus:outline-none focus:border-zinc-600 transition-all placeholder:text-zinc-700"
          />
        </div>

        {/* Notes List */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-zinc-600 px-2">
            <FileText size={14} className="opacity-40" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Recientes</span>
          </div>

          <div className="space-y-3">
            {notes.map((note) => (
              <motion.button
                key={note.id}
                onClick={() => navigate(`/note/${note.id}`)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-zinc-900/30 border border-white/[0.03] p-5 rounded-2xl flex items-center justify-between group active:bg-zinc-800/40 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-center justify-center min-w-[40px] opacity-40">
                    <span className="text-[10px] font-bold text-white leading-none">{note.date.split(' ')[0]}</span>
                    <span className="text-[8px] font-medium text-zinc-500">{note.date.split(' ')[1]}</span>
                  </div>
                  <div className="text-left space-y-1">
                    <h3 className="text-base font-bold text-white leading-tight">{note.title.replace(/_/g, '')}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase">{note.subject}</span>
                      <div className="w-1 h-1 rounded-full bg-zinc-800" />
                      <p className="text-[10px] text-zinc-500 italic truncate max-w-[120px]">{note.summary}</p>
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-800" />
              </motion.button>
            ))}
          </div>
        </section>

        {/* Sync Indicator */}
        <div className="py-10 flex flex-col items-center opacity-10">
          <Sparkles size={32} />
          <p className="text-[10px] font-bold uppercase tracking-widest mt-4">Sincronizado</p>
        </div>
      </main>
    </div>
  );
}
