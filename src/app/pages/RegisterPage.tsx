import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { UserPlus, Mail, Lock, BookOpen, AlertCircle, Phone, Camera, Upload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { authService } from "../../services/auth.service";
import { updateUser } from "../data/mock";

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
      
      // Update local mock user state
      updateUser({
        name,
        email,
        phone,
        ...(avatarPreview && { avatar: avatarPreview })
      });

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -ml-20 -mb-20 opacity-50" />

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        {/* Brand/Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8 w-full"
        >
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-5 relative group overflow-hidden">
            <BookOpen size={32} className="text-white" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight text-center">
            Únete a Notdeer
          </h1>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-[280px]">
            Organiza tus clases y genera resúmenes con Inteligencia Artificial.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-white rounded-3xl border border-gray-100/80 shadow-xl shadow-gray-200/40 p-6 md:p-8 relative overflow-hidden"
        >
          {/* Subtle inner top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

          {/* Photo Upload Area */}
          <div className="flex justify-center mb-5">
            <div className="relative group">
              <div 
                className={clsx(
                  "w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center bg-gray-50",
                  avatarPreview ? "border-indigo-100" : "border-dashed border-gray-300"
                )}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserPlus size={28} className="text-gray-400" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center text-white cursor-pointer shadow-sm hover:scale-105 transition-transform active:scale-95">
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
                <div className="bg-red-50 text-red-600 text-[13px] p-3 rounded-2xl flex items-start gap-2.5 border border-red-100/50">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p className="leading-relaxed font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                Nombre Completo
              </label>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Ej. Ana García"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="tu@correo.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="+52 555 123-4567"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name || !email || !password || !phone}
              className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-semibold text-[15px] mt-6 shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none hover:bg-indigo-700 active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">¿Ya tienes una cuenta? </span>
            <Link
              to="/login"
              className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline underline-offset-4 transition-all"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
