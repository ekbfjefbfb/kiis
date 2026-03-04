import { Outlet, NavLink, useLocation } from "react-router";
import { Home, MessageCircle, User } from "lucide-react";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "motion/react";

export function MainLayout() {
  const location = useLocation();
  const isClassDetail = location.pathname.includes("/class/");

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground max-w-md mx-auto relative overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 overflow-y-auto pb-24 scrollbar-hide"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {!isClassDetail && (
        <nav className="fixed bottom-0 w-full max-w-md pb-safe bg-background/70 backdrop-blur-2xl border-t border-border flex justify-evenly items-center pt-3 pb-6 z-50">
          <NavItem to="/" icon={Home} label="Inicio" />
          <NavItem to="/chat" icon={MessageCircle} label="IA Chat" />
          <NavItem to="/profile" icon={User} label="Perfil" />
        </nav>
      )}
    </div>
  );
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex flex-col items-center gap-1.5 transition-all duration-300 w-16",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
          {isActive && (
             <motion.div 
                layoutId="nav-indicator" 
                className="w-1 h-1 rounded-full bg-foreground" 
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
             />
          )}
        </>
      )}
    </NavLink>
  );
}
