import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/",
  // ⚠️ PAS de withCredentials en cross-domain (Vercel → Railway)
  // On utilise le Bearer Token stocké en localStorage
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bc_token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default api;