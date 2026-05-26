// fichier : src/main.jsx
//
// Point d'entrée de l'application React BOMBA CASH
//

import { StrictMode }    from "react";
import { createRoot }    from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext.jsx";
import App               from "./App.jsx";
import api               from "./lib/axios.js";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);