
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Home from "./pages/Home";
import NotesPage from "./pages/Notes";
import NoteDetail from "./pages/NoteDetail";
import ChatPage from "./pages/Chat";
import ProfilePage from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LoginPage },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "home", Component: Home },
      { path: "notes", Component: NotesPage },
      { path: "note/:id", Component: NoteDetail },
      { path: "chat", Component: ChatPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
  {
    path: "*",
    Component: () => <div className="p-10 text-center text-gray-500">404 - Not Found</div>
  }
]);
