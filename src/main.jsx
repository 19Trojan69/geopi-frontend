import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ✅ Pi SDK init NUR EINMAL hier (vor React Render)
try {
  if (typeof window !== "undefined" && window.Pi) {
    window.Pi.init({ version: "2.0", sandbox: false });
    console.log("✅ Pi SDK initialized (main.jsx)");
  } else {
    console.log("ℹ️ Pi SDK not found (not in Pi Browser)");
  }
} catch (e) {
  console.error("❌ Pi.init failed:", e);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
