// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/ui/icons.jsx
// Toutes les icônes SVG de l'application — sans dépendance externe
// ─────────────────────────────────────────────────────────────────────────────

// ── Icône Utilisateur (silhouette tête + épaules) ──────────────────────────
// Utilisée dans le header du formulaire de connexion
export const IconUser = () => (
  <svg width="28" height="28" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />           {/* tête */}
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /> {/* épaules */}
  </svg>
);

// ── Icône Œil ouvert (afficher le mot de passe) ────────────────────────────
export const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /> {/* contour */}
    <circle cx="12" cy="12" r="3" />                            {/* pupille */}
  </svg>
);

// ── Icône Œil barré (masquer le mot de passe) ──────────────────────────────
export const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" /> {/* barre diagonale */}
  </svg>
);

// ── Icône Spinner (animation chargement) ───────────────────────────────────
// Requiert @keyframes bc-spin dans src/index.css :
//   @keyframes bc-spin { to { transform: rotate(360deg); } }
export const IconSpinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5"
    // animate-spin de Tailwind fonctionne aussi si on ajoute className="animate-spin"
    // ici on utilise le style inline pour éviter un conflit avec le parent flex
    style={{ animation: "bc-spin 1s linear infinite", flexShrink: 0 }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
             M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);