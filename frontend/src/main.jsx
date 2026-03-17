import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ItemProvider } from "./context/ItemContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ItemProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ItemProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
