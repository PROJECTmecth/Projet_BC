// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/Topbar.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initiales depuis le nom
  const initiales = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-end gap-5 sticky top-0 z-20 shadow-sm">

      {/* ── Bouton Aide ──────────────────────────────────────────────── */}
      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <span className="font-medium">Aide</span>
        <div className="w-[22px] h-[22px] rounded-full border-2 border-blue-400 flex items-center justify-center">
          <span className="text-[10px] font-bold text-blue-500">?</span>
        </div>
      </button>

      {/* Séparateur */}
      <div className="h-6 w-px bg-gray-200" />

      {/* ── Infos utilisateur ────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500">
          Bienvenue{" "}
          <span className="font-bold text-gray-800">{user?.name || "Admin"}</span>
        </p>

        {/* Avatar avec initiales → clic → page profil */}
        <button
          onClick={() => navigate("/admin/profil")}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-all shadow-sm"
          style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}
          title="Mon profil"
        >
          {initiales}
        </button>
      </div>
    </header>
  );
}