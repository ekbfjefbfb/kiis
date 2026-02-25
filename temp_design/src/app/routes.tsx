
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ClassDetail from "./pages/ClassDetail";
import ChatPage from "./pages/Chat";
import ProfilePage from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LoginPage },
      { path: "login", Component: LoginPage }, // Redundant but safe
      { path: "dashboard", Component: Dashboard },
      { path: "class/:id", Component: ClassDetail },
      { path: "chat", Component: ChatPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
  {
    path: "*",
    Component: () => <div className="p-10 text-center text-gray-500">404 - Not Found</div>
  }
]);
