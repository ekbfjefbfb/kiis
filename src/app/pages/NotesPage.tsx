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
    { id: 1, date: "02 MAR", title: "TEOREMA_DE_BAYES_", subject: "MATEMÁTICAS", summary: "Análisis de probabilidades condicionales..." },
    { id: 2, date: "28 FEB", title: "REVOLUCIÓN_INDUSTRIAL_", subject: "HISTORIA", summary: "Impacto socioeconómico en Europa..." },
    { id: 3, date: "25 FEB", title: "LEYES_DE_NEWTON_", subject: "FÍSICA", summary: "Principios de dinámica y estática..." }
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center overflow-x-hidden" style={{ backgroundColor: '#000000' }}>
      <header className="w-full max-w-2xl px-8 pt-16 pb-8 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-30 shrink-0">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-zinc-400" />
        </button>
        <h1 className="text-sm font-black uppercase italic tracking-[0.2em]">Biblioteca_IA_</h1>
        <div className="w-12" />
      </header>

      <main className="w-full max-w-2xl flex-1 px-8 py-8 space-y-12">
        {/* Search Bar Premium */}
        <div className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
            <Search size={18} />
          </div>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR_NOTAS_"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-[28px] py-5 pl-16 pr-6 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all placeholder:text-zinc-700"
          />
        </div>

        {/* Notes List */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-zinc-600 px-4">
            <FileText size={16} className="opacity-40" />
            <span className="text-[11px] font-bold uppercase tracking-[0.7em]">Registros_</span>
          </div>

          <div className="space-y-3">
            {notes.map((note) => (
              <motion.button
                key={note.id}
                onClick={() => navigate(`/note/${note.id}`)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-zinc-900/30 border border-white/[0.03] p-8 rounded-[40px] flex items-center justify-between group active:bg-zinc-800/40 transition-all"
              >
                <div className="flex items-center gap-7">
                  <div className="flex flex-col items-center justify-center space-y-1 opacity-40">
                    <span className="text-[10px] font-black italic text-white leading-none">{note.date.split(' ')[0]}</span>
                    <span className="text-[8px] font-bold text-zinc-500">{note.date.split(' ')[1]}</span>
                  </div>
                  <div className="text-left space-y-2">
                    <h3 className="text-xl font-bold uppercase italic tracking-tight text-white leading-none">{note.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{note.subject}</span>
                      <div className="w-1 h-1 rounded-full bg-zinc-800" />
                      <p className="text-[10px] text-zinc-500 italic truncate max-w-[140px]">{note.summary}</p>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-zinc-800 group-hover:text-zinc-500 transition-all" />
              </motion.button>
            ))}
          </div>
        </section>

        {/* Terminal Sync Indicator */}
        <div className="py-10 flex flex-col items-center opacity-10">
          <Sparkles size={32} />
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] mt-4">Cloud_Archive_Ready_</p>
        </div>
      </main>
    </div>
  );
}
