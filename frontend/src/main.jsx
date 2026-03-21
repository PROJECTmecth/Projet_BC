// fichier : src/main.jsx
//
// Point d'entrée de l'application React BOMBA CASH
//
// IMPORTANT :
//   On récupère le cookie XSRF-TOKEN au démarrage de l'app
//   avant de rendre quoi que ce soit.
//   Sans ce cookie, toutes les requêtes POST/PUT/DELETE
//   retournent une erreur 419 (CSRF token mismatch).

import { StrictMode }    from "react";
import { createRoot }    from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext.jsx";
import App               from "./App.jsx";
import api               from "./lib/axios.js";
import "./index.css";

// ── Récupérer le cookie CSRF avant de démarrer l'app ─────────────────────────
api.get("/sanctum/csrf-cookie").finally(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
});