import { LogOut, Settings, User as UserIcon, Bell, Moon, ChevronRight, Mail, Phone, Book, Camera } from "lucide-react";
import { Link } from "react-router";
import { USER, CLASSES, updateUser } from "../data/mock";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { useState } from "react";

export default function Profile() {
  const [avatar, setAvatar] = useState(USER.avatar);

  const stats = [
    { label: "Cursos", value: CLASSES.length.toString(), icon: Book, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Promedio", value: "A", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Asist.", value: "98%", icon: UserIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Imagen demasiado grande (máx 5MB)");
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatar(result);
        updateUser({ avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header Profile Cover */}
      <div className="bg-white px-5 pt-8 pb-6 border-b border-gray-100/60 sticky top-0 z-10 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 relative group">
            {avatar ? (
              <img src={avatar} alt={USER.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={40} className="text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
            <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={24} className="text-white mb-1" />
              <span className="text-[10px] text-white font-medium">Cambiar</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 leading-tight">{USER.name}</h1>
        <p className="text-sm text-gray-500 font-medium">Estudiante Universitario</p>
      </div>

      <div className="px-5 pt-5 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.95 }}
              className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center border border-gray-100 shadow-sm"
            >
              <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center mb-2", s.bg, s.color)}>
                <s.icon size={16} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{s.label}</span>
              <span className="text-lg font-bold text-gray-900 leading-none">{s.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
              <Mail size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Correo</p>
              <p className="text-sm font-medium text-gray-900 truncate">{USER.email}</p>
            </div>
          </div>
          <div className="h-px bg-gray-50 mx-4" />
          <div className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
              <Phone size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Teléfono</p>
              <p className="text-sm font-medium text-gray-900 truncate">{USER.phone || "No especificado"}</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
          <Link to="/settings/account" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Settings size={18} />
              </div>
              <span className="text-sm font-medium text-gray-900">Configuración de Cuenta</span>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
          </Link>
          
          <div className="h-px bg-gray-50 mx-4" />
          
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Bell size={18} />
              </div>
              <span className="text-sm font-medium text-gray-900">Notificaciones Push</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="h-px bg-gray-50 mx-4" />

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                <Moon size={18} />
              </div>
              <span className="text-sm font-medium text-gray-900">Modo Oscuro</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800"></div>
            </label>
          </div>
        </div>

        {/* Logout */}
        <Link 
          to="/login"
          className="w-full bg-white border border-red-100 p-4 rounded-2xl flex items-center justify-center gap-2 text-red-600 font-semibold shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors active:scale-[0.98]"
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span>Cerrar Sesión</span>
        </Link>
        
        <p className="text-center text-[10px] font-semibold text-gray-400 tracking-widest uppercase mt-8 mb-4">
          Notdeer App v1.0.0
        </p>
      </div>
    </div>
  );
}

import { Star } from "lucide-react";
