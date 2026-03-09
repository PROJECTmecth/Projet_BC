// ─────────────────────────────────────────────────────────────────────────────
//  src/api/axios.js  –  BOMBA CASH  |  Instance Axios + Sanctum
//  À créer dans : bomba-front/src/api/axios.js
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

const api = axios.create({
  // URL du backend Laravel — lue depuis le fichier .env de React
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',

  // ⚠ CRITIQUE : permet l'envoi des cookies de session Sanctum
  withCredentials: true,

  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Intercepteur : redirige vers /login si la session expire (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLogin = window.location.pathname === '/login';
      if (!isLogin) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;