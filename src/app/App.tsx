import { Routes, Route, Navigate } from "react-router";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import LiveClass from "./pages/LiveClass";
import QuickNote from "./pages/QuickNote";
import ClassDetail from "./pages/ClassDetail";
import Notes from "./pages/Notes";
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
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/live" element={<LiveClass />} />
      <Route path="/live/:classId" element={<LiveClass />} />
      <Route path="/quick-note" element={<QuickNote />} />
      <Route path="/class/:classId" element={<ClassDetail />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
