import axios from "axios";

// === URL de base ===
let apiURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Sécurité : si l'URL ne commence pas par http (ex: oubli dans Vercel), on force https://
if (apiURL && !apiURL.startsWith("http")) {
  apiURL = `https://${apiURL}`;
}

// Supprime le slash final s'il est présent (évite les doubles slashes dans les routes)
apiURL = apiURL.replace(/\/$/, "");

if (import.meta.env.DEV) {
  console.log("🔍 VITE_API_URL:", import.meta.env.VITE_API_URL);
  console.log("🔍 baseURL finale:", apiURL);
}

// ========================
const api = axios.create({
  baseURL: apiURL,
  // ❌ withCredentials retiré : on utilise Bearer token (localStorage),
  //    pas les cookies de session. Les deux ensemble = CORS qui bloque.
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",         // Force Laravel à répondre en JSON
    "X-Requested-With": "XMLHttpRequest", // Identifie comme requête AJAX
  },
});

// ── Interceptor REQUEST : injecte le Bearer token ─────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bc_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // ❌ XSRF retiré : inutile avec Bearer token stateless
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor RESPONSE : gestion des erreurs globales ───────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide → nettoyage et redirection login
      localStorage.removeItem("bc_token");
      localStorage.removeItem("bc_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;