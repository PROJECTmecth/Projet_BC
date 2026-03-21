import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "../components/agent/ProfileModal";
import logo2 from "../assets/logos/logo2.jpeg";
import logo3 from "../assets/logos/logo3.jpeg";

export default function AgentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
const [profil, setProfil] = useState(() => {
  try {
    const stored = localStorage.getItem("bc_profil");
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
});
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="agent-layout">

      <header className="agent-header" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: "64px",
        background: "#fff",
        borderBottom: "1px solid #F0F0F0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={logo2}
            alt="BOMBA CASH logo"
            style={{ width: "48px", height: "48px", borderRadius: "10px", objectFit: "cover" }}
          />
          <img
            src={logo3}
            alt="BOMBA CASH"
            style={{ height: "36px", objectFit: "contain", maxWidth: "140px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "transparent",
            border: "2px solid #16A34A",
            borderRadius: "999px",
            color: "#16A34A",
            fontWeight: 700,
            padding: "6px 16px",
            cursor: "pointer",
            fontSize: "14px",
          }}>
            <span style={{
              width: 18, height: 18,
              background: "#16A34A",
              borderRadius: "50%",
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 900,
            }}>?</span>
            Aide
          </button>

          <span style={{ fontSize: "14px", color: "#374151" }}>
            Bienvenue <strong>{user?.name ?? "Agent"}</strong>
          </span>

          <button
            onClick={() => setShowProfile(true)}
            aria-label="Voir le profil"
            style={{
              width: 40, height: 40,
              borderRadius: "50%",
              background: "#F3F4F6",
              border: "none",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </button>
        </div>
      </header>

      <div className="status-banner">
        <span className="status-dot" />
        Votre compte est actif et connecté, vous pouvez passer vos opérations en toute sécurité !
      </div>

      <main className="agent-main">
        <Outlet context={{ setProfil }} />
      </main>

      <footer className="agent-footer">
        JOHANN Finance .SA Copyright ©2025
      </footer>

      {showProfile && (
        <ProfileModal
          user={user}
          profil={profil}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}