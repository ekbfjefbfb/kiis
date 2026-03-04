import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NotesPage from "./pages/NotesPage";
import NoteDetail from "./pages/NoteDetail";
import AnalysisDetail from "./pages/AnalysisDetail";
import LiveRecording from "./pages/LiveRecording";
import SessionDetail from "./pages/SessionDetail";
import ChatAssistant from "./pages/ChatAssistant";
import ProfilePage from "./pages/ProfilePage";
import CalendarPage from "./pages/CalendarPage";
import ClassDetail from "./pages/ClassDetail";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Onboarding from "./pages/Onboarding";

function OnboardingGate() {
  const done = typeof window !== "undefined" && localStorage.getItem("onboarding_done") === "true";
  return <Navigate to={done ? "/dashboard" : "/onboarding"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/onboarding",
    Component: Onboarding,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <OnboardingGate /> },
      { path: "dashboard", Component: Dashboard },
      { path: "home", element: <Navigate to="/dashboard" replace /> },
      { path: "notes", Component: NotesPage },
      { path: "note/:id", Component: NoteDetail },
      { path: "analysis/:id", Component: AnalysisDetail },
      { path: "live", Component: LiveRecording },
      { path: "session/:id", Component: SessionDetail },
      { path: "chat", Component: ChatAssistant },
      { path: "profile", Component: ProfilePage },
      { path: "calendar", Component: CalendarPage },
      { path: "class/:id", Component: ClassDetail },
      { path: "search", Component: SearchPage },
    ],
  },
  {
    path: "*",
    Component: () => <div className="p-10 text-center text-muted-foreground font-['Plus Jakarta Sans']">Página no encontrada</div>
  }
]);
