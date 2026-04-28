// fichier : src/components/RequireAuth.jsx
//
// Protège les routes selon le rôle de l'utilisateur.
// Si non connecté → redirige vers /login
// Si connecté mais mauvais rôle → redirige vers /login

import { Navigate } from "react-router-dom";
import { useAuth }  from "../context/AuthContext";

export default function RequireAuth({ role, children }) {
  const { user } = useAuth();

  // Non connecté → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Rôle insuffisant → login
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />
  }

  return children;
}