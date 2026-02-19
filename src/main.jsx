import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LivyProvider } from "./context/LivyContext";
import { SqlFilesProvider } from "./context/SqlFilesContext";
import { SchemaProvider } from "./context/SchemaContext";
import { ToastProvider } from "./components/Toast";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <LivyProvider>
        <SchemaProvider>
          <SqlFilesProvider>
            <App />
          </SqlFilesProvider>
        </SchemaProvider>
      </LivyProvider>
    </ToastProvider>
  </StrictMode>
);
