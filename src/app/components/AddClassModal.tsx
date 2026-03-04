import { useState } from "react";
import { X, Plus, Clock, MapPin, User, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddClassModal({ isOpen, onClose }: AddClassModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    professor: "",
    room: "",
    time: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En una app real aquí se guardaría en el backend o context
    console.log("Guardando materia:", formData);
    onClose();
    setFormData({ name: "", professor: "", room: "", time: "" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border-t sm:border border-white/10 rounded-t-[40px] sm:rounded-[40px] p-8 pb-12 sm:pb-8 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Nueva Materia</h2>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white/40">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Nombre Materia */}
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors">
                    <BookOpen size={18} />
                  </div>
                  <input
                    required
                    placeholder="Nombre de la Materia"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-[24px] pl-14 pr-6 py-5 text-lg font-bold placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>

                {/* Profesor */}
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    required
                    placeholder="Nombre del Profesor"
                    value={formData.professor}
                    onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-[24px] pl-14 pr-6 py-5 text-lg font-bold placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Aula */}
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors">
                      <MapPin size={18} />
                    </div>
                    <input
                      required
                      placeholder="Aula"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-[24px] pl-14 pr-6 py-5 text-lg font-bold placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>

                  {/* Hora */}
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors">
                      <Clock size={18} />
                    </div>
                    <input
                      required
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-[24px] pl-14 pr-6 py-5 text-lg font-bold placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-16 bg-white text-black rounded-[28px] font-black uppercase italic tracking-tighter text-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                <span>Guardar Materia</span>
                <Plus size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
