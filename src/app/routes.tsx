
import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import NotesPage from "./pages/Notes";
import NoteDetail from "./pages/NoteDetail";
import ChatPage from "./pages/Chat";
import ProfilePage from "./pages/Profile";
import CalendarPage from "./pages/CalendarPage";
import ClassDetailPage from "./pages/ClassDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LoginPage },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "dashboard", Component: Dashboard },
      { path: "home", element: <Navigate to="/dashboard" replace /> },
      { path: "notes", Component: NotesPage },
      { path: "note/:id", Component: NoteDetail },
      { path: "chat", Component: ChatPage },
      { path: "profile", Component: ProfilePage },
      { path: "calendar", Component: CalendarPage },
      { path: "class/:id", Component: ClassDetailPage },
    ],
  },
  {
    path: "*",
    Component: () => <div className="p-10 text-center text-gray-500 font-['Inter']">404 - Not Found</div>
  }
]);
