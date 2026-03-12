// fichier : src/context/AuthContext.jsx
//
// Stocke l'utilisateur connecté dans toute l'application.
// À entourer autour de <App /> dans main.jsx

import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user = { id, name, email, role, statut } — null si non connecté
  const [user, setUser] = useState(null);

  const login  = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser le contexte dans n'importe quel composant
export function useAuth() {
  return useContext(AuthContext);
}