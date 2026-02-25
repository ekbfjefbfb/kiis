
import { Home, MessageSquare, User } from "lucide-react";
import { Link, useLocation, Outlet } from "react-router";
import { clsx } from "clsx";

export function Layout() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  // Don't show nav on login page
  const showNav = location.pathname !== "/" && location.pathname !== "/login";

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center font-sans text-gray-900">
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen relative flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          <Outlet />
        </div>
        
        {showNav && (
          <nav className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center py-3 pb-5 px-6 z-50">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    "flex flex-col items-center gap-1 transition-all duration-200",
                    isActive ? "text-indigo-600 scale-105" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
