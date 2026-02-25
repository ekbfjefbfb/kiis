
  import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { notesService } from "./services/notes.service";

// Initialize services
notesService.init().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
  