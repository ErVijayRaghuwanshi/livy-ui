import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LivyProvider } from "./context/LivyContext";
import { SqlFilesProvider } from "./context/SqlFilesContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LivyProvider>
      <SqlFilesProvider>
        <App />
      </SqlFilesProvider>
    </LivyProvider>
  </StrictMode>
);
