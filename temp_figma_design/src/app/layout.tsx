import { Outlet, NavLink, useLocation } from "react-router";
import { Home, MessageCircle, User, BookOpen } from "lucide-react";
import { clsx } from "clsx";

export function MainLayout() {
  const location = useLocation();
  const isClassDetail = location.pathname.includes("/class/");

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        <Outlet />
      </main>

      {!isClassDetail && (
        <nav className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-around items-center py-3 pb-5 z-50">
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
          "flex flex-col items-center gap-1 transition-all duration-300",
          isActive ? "text-slate-900 scale-105" : "text-slate-400 hover:text-slate-600"
        )
      }
    >
      <Icon size={22} strokeWidth={2} />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </NavLink>
  );
}
