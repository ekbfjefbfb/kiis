
import { LayoutDashboard, MessageCircle, User } from "lucide-react";
import { Link, useLocation, Outlet } from "react-router";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { PWAInstallPrompt } from "./PWAInstallPrompt";

export function Layout() {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: MessageCircle, label: "Chat IA", path: "/chat" },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  // Don't show nav on login/register page
  const showNav =
    location.pathname !== "/" &&
    location.pathname !== "/login" &&
    location.pathname !== "/register";

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center font-['Inter',system-ui,sans-serif] text-gray-900">
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen relative flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-22 scrollbar-hide scroll-smooth-touch">
          <Outlet />
        </div>

        {showNav && (
          <nav className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-100/80 flex justify-around items-center pt-2 pb-2 safe-bottom px-4 z-50">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/dashboard" && location.pathname.startsWith("/class/")) ||
                (item.path === "/dashboard" && location.pathname.startsWith("/note")) ||
                (item.path === "/dashboard" && location.pathname === "/calendar") ||
                (item.path === "/dashboard" && location.pathname === "/home");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    "flex flex-col items-center gap-0.5 transition-all duration-200 min-w-[64px] min-h-[44px] justify-center relative"
                  )}
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

        <PWAInstallPrompt />
      </div>
    </div>
  );
}
