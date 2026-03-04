import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";

type Mode = "login" | "register";

/* ── Brand Panel (left) ─────────────────────────────────── */
function BrandPanel() {
  return (
    <div className="hidden lg:flex relative flex-[0_0_46%] overflow-hidden"
      style={{ background: "#0A0A14" }}
    >
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 560,
          height: 560,
          background:
            "radial-gradient(circle, rgba(59,59,249,0.32) 0%, transparent 65%)",
          top: "-15%",
          left: "-18%",
        }}
        animate={{ x: [0, 22, 0], y: [0, -28, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 420,
          height: 420,
          background:
            "radial-gradient(circle, rgba(113,87,255,0.18) 0%, transparent 65%)",
          bottom: "0%",
          right: "-8%",
        }}
        animate={{ x: [0, -18, 0], y: [0, 30, 0] }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
          background:
            "radial-gradient(circle, rgba(59,59,249,0.12) 0%, transparent 65%)",
          bottom: "28%",
          left: "8%",
        }}
        animate={{ x: [0, 14, 0], y: [0, 18, 0] }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(10,10,20,0.9) 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col h-full justify-between"
        style={{ padding: "48px 52px" }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 32,
              height: 32,
              background: "#3B3BF9",
            }}
          >
            <Zap size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ color: "#F7F7F9", fontWeight: 500, letterSpacing: "-0.02em" }}>
            Notdeer
          </span>
        </motion.div>

        {/* Hero copy */}
        <div>
          <motion.p
            style={{
              color: "rgba(247,247,249,0.35)",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Plataforma educativa IA
          </motion.p>

          <motion.h2
            style={{
              color: "#F7F7F9",
              fontSize: "clamp(2.6rem, 3.8vw, 3.8rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
              fontWeight: 300,
              marginBottom: "28px",
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            Aprende más.<br />
            Estudia menos.<br />
            <span style={{ color: "#3B3BF9" }}>Hazlo con IA.</span>
          </motion.h2>

          <motion.p
            style={{
              color: "rgba(247,247,249,0.38)",
              fontSize: "0.875rem",
              lineHeight: 1.65,
              maxWidth: 280,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Organiza tus clases, genera resúmenes automáticos y potencia cada hora de estudio.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            className="flex gap-2 flex-wrap"
            style={{ marginTop: 36 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {["Resúmenes IA", "Organización", "Flashcards"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "0.7rem",
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(247,247,249,0.45)",
                  letterSpacing: "0.02em",
                }}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          className="flex items-center gap-4"
          style={{ color: "rgba(247,247,249,0.22)", fontSize: "0.72rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <span>© 2026 Notdeer</span>
          <span>·</span>
          <button
            className="transition-colors"
            style={{ color: "rgba(247,247,249,0.22)" }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "rgba(247,247,249,0.5)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "rgba(247,247,249,0.22)")
            }
          >
            Privacidad
          </button>
          <span>·</span>
          <button
            className="transition-colors"
            style={{ color: "rgba(247,247,249,0.22)" }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "rgba(247,247,249,0.5)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "rgba(247,247,249,0.22)")
            }
          >
            Términos
          </button>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Floating Label Field ───────────────────────────────── */
interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  icon?: React.ElementType;
  showToggle?: boolean;
  autoComplete?: string;
  delay?: number;
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
  icon: Icon,
  showToggle,
  autoComplete,
  delay = 0,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const inputType = showToggle ? (showPw ? "text" : "password") : type;
  const floated = focused || value.length > 0;

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          borderBottom: `1.5px solid ${focused ? "#3B3BF9" : "#D8D8E4"}`,
          transition: "border-color 0.25s ease",
          paddingBottom: 8,
        }}
      >
        {/* Icon */}
        {Icon && (
          <div style={{ paddingBottom: 2, flexShrink: 0 }}>
            <Icon
              size={17}
              strokeWidth={1.8}
              style={{
                color: focused ? "#3B3BF9" : "rgba(170,170,184,0.6)",
                transition: "color 0.25s ease",
              }}
            />
          </div>
        )}

        {/* Label + Input */}
        <div style={{ position: "relative", flex: 1, paddingTop: 22 }}>
          <label
            style={{
              position: "absolute",
              left: 0,
              top: floated ? 0 : 22,
              fontSize: floated ? "0.6rem" : "0.875rem",
              letterSpacing: floated ? "0.12em" : "0",
              textTransform: floated ? "uppercase" : "none",
              fontWeight: floated ? 500 : 400,
              color: floated
                ? focused
                  ? "#3B3BF9"
                  : "#AAAAB8"
                : "#AAAAB8",
              pointerEvents: "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {label}
          </label>
          <input
            type={inputType}
            value={value}
            required={required}
            autoComplete={autoComplete}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: "100%",
              background: "transparent",
              outline: "none",
              color: "#0A0A14",
              fontSize: "0.9375rem",
              letterSpacing: "-0.01em",
            }}
          />
        </div>

        {/* Password toggle */}
        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((p) => !p)}
            style={{
              color: "rgba(170,170,184,0.5)",
              flexShrink: 0,
              paddingBottom: 2,
              transition: "color 0.2s",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#AAAAB8")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "rgba(170,170,184,0.5)")
            }
          >
            {showPw ? (
              <EyeOff size={15} strokeWidth={1.75} />
            ) : (
              <Eye size={15} strokeWidth={1.75} />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main App ────────────────────────────────────────────── */
export default function App() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen w-full flex" style={{ background: "#F7F7F9" }}>
      {/* Left brand panel */}
      <BrandPanel />

      {/* Right form panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center min-h-screen"
        style={{ padding: "48px 40px" }}
      >
        {/* Mobile logo */}
        <motion.div
          className="lg:hidden flex items-center gap-2 self-start mb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 30, height: 30, background: "#3B3BF9" }}
          >
            <Zap size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#0A0A14",
            }}
          >
            Notdeer
          </span>
        </motion.div>

        <div style={{ width: "100%", maxWidth: 360 }}>
          <AnimatePresence mode="wait">
            {/* ── Success State ── */}
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 18,
                    delay: 0.1,
                  }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(59,59,249,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 28,
                  }}
                >
                  <Check size={26} color="#3B3BF9" strokeWidth={2.5} />
                </motion.div>

                <h2
                  style={{
                    fontSize: "1.6rem",
                    letterSpacing: "-0.03em",
                    fontWeight: 400,
                    color: "#0A0A14",
                    marginBottom: 10,
                  }}
                >
                  {mode === "login" ? "Bienvenido de vuelta" : "Todo listo"}
                </h2>
                <p
                  style={{
                    color: "#AAAAB8",
                    fontSize: "0.875rem",
                    marginBottom: 40,
                    lineHeight: 1.6,
                  }}
                >
                  {mode === "login"
                    ? "Has iniciado sesión correctamente."
                    : "Tu cuenta está lista para comenzar."}
                </p>
                <motion.button
                  onClick={() => setSubmitted(false)}
                  className="flex items-center gap-1.5 transition-all"
                  style={{
                    fontSize: "0.875rem",
                    color: "#3B3BF9",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  whileHover={{ gap: 8 }}
                >
                  Volver al inicio
                  <ArrowRight size={14} strokeWidth={2} />
                </motion.button>
              </motion.div>
            ) : (
              /* ── Form ── */
              <motion.div
                key={`form-${mode}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {/* Header */}
                <div style={{ marginBottom: 44 }}>
                  <h1
                    style={{
                      fontSize: "clamp(1.9rem, 4vw, 2.2rem)",
                      letterSpacing: "-0.04em",
                      fontWeight: 300,
                      color: "#0A0A14",
                      marginBottom: 10,
                    }}
                  >
                    {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                  </h1>
                  <p style={{ color: "#AAAAB8", fontSize: "0.875rem" }}>
                    {mode === "login"
                      ? "¿No tienes cuenta? "
                      : "¿Ya tienes cuenta? "}
                    <button
                      onClick={() =>
                        switchMode(mode === "login" ? "register" : "login")
                      }
                      style={{
                        color: "#3B3BF9",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: "0.875rem",
                        padding: 0,
                        textDecoration: "underline",
                        textUnderlineOffset: 3,
                      }}
                    >
                      {mode === "login" ? "Regístrate aquí" : "Inicia sesión"}
                    </button>
                  </p>
                </div>

                {/* Mode tabs pill */}
                <div
                  style={{
                    display: "flex",
                    background: "#EEEEF2",
                    borderRadius: 12,
                    padding: 3,
                    marginBottom: 36,
                    position: "relative",
                  }}
                >
                  <motion.div
                    layout
                    style={{
                      position: "absolute",
                      top: 3,
                      bottom: 3,
                      width: "calc(50% - 3px)",
                      background: "#0A0A14",
                      borderRadius: 9,
                      left: mode === "login" ? 3 : "calc(50%)",
                      transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                  {(["login", "register"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => switchMode(m)}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        fontSize: "0.8rem",
                        fontWeight: mode === m ? 500 : 400,
                        letterSpacing: "-0.01em",
                        color: mode === m ? "#F7F7F9" : "#AAAAB8",
                        background: "none",
                        border: "none",
                        borderRadius: 9,
                        cursor: "pointer",
                        position: "relative",
                        zIndex: 1,
                        fontFamily: "inherit",
                        transition: "color 0.2s",
                      }}
                    >
                      {m === "login" ? "Entrar" : "Registrarse"}
                    </button>
                  ))}
                </div>

                {/* Fields */}
                <form
                  onSubmit={handleSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: 28 }}
                >
                  <AnimatePresence>
                    {mode === "register" && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <Field
                          icon={User}
                          label="Nombre completo"
                          type="text"
                          value={name}
                          onChange={setName}
                          required
                          autoComplete="name"
                          delay={0.05}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Field
                    icon={Mail}
                    label="Correo electrónico"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                    autoComplete="email"
                    delay={0.1}
                  />

                  <AnimatePresence>
                    {mode === "register" && (
                      <motion.div
                        key="phone-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <Field
                          icon={Phone}
                          label="Teléfono (opcional)"
                          type="tel"
                          value={phone}
                          onChange={setPhone}
                          autoComplete="tel"
                          delay={0.05}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Field
                    icon={Lock}
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    required
                    showToggle
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    delay={0.15}
                  />

                  {/* CTA */}
                  <div style={{ paddingTop: 8, display: "flex", flexDirection: "column", gap: 16 }}>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileTap={{ scale: 0.985 }}
                      style={{
                        width: "100%",
                        height: 52,
                        background: loading ? "rgba(10,10,20,0.6)" : "#0A0A14",
                        color: "#F7F7F9",
                        border: "none",
                        borderRadius: 14,
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontFamily: "inherit",
                        transition: "background 0.2s, transform 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading)
                          (e.currentTarget as HTMLElement).style.background =
                            "#1a1a28";
                      }}
                      onMouseLeave={(e) => {
                        if (!loading)
                          (e.currentTarget as HTMLElement).style.background =
                            "#0A0A14";
                      }}
                    >
                      {loading ? (
                        <Loader2 size={18} strokeWidth={2} className="animate-spin" />
                      ) : (
                        <>
                          {mode === "login" ? "Continuar" : "Crear cuenta"}
                          <ArrowRight size={15} strokeWidth={2} />
                        </>
                      )}
                    </motion.button>

                    {mode === "login" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                      >
                        <button
                          type="button"
                          style={{
                            fontSize: "0.78rem",
                            color: "#AAAAB8",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              "#0A0A14")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              "#AAAAB8")
                          }
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Divider + social hint */}
                  <div
                    className="flex items-center gap-4"
                    style={{ marginTop: -4 }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: "#D8D8E4",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#AAAAB8",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      o continúa con
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: "#D8D8E4",
                      }}
                    />
                  </div>

                  {/* Social buttons */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginTop: -8,
                    }}
                  >
                    {[
                      {
                        label: "Google",
                        icon: (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        ),
                      },
                      {
                        label: "Apple",
                        icon: (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                        ),
                      },
                    ].map(({ label, icon }) => (
                      <button
                        key={label}
                        type="button"
                        style={{
                          height: 46,
                          borderRadius: 12,
                          border: "1.5px solid #D8D8E4",
                          background: "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          fontSize: "0.82rem",
                          color: "#0A0A14",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          letterSpacing: "-0.01em",
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            "#AAAAB8";
                          (e.currentTarget as HTMLElement).style.background =
                            "rgba(0,0,0,0.02)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            "#D8D8E4";
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                        }}
                      >
                        {icon}
                        {label}
                      </button>
                    ))}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
