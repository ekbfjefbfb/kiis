import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { UserPlus, Mail, Lock, BookOpen, Phone, Camera, Loader2 } from "lucide-react";
import { motion } from "motion/react";
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
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.register(email, password, name);
      const profileData = { name, email, phone, avatar: avatarPreview };
      localStorage.setItem('user_profile', JSON.stringify(profileData));
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-sans selection:bg-white/20 flex flex-col items-center justify-center px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Únete</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Crea tu cuenta inteligente</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8 space-y-6">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl border border-white/10 overflow-hidden bg-black/30 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserPlus size={28} className="text-white/20" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl flex items-center justify-center text-black cursor-pointer shadow-xl active:scale-90 transition-all">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest p-3 rounded-xl text-center">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="NOMBRE COMPLETO" className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase text-white placeholder:text-white/10" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="EMAIL" className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase text-white placeholder:text-white/10" />
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="TELÉFONO" className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase text-white placeholder:text-white/10" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="CONTRASEÑA" className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-white placeholder:text-white/10" />
            <button type="submit" disabled={isLoading} className="w-full bg-white text-black rounded-2xl py-4 text-lg font-black uppercase italic tracking-tight mt-4 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Registrarme"}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              ¿Ya tienes cuenta? <Link to="/login" className="text-white hover:underline">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
