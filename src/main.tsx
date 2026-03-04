import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { HelmetProvider } from "react-helmet-async"; // 👈 add this

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider> {/* 👈 wrap everything */}
      <GoogleOAuthProvider clientId="959782862112-ct20v4a141ch8uabasr8bvk120s14kbu.apps.googleusercontent.com">
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </HelmetProvider> {/* 👈 close here */}
  </React.StrictMode>
);