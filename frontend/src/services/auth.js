// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/services/auth.js
//
// Service d'authentification — API REST avec tokens Sanctum
// Login via le champ "name" (colonne name de la table users)
//
// ── FLUX TOKENS SANCTUM ─────────────────────────────────────────────────────
//   1. POST /api/login { name, password } → { token, user }
//   2. GET  /api/user (avec Bearer token)  → { id, name, email, role, statut }
//   3. POST /api/logout (avec Bearer token) → suppression du token
// ─────────────────────────────────────────────────────────────────────────────

import api from "../lib/axios";

// ── CSRF Cookie (Optionnel pour tokens, mais gardé pour compatibilité) ────────
export const getCsrfCookie = () =>
  api.get("/sanctum/csrf-cookie");

// ── Login avec Tokens Sanctum ─────────────────────────────────────────────────
// ✅ Retourne { token, user } depuis AuthenticatedSessionController
export const loginRequest = ({ name, password }) =>
  api.post("/api/login", { name, password });

// ── Utilisateur connecté (avec token Bearer) ──────────────────────────────────
// ✅ Utilise automatiquement le token Bearer via l'intercepteur Axios
export const getUser = () =>
  api.get("/api/user");

// ── Déconnexion (supprime le token côté serveur) ──────────────────────────────
// ✅ Appelle l'API pour supprimer le token Sanctum
export const logoutRequest = () =>
  api.post("/api/logout");

// ── Vérification validité token (helper) ──────────────────────────────────────
// ✅ Utile pour vérifier si le token est encore valide
export const verifyToken = async () => {
  try {
    const response = await getUser();
    return { valid: true, user: response.data };
  } catch (error) {
    return { valid: false, error };
  }
};