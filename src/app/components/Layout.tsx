import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, MessageCircle, User } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "motion/react";
import PWAInstallPrompt from "./PWAInstallPrompt";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Inicio", path: "/dashboard" },
    { icon: MessageCircle, label: "IA Chat", path: "/chat" },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  const isAuthPage = 
    location.pathname.includes("/login") || 
    location.pathname.includes("/register") || 
    location.pathname.includes("/onboarding") ||
    location.pathname === "/";
  const shouldHideNav = isAuthPage;

  return (
    <div className="mx-auto max-w-md min-h-[100dvh] relative overflow-hidden font-sans bg-background text-foreground">
      {/* PWA Install Prompt */}
      {!shouldHideNav && <PWAInstallPrompt />}

      <main className={clsx("h-full", !shouldHideNav && "pb-[88px]")}>
        <Outlet />
      </main>

      {/* Bottom Nav */}
      {!shouldHideNav && (
        <nav 
          className="fixed bottom-0 w-full max-w-md bg-card/90 backdrop-blur-xl flex justify-around items-center pt-2.5 pb-2.5 safe-bottom px-3 z-50 border-t border-border"
          style={{ 
            paddingBottom: "max(env(safe-area-inset-bottom, 12px), 12px)"
          }}
        >
          {navItems.map((item) => {
            const isActive = 
              location.pathname === item.path || 
              (item.path === "/dashboard" && (location.pathname === "/" || location.pathname === "/home"));
              
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center gap-0.5 min-w-[56px] min-h-[44px] justify-center relative group outline-none rounded-lg focus-visible:ring-1 focus-visible:ring-ring">
                <motion.div 
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="flex flex-col items-center gap-0.5 relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute -top-1.5 w-8 h-1 rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <item.icon
                    size={21}
                    strokeWidth={isActive ? 2.5 : 1.6}
                    className={clsx("transition-all duration-300", isActive ? "text-foreground" : "text-muted-foreground")}
                  />
                  <span
                    className={clsx("text-[10px] font-semibold transition-all duration-300", isActive ? "text-foreground" : "text-muted-foreground")}
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
