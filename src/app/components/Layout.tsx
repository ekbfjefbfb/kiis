import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, MessageCircle, User, Download, AudioLines } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";

export default function Layout() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Inicio", path: "/dashboard" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
    { icon: AudioLines, label: "Voz IA", path: "/voice" },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  const isAuthPage = 
    location.pathname.includes("/login") || 
    location.pathname.includes("/register") || 
    location.pathname === "/";
  const shouldHideNav = isAuthPage;

  return (
    <div className="mx-auto max-w-md min-h-[100dvh] relative shadow-2xl overflow-hidden font-sans" style={{ background: "var(--bg-primary)" }}>
      {/* PWA Install Banner */}
      <AnimatePresence>
        {deferredPrompt && !shouldHideNav && showInstallBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="gradient-animated text-white px-4 py-3 flex justify-between items-center text-sm safe-top">
              <span className="font-medium text-[13px]">📱 Instala Notdeer</span>
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 bg-white text-indigo-600 px-3.5 py-1.5 rounded-full font-bold text-xs shadow-sm btn-premium"
                >
                  <Download size={13} strokeWidth={2.5} />
                  Instalar
                </button>
                <button onClick={() => setShowInstallBanner(false)} className="text-white/60 hover:text-white text-xs px-1">✕</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={clsx("h-full", !shouldHideNav && "pb-[88px]")}>
        <Outlet />
      </main>

      {/* Bottom Nav */}
      {!shouldHideNav && (
        <nav 
          className="fixed bottom-0 w-full max-w-md glass flex justify-around items-center pt-2.5 pb-2.5 safe-bottom px-3 z-50"
          style={{ 
            paddingBottom: "max(env(safe-area-inset-bottom, 12px), 12px)",
            borderTop: "1px solid var(--border-primary)"
          }}
        >
          {navItems.map((item) => {
            const isActive = 
              location.pathname === item.path || 
              (item.path === "/dashboard" && (location.pathname === "/" || location.pathname === "/home"));
              
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center gap-0.5 min-w-[56px] min-h-[44px] justify-center relative group">
                <motion.div 
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="flex flex-col items-center gap-0.5 relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute -top-1.5 w-8 h-1 rounded-full"
                      style={{ background: "var(--primary)", boxShadow: `0 2px 8px var(--primary-shadow)` }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <item.icon
                    size={21}
                    strokeWidth={isActive ? 2.5 : 1.6}
                    style={{ color: isActive ? "var(--primary)" : "var(--text-tertiary)" }}
                    className="transition-all duration-300"
                  />
                  <span
                    style={{ color: isActive ? "var(--primary)" : "var(--text-tertiary)" }}
                    className="text-[10px] font-semibold transition-all duration-300"
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
