import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { UserPlus, Mail, Lock, BookOpen, AlertCircle, Phone, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { authService } from "../../services/auth.service";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe pesar más de 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !phone) {
      setError("Por favor completa todos los campos del formulario");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(email, password, name);
      
      // Guardar perfil completo en localStorage para que Profile.tsx lo lea
      const profileData = {
        name,
        email,
        phone,
        avatar: avatarPreview,
      };
      localStorage.setItem('user_profile', JSON.stringify(profileData));
      if (avatarPreview) localStorage.setItem('user_avatar', avatarPreview);
      if (phone) localStorage.setItem('user_phone', phone);

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-300">
      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        {/* Brand/Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8 w-full"
        >
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-5 overflow-hidden">
            <BookOpen size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Únete a Notdeer
          </h1>
          <p className="text-sm mt-2 text-center max-w-[280px] text-muted-foreground">
            Organiza tus clases y genera resúmenes con Inteligencia Artificial.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-card border border-border rounded-3xl p-6 md:p-8 relative"
        >
          {/* Photo Upload Area */}
          <div className="flex justify-center mb-5">
            <div className="relative group">
              <div 
                className={clsx(
                  "w-20 h-20 rounded-full border overflow-hidden flex items-center justify-center bg-transparent transition-colors",
                  avatarPreview ? "border-border" : "border-dashed border-border hover:border-foreground/50"
                )}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserPlus size={28} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full border-2 border-background flex items-center justify-center text-primary-foreground cursor-pointer shadow-sm hover:scale-105 transition-transform active:scale-95">
                <Camera size={14} />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
              >
                <div className="bg-destructive/10 text-destructive text-[13px] p-3 rounded-xl flex items-start gap-2.5 border border-destructive/20 font-medium">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p className="leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pl-1">
                Nombre Completo
              </label>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border border-border rounded-2xl py-3.5 pl-11 pr-4 text-[15px] focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
                  placeholder="Ej. Ana García"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pl-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-border rounded-2xl py-3.5 pl-11 pr-4 text-[15px] focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
                  placeholder="tu@correo.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pl-1">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent border border-border rounded-2xl py-3.5 pl-11 pr-4 text-[15px] focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
                  placeholder="+52 555 123-4567"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pl-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-border rounded-2xl py-3.5 pl-11 pr-4 text-[15px] focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name || !email || !password || !phone}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-[15px] mt-6 shadow-sm disabled:opacity-50 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center h-14"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                "Crear Cuenta"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
            <Link
              to="/login"
              className="font-semibold text-foreground hover:underline underline-offset-4 transition-all"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
