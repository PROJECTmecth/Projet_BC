// vite.config.js — frontend/
// La config Tailwind est injectée DIRECTEMENT ici.
// Avantage : Tailwind ne cherche plus de fichier config dans l'arborescence
// donc il ne peut pas tomber sur vendor/ de Laravel Breeze.

import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  css: {
    postcss: {
      plugins: [
        // Tailwind chargé inline — pas de tailwind.config.js externe
        (await import("tailwindcss")).default({
          content: [
            "./index.html",
            "./src/**/*.{js,ts,jsx,tsx}",
          ],
          theme: {
            extend: {
              colors: {
                brand: {
                  orange: "#FF6600",
                  yellow: "#FFD700",
                  green : "#16A34A",
                  dark  : "#111827",
                },
              },
              borderRadius: {
                "4xl": "2rem",
                "5xl": "3rem",
                "6xl": "3.75rem",
              },
              boxShadow: {
                "card"  : "0 25px 50px -12px rgba(0,0,0,.25)",
                "header": "0 10px 15px -3px rgba(0,0,0,.10), 0 4px 6px -4px rgba(0,0,0,.10)",
                "toast" : "0 8px 30px rgba(0,0,0,.28)",
                "page"  : "0 50px 100px -20px rgba(0,0,0,.20)",
              },
            },
          },
          plugins: [],
        }),
        (await import("autoprefixer")).default(),
      ],
    },
  },

  server: {
    port: 5173,
    // Pas de proxy — Sanctum a besoin des vraies requêtes cross-origin
  },
});