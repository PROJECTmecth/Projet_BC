// vite.config.js
// Tailwind est chargé via CDN dans index.html — aucune config PostCSS nécessaire

import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});