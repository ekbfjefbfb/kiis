import { LogOut, Settings, User as UserIcon, Bell, Moon, Sun, ChevronRight, Mail, Phone, Book, Camera, Star } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { CLASSES } from "../data/mock";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { authService } from "../../services/auth.service";
import { themeService } from "../../services/theme.service";

function loadProfileData() {
  const stored = localStorage.getItem('user_profile');
  if (stored) {
    try { return JSON.parse(stored); } catch { /* ignore */ }
  }
  const authUser = authService.getCurrentUser();
  return {
    name: authUser?.displayName || authUser?.email?.split('@')[0] || "Estudiante",
    email: authUser?.email || "Sin email",
    phone: localStorage.getItem('user_phone') || "",
    avatar: authUser?.photoURL || localStorage.getItem('user_avatar') || null,
  };
}

function saveProfileData(data: { name?: string; email?: string; phone?: string; avatar?: string | null }) {
  const current = loadProfileData();
  const updated = { ...current, ...data };
  localStorage.setItem('user_profile', JSON.stringify(updated));
  if (data.avatar) localStorage.setItem('user_avatar', data.avatar);
  if (data.phone) localStorage.setItem('user_phone', data.phone);
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(loadProfileData());
  const [showEditName, setShowEditName] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [isDark, setIsDark] = useState(themeService.isDark());
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    return themeService.onChange((dark) => setIsDark(dark));
  }, []);

  const stats = [
    { label: "Cursos", value: CLASSES.length.toString(), icon: Book, color: "var(--primary)", bg: "var(--primary-light)" },
    { label: "Promedio", value: "A", icon: Star, color: "var(--warning)", bg: "var(--warning-light)" },
    { label: "Asist.", value: "98%", icon: UserIcon, color: "var(--success)", bg: "var(--success-light)" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Imagen demasiado grande (máx 5MB)");
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        saveProfileData({ avatar: result });
        setProfile({ ...profile, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    if (editName.trim()) {
      saveProfileData({ name: editName.trim() });
      setProfile({ ...profile, name: editName.trim() });
      setShowEditName(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const toggleDarkMode = () => {
    themeService.toggle();
  };

  return (
    <div className="min-h-screen pb-4" style={{ background: "var(--bg-secondary)" }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-6 flex flex-col items-center" style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border-primary)" }}>
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full border-4 shadow-xl overflow-hidden relative group" 
               style={{ borderColor: "var(--bg-primary)", background: "var(--bg-tertiary)" }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            )}
            <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={24} className="text-white mb-1" />
              <span className="text-[10px] text-white font-medium">Cambiar</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--success)", borderColor: "var(--bg-primary)", borderWidth: 2 }}>
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
        
        {showEditName ? (
          <div className="flex items-center gap-2 w-full max-w-[200px]">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 text-center rounded-xl py-1.5 px-3 text-sm focus:outline-none"
              style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            />
            <button onClick={handleSaveName} style={{ color: "var(--primary)" }} className="text-xs font-bold">OK</button>
          </div>
        ) : (
          <button onClick={() => setShowEditName(true)} className="group">
            <h1 className="text-xl font-bold leading-tight transition-colors" style={{ color: "var(--text-primary)" }}>
              {profile.name}
            </h1>
          </button>
        )}
        <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>Estudiante Universitario</p>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.95 }}
              className="p-4 rounded-2xl flex flex-col items-center justify-center card-premium"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: s.bg, color: s.color }}>
                <s.icon size={16} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-tertiary)" }}>{s.label}</span>
              <span className="text-lg font-bold leading-none" style={{ color: "var(--text-primary)" }}>{s.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="rounded-2xl p-2 card-premium">
          <div className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}>
              <Mail size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-tertiary)" }}>Correo</p>
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{profile.email}</p>
            </div>
          </div>
          <div className="h-px mx-4" style={{ background: "var(--border-secondary)" }} />
          <div className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}>
              <Phone size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-tertiary)" }}>Teléfono</p>
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{profile.phone || "No especificado"}</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl p-2 card-premium">
          {/* Dark Mode Toggle — FUNCIONAL */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
                   style={{ background: isDark ? "rgba(129, 140, 248, 0.15)" : "#f1f5f9", color: isDark ? "var(--primary)" : "#475569" }}>
                {isDark ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {isDark ? "Modo Oscuro" : "Modo Claro"}
                </span>
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  {isDark ? "Activado" : "Desactivado"}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={clsx("toggle-switch", isDark && "active")}
              aria-label="Toggle dark mode"
            />
          </div>

          <div className="h-px mx-4" style={{ background: "var(--border-secondary)" }} />

          {/* Notifications */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--success-light)", color: "var(--success)" }}>
                <Bell size={18} />
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Notificaciones</span>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={clsx("toggle-switch", notifications && "active")}
              aria-label="Toggle notifications"
            />
          </div>

          <div className="h-px mx-4" style={{ background: "var(--border-secondary)" }} />

          {/* Settings link */}
          <div className="flex items-center justify-between p-3 group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                <Settings size={18} />
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Configuración</span>
            </div>
            <ChevronRight size={18} style={{ color: "var(--text-tertiary)" }} />
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full p-4 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-colors active:scale-[0.98]"
          style={{ 
            background: "var(--danger-light)", 
            color: "var(--danger)", 
            border: "1px solid var(--border-primary)" 
          }}
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span>Cerrar Sesión</span>
        </button>
        
        <p className="text-center text-[10px] font-semibold tracking-widest uppercase mt-8 mb-4" style={{ color: "var(--text-tertiary)" }}>
          Notdeer App v1.0.0
        </p>
      </div>
    </div>
  );
}
