import { Routes, Route, Navigate } from "react-router";
import Dashboard from "./pages/Dashboard";
import ChatAssistant from "./pages/ChatAssistant";
import LiveRecording from "./pages/LiveRecording";
import ClassDetail from "./pages/ClassDetail";
import NotesPage from "./pages/NotesPage";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import Onboarding from "./pages/Onboarding";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<ChatAssistant />} />
      <Route path="/live" element={<LiveRecording />} />
      <Route path="/live/:classId" element={<LiveRecording />} />
      <Route path="/class/:classId" element={<ClassDetail />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
