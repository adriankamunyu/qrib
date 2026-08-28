import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Compatibility fallback for environments where crypto.randomUUID
// is unavailable, such as some WSL/LAN development setups.
if (
  typeof window !== "undefined" &&
  window.crypto &&
  typeof window.crypto.randomUUID !== "function"
) {
  window.crypto.randomUUID = () => {
    if (typeof window.crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);

      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      const hex = Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");

      return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32),
      ].join("-");
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (char) => {
        const random = Math.random() * 16 | 0;
        const value = char === "x"
          ? random
          : (random & 0x3) | 0x8;

        return value.toString(16);
      }
    );
  };
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);