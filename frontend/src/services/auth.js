// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/services/auth.js
//
// Service d'authentification — appels RÉELS vers Laravel Sanctum.
// Login via le champ "name" (colonne name de la table users)
//
// ── FLUX ─────────────────────────────────────────────────────────────────────
//   1. GET  /sanctum/csrf-cookie      → Laravel pose le cookie XSRF-TOKEN
//   2. POST /login { name, password } → session créée + cookie laravel_session
//   3. GET  /api/user                 → { id, name, email, role, statut }
// ─────────────────────────────────────────────────────────────────────────────

import api from "../lib/axios";

// ── Étape 1 — Cookie CSRF ─────────────────────────────────────────────────────
// Obligatoire avant tout POST Sanctum — pose le cookie XSRF-TOKEN
export const getCsrfCookie = () =>
  api.get("/sanctum/csrf-cookie");

// ── Étape 2 — Login ───────────────────────────────────────────────────────────
// ⚠️  Le backend attend "name" (pas "username" ni "email")
// name     = colonne "name" de la table users (ex: "admin", "agent")
// password = mot de passe en clair (Laravel compare avec le hash bcrypt)
export const loginRequest = ({ name, password }) =>
  api.post("/login", { name, password });

// ── Étape 3 — Utilisateur connecté ───────────────────────────────────────────
// Retourne : { id, name, email, role, statut }
export const getUser = () =>
  api.get("/api/user");

// ── Déconnexion ───────────────────────────────────────────────────────────────
export const logoutRequest = () =>
  api.post("/logout");