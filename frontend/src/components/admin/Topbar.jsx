// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/Topbar.jsx
//
// Barre supérieure Admin — fidèle au Figma
// Affiche : Aide | Bienvenue [Nom] | Avatar
//
// NOTE BACKEND (équipe) :
//   Le nom de l'utilisateur connecté vient de GET /api/user (Sanctum)
//   Dans useAuth() → user.name  (à connecter quand le backend est prêt)
//   Pour l'instant : props userName avec valeur par défaut
// ─────────────────────────────────────────────────────────────────────────────

// Props :
//   userName : string — nom de l'agent connecté
//              SOURCE BACKEND : user.name depuis useAuth() / Sanctum
export default function Topbar({ userName = "Agent MBOUANDI" }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-end gap-5 sticky top-0 z-20 shadow-sm">

      {/* ── Bouton Aide ─────────────────────────────────────────────── */}
      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <span className="font-medium">Aide</span>
        <div className="w-[22px] h-[22px] rounded-full border-2 border-blue-400 flex items-center justify-center">
          <span className="text-[10px] font-bold text-blue-500">?</span>
        </div>
      </button>

      {/* Séparateur vertical */}
      <div className="h-6 w-px bg-gray-200" />

      {/* ── Infos utilisateur ───────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500">
          Bienvenue{" "}
          <span className="font-bold text-gray-800">{userName}</span>
        </p>

        {/* Avatar rond
            PROD : remplacer par <img src={user.avatar} className="w-9 h-9 rounded-full object-cover" />
            ou initiales : user.name.slice(0,2).toUpperCase() */}
        <button className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </button>
      </div>
    </header>
  );
}