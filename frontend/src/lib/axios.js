import axios from "axios";

const api = axios.create({
  baseURL         : import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  withCredentials : true,
  headers: {
    "Content-Type"     : "application/json",
    "Accept"           : "application/json",
    "X-Requested-With" : "XMLHttpRequest",
  },
});

// Intercepteur : injecte le Bearer token si disponible
api.interceptors.request.use((config) => {
  // Token Bearer (Sanctum token)
  const token = localStorage.getItem("bc_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  // Cookie XSRF pour les requêtes POST/PUT/DELETE
  const xsrf = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];
  if (xsrf) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrf);
  }
  return config;
});

export default api;