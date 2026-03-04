import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="min-h-[100dvh] bg-black text-white relative flex flex-col">
      <main className="flex-1 flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
}
