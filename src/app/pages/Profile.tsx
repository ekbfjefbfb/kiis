import { LogOut, Settings, User as UserIcon, Bell, Moon, Sun, ChevronRight, Mail, Phone, Book, Camera, Star } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { CLASSES } from "../data/mock";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { authService } from "../../services/auth.service";
import { themeService } from "../../services/theme.service";
import { profileService, UserProfile } from "../../services/profile.service";

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
  const [backendProfile, setBackendProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditName, setShowEditName] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [isDark, setIsDark] = useState(themeService.isDark());
  const [notifications, setNotifications] = useState(true);

  // Cargar perfil del backend al montar
  useEffect(() => {
    const loadBackendProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setBackendProfile(data);
        // Actualizar perfil local con datos del backend
        setProfile({
          name: data.name || data.username || profile.name,
          email: data.email || profile.email,
          phone: profile.phone,
          avatar: data.avatar_url || profile.avatar,
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        // Si falla, usar datos locales
      } finally {
        setLoading(false);
      }
    };

    if (authService.isAuthenticated()) {
      loadBackendProfile();
    } else {
      // Modo anónimo - usar datos locales
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return themeService.onChange((dark) => setIsDark(dark));
  }, []);

  const stats = [
    { label: "Cursos", value: CLASSES.length.toString(), icon: Book, color: "var(--primary)", bg: "var(--primary-light)" },
    { label: "Promedio", value: "A", icon: Star, color: "var(--warning)", bg: "var(--warning-light)" },
    { label: "Plan", value: backendProfile?.plan_id === 1 ? "Free" : "Pro", icon: UserIcon, color: "var(--success)", bg: "var(--success-light)" },
  ];

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Imagen demasiado grande (máx 5MB)");
      
      try {
        // Subir al backend
        const response = await profileService.uploadAvatar(file);
        setProfile({ ...profile, avatar: response.url });
        saveProfileData({ avatar: response.url });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        // Fallback: guardar localmente
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          saveProfileData({ avatar: result });
          setProfile({ ...profile, avatar: result });
        };
        reader.readAsDataURL(file);
      }
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
    <div className="min-h-[100dvh] bg-background text-foreground pb-24 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="px-5 pt-12 pb-8 flex flex-col items-center border-b border-border bg-card">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full shadow-sm overflow-hidden relative group bg-secondary border border-border">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={46} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
            <label className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={24} className="text-foreground mb-1" />
              <span className="text-[10px] text-foreground font-medium uppercase tracking-widest">Cambiar</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>
        
        {showEditName ? (
          <div className="flex items-center gap-3 w-full max-w-[240px]">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 text-center rounded-lg py-2 px-3 text-lg font-bold outline-none focus:ring-1 focus:ring-ring bg-transparent border border-border text-foreground transition-all"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            />
            <button onClick={handleSaveName} className="text-sm font-bold uppercase tracking-wider text-foreground hover:opacity-80 transition-opacity">OK</button>
          </div>
        ) : (
          <button onClick={() => setShowEditName(true)} className="group active:scale-95 transition-transform outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {profile.name}
            </h1>
          </button>
        )}
        <p className="text-[13px] font-medium mt-1 text-muted-foreground uppercase tracking-widest">Estudiante</p>
      </div>

      <div className="px-5 pt-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.95 }}
              className="px-2 py-4 rounded-xl flex flex-col items-center justify-center bg-card border border-border shadow-sm transition-colors hover:border-foreground/20"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-secondary text-secondary-foreground border border-border">
                <s.icon size={18} className="text-current" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-muted-foreground">{s.label}</span>
              <span className="text-xl font-semibold tracking-tighter text-foreground">{s.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
              <Mail size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Correo</p>
              <p className="text-[15px] font-medium truncate text-foreground">{profile.email}</p>
            </div>
          </div>
          <div className="h-px bg-border ml-16" />
          <div className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
              <Phone size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">Teléfono</p>
              <p className="text-[15px] font-medium truncate text-foreground">{profile.phone || "No especificado"}</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer" onClick={toggleDarkMode}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                {isDark ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <span className="text-[15px] font-medium text-foreground">
                  Apariencia
                </span>
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-0.5">
                  {isDark ? "Oscuro" : "Claro"}
                </p>
              </div>
            </div>
            <div className={clsx("w-12 h-6 rounded-full transition-colors flex items-center px-1 border border-border outline-none focus-visible:ring-1 focus-visible:ring-ring", isDark ? "bg-foreground" : "bg-secondary")}>
               <motion.div animate={{ x: isDark ? 24 : 0 }} className={clsx("w-4 h-4 rounded-full", isDark ? "bg-background" : "bg-foreground")} />
            </div>
          </div>

          <div className="h-px bg-border ml-16" />

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setNotifications(!notifications)}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                <Bell size={18} />
              </div>
              <span className="text-[15px] font-medium text-foreground">Notificaciones</span>
            </div>
             <div className={clsx("w-12 h-6 rounded-full transition-colors flex items-center px-1 border border-border outline-none focus-visible:ring-1 focus-visible:ring-ring", notifications ? "bg-foreground" : "bg-secondary")}>
               <motion.div animate={{ x: notifications ? 24 : 0 }} className={clsx("w-4 h-4 rounded-full", notifications ? "bg-background" : "bg-foreground")} />
            </div>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full p-4 rounded-2xl flex items-center justify-center gap-2 font-bold tracking-wide transition-colors active:scale-[0.98] border border-destructive text-destructive bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground mt-8 focus:outline-none focus:ring-1 focus:ring-destructive"
        >
          <LogOut size={18} strokeWidth={2} />
          <span>CERRAR SESIÓN</span>
        </button>
        
        <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase mt-12 mb-4 text-muted-foreground">
          Notdeer App v2.0
        </p>
      </div>
    </div>
  );
}
