import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../lib/axios"; // ← utilise l'instance axios configurée (URL absolue)

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("bc_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem("bc_user");
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("bc_token") || null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ useCallback pour que logout soit stable (évite boucle infinie dans useEffect)
  const logout = useCallback(async () => {
    const currentToken = localStorage.getItem("bc_token");
    try {
      if (currentToken) {
        // ✅ URL absolue via l'instance api (pas fetch natif avec URL relative)
        await api.post("/api/logout");
      }
    } catch {
      // Silencieux : on déconnecte quoi qu'il arrive
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("bc_user");
      localStorage.removeItem("bc_token");
    }
  }, []);

  const login = (userData, accessToken) => {
    if (!accessToken) return;
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("bc_user", JSON.stringify(userData));
    localStorage.setItem("bc_token", accessToken);
  };

  // ✅ Vérification token au démarrage — URL absolue via api
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem("bc_token");
      if (storedToken) {
        try {
          await api.get("/api/user");
        } catch {
          // Token invalide ou expiré
          setUser(null);
          setToken(null);
          localStorage.removeItem("bc_user");
          localStorage.removeItem("bc_token");
        }
      }
      setIsLoading(false);
    };
    verifyToken();
  }, []); // ← pas de dépendance sur logout pour éviter la boucle

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "admin",
    isAgent: user?.role === "agent",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
}