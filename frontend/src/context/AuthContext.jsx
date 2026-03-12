import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Persister le user dans localStorage pour survivre aux rechargements
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("bc_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("bc_token") ?? null;
  });

  const login = (userData, accessToken = null) => {
    setUser(userData);
    localStorage.setItem("bc_user", JSON.stringify(userData));
    if (accessToken) {
      setToken(accessToken);
      localStorage.setItem("bc_token", accessToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bc_user");
    localStorage.removeItem("bc_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}