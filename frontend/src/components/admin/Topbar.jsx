// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/Topbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useNavigate } from "react-router-dom";
import { useAuth }     from "../../context/AuthContext";
import logo            from "../../assets/logos/logo2.jpeg";

export default function Topbar({ isMobile = false, onMenuOpen }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initiales = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-4 sm:px-6 flex items-center gap-3 sticky top-0 z-20 shadow-sm">

      {/* Bouton hamburger mobile — icône poisson */}
      {isMobile && (
        <button
          onClick={onMenuOpen}
          className="w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0 border-2 border-[#FF6600]"
          title="Ouvrir le menu"
        >
          <img src={logo} alt="Menu" className="w-full h-full object-cover" />
        </button>
      )}

      <div className="flex-1" />

      {/* Bouton Aide — style vert pill */}
      <button
        onClick={() => navigate("/admin/aide")}
        className="flex items-center gap-2 text-sm font-semibold text-green-700 border-2 border-green-500 rounded-full px-3 py-1 hover:bg-green-50 transition-colors"
      >
        <div className="w-[18px] h-[18px] bg-green-500 rounded-full flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-white">?</span>
        </div>
        <span className="hidden sm:inline">Aide</span>
      </button>

      <div className="h-6 w-px bg-gray-200" />

      {/* Infos utilisateur */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500 hidden sm:block">
          Bienvenue <span className="font-bold text-gray-800">{user?.name || "Admin"}</span>
        </p>
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
