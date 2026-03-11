// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/services/mockApi.js
//
// Simule les appels API Laravel (Sanctum) pendant la phase de développement
// frontend, quand le backend n'est pas encore branché.
//
// ── COMMENT PASSER AU VRAI BACKEND ? ─────────────────────────────────────────
// Remplacer tout ce fichier par :
//
//   import api from "./axios";         // votre instance Axios configurée
//
//   export const getCsrfCookie = () => api.get("/sanctum/csrf-cookie");
//   export const loginRequest  = (data) => api.post("/login", data);
//
// Et mettre à jour l'import dans LoginPage.jsx :
//   import { getCsrfCookie, loginRequest } from "../../services/api";
// ─────────────────────────────────────────────────────────────────────────────

// Délais simulés pour se rapprocher d'un vrai réseau
const CSRF_DELAY  = 450;  // ms — temps simulé pour GET /sanctum/csrf-cookie
const LOGIN_DELAY = 900;  // ms — temps simulé pour POST /login

// Comptes de test disponibles
// Structure : { username: password }
const TEST_ACCOUNTS = {
  admin: { password: "admin123", user: { name: "Admin BOMBA", role: "admin"  } },
  agent: { password: "agent123", user: { name: "Agent KALI",  role: "agent"  } },
};

// ─── Simule GET /sanctum/csrf-cookie ─────────────────────────────────────────
// En vrai : Laravel pose un cookie XSRF-TOKEN que Axios lit automatiquement.
// Ici on attend juste un délai pour simuler le round-trip réseau.
export const getCsrfCookie = () =>
  new Promise((resolve) => setTimeout(resolve, CSRF_DELAY));


// ─── Simule POST /login ───────────────────────────────────────────────────────
// Reçoit { username, password } et résout/rejette comme le ferait Laravel.
//
// Cas gérés :
//   - Champs vides             → rejet 422 avec message de validation
//   - Identifiants incorrects  → rejet 422 avec message générique
//   - Identifiants corrects    → résolution avec objet user
export const loginRequest = ({ username, password }) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const u = (username || "").toLowerCase().trim();
      const p = (password  || "").trim();

      // ── Validation : champs vides ──────────────────────────────────
      if (!u || !p) {
        return reject({
          response: {
            status: 422,
            data: {
              message: "Veuillez remplir tous les champs.",
              errors : {
                username: ["Le nom d'utilisateur est requis."],
              },
            },
          },
        });
      }

      // ── Vérification des identifiants ──────────────────────────────
      const account = TEST_ACCOUNTS[u];
      if (account && account.password === p) {
        // Succès → retourne le même format que Laravel Resource
        return resolve({ data: { user: account.user } });
      }

      // ── Identifiants invalides ─────────────────────────────────────
      return reject({
        response: {
          status: 422,
          data: {
            message: "Nom d'utilisateur ou mot de passe incorrect.",
            errors : {},
          },
        },
      });
    }, LOGIN_DELAY);
  });