import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  ArrowLeft, Share2, Download, Sparkles, 
  BookOpen, Calendar, Zap, ListChecks, FileText
} from "lucide-react";
import { motion } from "motion/react";

export default function NoteDetail() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  
  const note = {
    title: "TEOREMA_DE_BAYES_",
    subject: "MATEMÁTICAS",
    date: "02 MARZO 2026",
    content: "El teorema de Bayes, en la teoría de la probabilidad, es una proposición planteada por el filósofo inglés Thomas Bayes (1702-1761) y publicada póstumamente en 1763, que expresa la probabilidad condicional de un evento aleatorio A dado B en términos de la distribución de probabilidad condicional del evento B dado A y la distribución de probabilidad marginal de solo A.",
    summary: "Fórmula fundamental para calcular probabilidades condicionales basándose en conocimientos previos.",
    tasks: [
      { id: 1, title: "Resolver ejercicios de probabilidad", completed: false },
      { id: 2, title: "Repasar distribución marginal", completed: true }
    ]
  };

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white font-sans flex flex-col items-center overflow-x-hidden" style={{ backgroundColor: '#000000' }}>
      <header className="w-full max-w-2xl px-8 pt-16 pb-8 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-30 shrink-0">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-zinc-400" />
        </button>
        <div className="flex gap-3">
          <button className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
            <Share2 size={18} className="text-zinc-400" />
          </button>
          <button className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-all">
            <Download size={18} className="text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl flex-1 px-8 py-8 space-y-12">
        {/* Note Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-2">
              <BookOpen size={10} className="text-zinc-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{note.subject}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-2">
              <Calendar size={10} className="text-zinc-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{note.date}</span>
            </div>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">{note.title}</h1>
        </div>

        {/* AI Summary Card */}
        <section>
          <div className="bg-white text-black p-8 rounded-[48px] space-y-6 shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3">
              <Sparkles size={18} fill="black" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em]">SÍNTESIS_IA_</span>
            </div>
            <p className="text-lg font-bold italic tracking-tight leading-tight">{note.summary}</p>
          </div>
        </section>

        {/* Main Content */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-zinc-600 px-4">
            <FileText size={16} className="opacity-40" />
            <span className="text-[11px] font-bold uppercase tracking-[0.7em]">Transcripción_</span>
          </div>
          <div className="bg-zinc-900/30 border border-white/[0.03] p-8 rounded-[40px]">
            <p className="text-zinc-400 leading-relaxed text-sm italic">{note.content}</p>
          </div>
        </section>

        {/* Tasks Section */}
        <section className="space-y-6 pb-12">
          <div className="flex items-center gap-3 text-zinc-600 px-4">
            <ListChecks size={16} className="opacity-40" />
            <span className="text-[11px] font-bold uppercase tracking-[0.7em]">Acciones_IA_</span>
          </div>
          <div className="space-y-3">
            {note.tasks.map((task) => (
              <div 
                key={task.id}
                className="w-full bg-zinc-900/30 border border-white/[0.03] p-6 rounded-[36px] flex items-center gap-5"
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-white border-white' : 'border-zinc-800'}`}>
                  {task.completed && <Zap size={14} className="text-black" fill="currentColor" />}
                </div>
                <span className={`text-sm font-bold uppercase tracking-tight ${task.completed ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
