import { Routes, Route, Navigate } from "react-router";
import Dashboard from "./pages/Dashboard";
import SmartRecording from "./pages/SmartRecording";
import AgendaAssistant from "./pages/AgendaAssistant";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Onboarding from "./pages/Onboarding";

function App() {
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

export default App;
