import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, MessageCircle, User, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { clsx } from "clsx";

export default function Layout() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Inicio", path: "/dashboard" },
    { icon: MessageCircle, label: "Chat IA", path: "/chat" },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  const hideNavOn = ["/login", "/register"];
  const shouldHideNav = hideNavOn.includes(location.pathname);

  return (
    <div className="mx-auto max-w-md bg-white min-h-screen relative shadow-2xl overflow-hidden font-sans">
      {deferredPrompt && !shouldHideNav && (
        <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center text-sm safe-top">
          <span className="font-medium">Instala Notdeer en tu móvil</span>
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 bg-white text-indigo-600 px-3 py-1.5 rounded-full font-bold text-xs shadow-sm active:scale-95 transition-transform"
          >
            <Download size={14} strokeWidth={2.5} />
            Instalar
          </button>
        </div>
      )}

      <main className={clsx("h-full", !shouldHideNav && "pb-24")}>
        <Outlet />
      </main>

      {!shouldHideNav && (
        <nav 
          className={clsx(
            "fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-100/80 flex justify-around items-center pt-2 pb-2 safe-bottom px-4 z-50 transition-transform duration-300"
          )}
          style={{ paddingBottom: "max(window.safe-area-inset-bottom, 16px)" }}
        >
          {navItems.map((item) => {
            // Activar Inicio si estamos en dashboard o index
            const isActive = 
              location.pathname === item.path || 
              (item.path === "/dashboard" && location.pathname === "/");
              
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex flex-col items-center gap-0.5 transition-all duration-200 min-w-[64px] min-h-[44px] justify-center relative touch-manipulation"
                )}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <motion.div 
                  whileTap={{ scale: 0.85 }}
                  className="flex flex-col items-center gap-0.5"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-2 w-5 h-1 bg-indigo-600 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={clsx(
                      "transition-colors duration-200",
                      isActive ? "text-indigo-600" : "text-gray-400"
                    )}
                  />
                  <span
                    className={clsx(
                      "text-[10px] font-medium transition-colors duration-200",
                      isActive ? "text-indigo-600" : "text-gray-400"
                    )}
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
