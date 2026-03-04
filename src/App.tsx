import { Routes, Route, Navigate } from "react-router";
import Dashboard from "./app/pages/Dashboard";
import ClassDetail from "./app/pages/ClassDetail";
import LiveRecording from "./app/pages/LiveRecording";
import LiveRecordingNew from "./app/pages/LiveRecordingNew";
import ChatAssistant from "./app/pages/ChatAssistant";
import LoginPage from "./app/pages/LoginPage";
import RegisterPage from "./app/pages/RegisterPage";
import Onboarding from "./app/pages/Onboarding";
import ProfilePage from "./app/pages/ProfilePage";
import CalendarPage from "./app/pages/CalendarPage";
import NotesPage from "./app/pages/NotesPage";
import NoteDetail from "./app/pages/NoteDetail";

export default function App() {
  const isAuthenticated = true; 

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff', opacity: 1, visibility: 'visible' }}>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/class/:classId" 
          element={isAuthenticated ? <ClassDetail /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/live" 
          element={isAuthenticated ? <LiveRecordingNew /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/chat" 
          element={isAuthenticated ? <ChatAssistant /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/calendar" 
          element={isAuthenticated ? <CalendarPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/notes" 
          element={isAuthenticated ? <NotesPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/note/:noteId" 
          element={isAuthenticated ? <NoteDetail /> : <Navigate to="/login" />} 
        />
      </Routes>
    </div>
  );
}
