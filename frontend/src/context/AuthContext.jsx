import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // État utilisateur depuis localStorage
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("bc_user");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Erreur parsing bc_user:', error);
      localStorage.removeItem("bc_user"); // Nettoyer si corrompu
      return null;
    }
  });

  // État token depuis localStorage
  const [token, setToken] = useState(() => {
    return localStorage.getItem("bc_token") || null;
  });

  // État de chargement pour les vérifications initiales
  const [isLoading, setIsLoading] = useState(true);

  // Fonction login
  const login = (userData, accessToken) => {
    if (!accessToken) {
      console.error('Token manquant lors du login');
      return;
    }

    // Mise à jour des états
    setUser(userData);
    setToken(accessToken);
    
    // Persistance localStorage
    localStorage.setItem("bc_user", JSON.stringify(userData));
    localStorage.setItem("bc_token", accessToken);
    
    console.log('✅ Login réussi, token stocké');
  };

  // Fonction logout
  const logout = async () => {
    try {
      // Appel API logout si token présent
      if (token) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.warn('Erreur lors du logout API:', error);
    } finally {
      // Nettoyage local quoi qu'il arrive
      setUser(null);
      setToken(null);
      localStorage.removeItem("bc_user");
      localStorage.removeItem("bc_token");
      console.log('✅ Logout effectué');
    }
  };

  // Vérification token au démarrage
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await fetch('/api/user', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            }
          });

          if (!response.ok) {
            // Token invalide, nettoyer
            console.warn('Token invalide, nettoyage...');
            logout();
          }
        } catch (error) {
          console.warn('Erreur vérification token:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  // Helper pour vérifier si authentifié
  const isAuthenticated = !!user && !!token;
  
  // Helper pour vérifier le rôle
  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    isAgent,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}