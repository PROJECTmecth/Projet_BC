import axios from "axios";

const api = axios.create({
  baseURL         : "http://127.0.0.1:8000",
  withCredentials : true,
  headers: {
    "Content-Type"     : "application/json",
    "Accept"           : "application/json",
    "X-Requested-With" : "XMLHttpRequest",
  },
});

// Intercepteur : lit le cookie XSRF-TOKEN et l'injecte manuellement
// dans chaque requête POST/PUT/DELETE
api.interceptors.request.use((config) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (token) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }

  return config;
});

export default api;