import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ✅ Pi SDK initialisieren – VOR dem Render
if (window.Pi) {
  try {
    window.Pi.init({ version: "2.0", sandbox: false });
    console.log("✅ Pi SDK initialized");
  } catch (err) {
    console.error("❌ Pi SDK init failed", err);
  }
} else {
  console.warn("⚠️ Pi SDK NOT available (not in Pi Browser?)");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);