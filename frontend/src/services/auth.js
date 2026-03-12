// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/services/auth.js
//
// Service d'authentification — appels RÉELS vers Laravel Sanctum.
// Login via le champ "name" (nom d'utilisateur, colonne name de la table users)
//
// ── FLUX ─────────────────────────────────────────────────────────────────────
//   1. GET  /sanctum/csrf-cookie  → Laravel pose le cookie XSRF-TOKEN
//   2. POST /login { name, password } → session créée
//   3. GET  /api/user             → récupère { id, name, email, role, statut }
// ─────────────────────────────────────────────────────────────────────────────

import api from "../lib/axios";

// Étape 1 — Cookie CSRF (obligatoire avant tout POST Sanctum)
export const getCsrfCookie = () =>
  api.get("/sanctum/csrf-cookie");

// Étape 2 — POST /login { name, password }
// name     : colonne "name" de la table users (ex: "admin", "agent", "mabala")
// password : mot de passe en clair (Laravel compare avec le hash bcrypt)
export const loginRequest = ({ name, password }) =>
  api.post("/login", { name, password });

// Étape 3 — Récupérer l'utilisateur connecté
// Retourne : { id, name, email, role, statut }
export const getUser = () =>
  api.get("/api/user");

// Déconnexion
export const logoutRequest = () =>
  api.post("/logout");