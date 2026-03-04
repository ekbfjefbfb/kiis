import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NotesPage from "./pages/Notes";
import NoteDetail from "./pages/NoteDetail";
import AnalysisDetail from "./pages/AnalysisDetail";
import LiveRecording from "./pages/LiveRecording";
import SessionDetail from "./pages/SessionDetail";
import ChatPage from "./pages/Chat";
import ProfilePage from "./pages/Profile";
import CalendarPage from "./pages/CalendarPage";
import ClassDetailPage from "./pages/ClassDetailPage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import QuickNotePage from "./pages/QuickNotePage";

function OnboardingGate() {
  const done = typeof window !== "undefined" && localStorage.getItem("onboarding_done") === "true";
  return <Navigate to={done ? "/dashboard" : "/onboarding"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/onboarding",
    Component: OnboardingPage,
  },
  {
    path: "/quick-note",
    Component: QuickNotePage,
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
      { path: "chat", Component: ChatPage },
      { path: "profile", Component: ProfilePage },
      { path: "calendar", Component: CalendarPage },
      { path: "class/:id", Component: ClassDetailPage },
      { path: "search", Component: SearchPage },
    ],
  },
  {
    path: "*",
    Component: () => <div className="p-10 text-center text-muted-foreground font-['Inter']">Página no encontrada</div>
  }
]);
