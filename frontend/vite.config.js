import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: '/',  // ← Important pour Netlify
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      // On redirige tout ce qui commence par /api vers le Laravel
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});