import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for offline capability
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW registration failed — app still works, just no offline caching
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
