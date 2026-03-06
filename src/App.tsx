import { Routes, Route, Navigate } from "react-router";
import Dashboard from "./app/pages/Dashboard";
import SmartRecording from "./app/pages/SmartRecording";
import AgendaAssistant from "./app/pages/AgendaAssistant";
import LoginPage from "./app/pages/LoginPage";
import RegisterPage from "./app/pages/RegisterPage";
import Onboarding from "./app/pages/Onboarding";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/record" element={<SmartRecording />} />
      <Route path="/assistant" element={<AgendaAssistant />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
