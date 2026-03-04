import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { addClass } from "../data/mock";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddClassModal({ isOpen, onClose, onSuccess }: AddClassModalProps) {
  const [newClassName, setNewClassName] = useState("");
  const [newClassProfessor, setNewClassProfessor] = useState("");

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassProfessor.trim()) return;
    
    addClass({
      name: newClassName,
      professor: newClassProfessor,
      time: "Por definir",
      room: "Por definir",
      email: "",
      phone: "",
      nextTask: "",
      taskDate: ""
    });
    
    setNewClassName("");
    setNewClassProfessor("");
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, y: "100%" }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: "100%" }} 
            className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[32px] z-[70] p-8 pb-12 max-w-md mx-auto shadow-2xl border-t border-white/5"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Nueva Materia</h2>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 active:scale-90 transition-all">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <input 
                type="text" 
                required 
                value={newClassName} 
                onChange={(e) => setNewClassName(e.target.value)} 
                placeholder="NOMBRE DE MATERIA" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase text-white" 
              />
              <input 
                type="text" 
                required 
                value={newClassProfessor} 
                onChange={(e) => setNewClassProfessor(e.target.value)} 
                placeholder="PROFESOR" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase text-white" 
              />
              <button 
                type="submit" 
                className="w-full bg-white text-black rounded-xl py-4 text-lg font-black uppercase italic tracking-tight mt-2 active:scale-95 transition-transform"
              >
                Guardar Materia
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
