import { useState, useEffect } from "react";
import {
  Calendar, ChevronRight, Plus, X, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { CLASSES, addClass } from "../data/mock";
import { notesService, BackendNote } from "../../services/notes.service";

export default function Dashboard() {
  const [recentNotes, setRecentNotes] = useState<BackendNote[]>([]);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassProfessor, setNewClassProfessor] = useState("");

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

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassProfessor.trim()) return;
    addClass({
      name: newClassName, professor: newClassProfessor,
      time: "Por definir", room: "Por definir", email: "", phone: "", nextTask: "", taskDate: ""
    });
    setIsAddingClass(false);
    setNewClassName("");
    setNewClassProfessor("");
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white pb-24 font-sans selection:bg-white/30 overflow-x-hidden">
      {/* Header Compacto - Mobile Scaled */}
      <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-black/80 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Hoy</p>
          <p className="text-sm font-bold text-white/70 tracking-tight mt-0.5">{today}</p>
        </motion.div>
        <Link to="/calendar" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
          <Calendar size={16} />
        </Link>
      </div>

      <div className="px-5 space-y-5 pt-4">
        {/* Acciones (agenda) - lista simple: cada una lleva a una pantalla */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <Link to="/quick-note" className="block">
            <div className="px-4 py-4 flex items-center justify-between active:bg-zinc-800 transition-colors">
              <div>
                <p className="text-[13px] font-black uppercase tracking-tight">Nota rápida</p>
                <p className="text-[10px] text-white/35 font-bold uppercase tracking-[0.2em] mt-1">Graba 10s. Se guarda</p>
              </div>
              <ChevronRight size={16} className="text-white/15" />
            </div>
          </Link>
          <div className="h-px bg-white/5" />
          <Link to="/live" className="block">
            <div className="px-4 py-4 flex items-center justify-between active:bg-zinc-800 transition-colors">
              <div>
                <p className="text-[13px] font-black uppercase tracking-tight">Clase en vivo</p>
                <p className="text-[10px] text-white/35 font-bold uppercase tracking-[0.2em] mt-1">Resumen + agenda</p>
              </div>
              <ChevronRight size={16} className="text-white/15" />
            </div>
          </Link>
          <div className="h-px bg-white/5" />
          <Link to="/chat" className="block">
            <div className="px-4 py-4 flex items-center justify-between active:bg-zinc-800 transition-colors">
              <div>
                <p className="text-[13px] font-black uppercase tracking-tight">Asistente IA</p>
                <p className="text-[10px] text-white/35 font-bold uppercase tracking-[0.2em] mt-1">Habla o escribe</p>
              </div>
              <ChevronRight size={16} className="text-white/15" />
            </div>
          </Link>
        </div>

        {/* Notas recientes (lista, no botones) */}
        <section className="pt-2">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Notas recientes</h3>
            <Link to="/notes" className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Ver</Link>
          </div>
          {recentNotes.length === 0 ? (
            <Link to="/quick-note" className="block bg-zinc-900 border border-white/5 rounded-2xl p-4">
              <p className="text-sm font-black uppercase italic">Graba tu primera nota</p>
              <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest mt-1">Toca para empezar</p>
            </Link>
          ) : (
            <div className="space-y-2">
              {recentNotes.slice(0, 3).map((n) => (
                <Link key={n.id} to={`/note/${n.id}`} className="block">
                  <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold truncate">{n.title || "Nota"}</p>
                      <p className="text-[10px] text-white/30 line-clamp-1">{n.summary || n.transcript || ""}</p>
                    </div>
                    <ChevronRight size={12} className="text-white/10" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Materias (si está vacío: 1 CTA claro) */}
        <section className="pt-2">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Mis Materias</h3>
            <button onClick={() => setIsAddingClass(true)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 active:scale-90 transition-transform"><Plus size={14} /></button>
          </div>
          {CLASSES.length === 0 ? (
            <button
              type="button"
              onClick={() => setIsAddingClass(true)}
              className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-left"
            >
              <p className="text-sm font-black uppercase italic">Crea tu primera materia</p>
              <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest mt-1">Toca para empezar</p>
            </button>
          ) : (
            <div className="space-y-2">
              {CLASSES.map((cls) => (
                <Link key={cls.id} to={`/class/${cls.id}`}>
                  <motion.div whileTap={{ scale: 0.99 }} className="bg-zinc-900/40 rounded-xl p-3 flex items-center gap-3 border border-white/5 active:bg-zinc-800 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <BookOpen size={14} className="text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[13px] uppercase tracking-tight truncate leading-none mb-1">{cls.name}</p>
                      <p className="text-[9px] text-white/20 font-bold uppercase truncate">{cls.professor}</p>
                    </div>
                    <ChevronRight size={10} className="text-white/10" />
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal Nueva Materia - Fit Móvil */}
      <AnimatePresence>
        {isAddingClass && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-40" onClick={() => setIsAddingClass(false)} />
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[24px] z-50 p-6 pb-10 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Nueva Materia</h2>
                <button onClick={() => setIsAddingClass(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateClass} className="space-y-3">
                <input type="text" required value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="NOMBRE" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase" />
                <input type="text" required value={newClassProfessor} onChange={(e) => setNewClassProfessor(e.target.value)} placeholder="PROFESOR" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase" />
                <button type="submit" className="w-full bg-white text-black rounded-xl py-3.5 text-base font-black uppercase italic tracking-tight mt-2 active:scale-95 transition-transform">Guardar</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
