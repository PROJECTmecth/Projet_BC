import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 64 }}>🏪</div>
      <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, margin: 0 }}>Dashboard Agent</h1>
      <p style={{ color: "#64748B", fontSize: 15 }}>Bienvenue sur le tableau de bord BOMBA CASH</p>
      <button onClick={() => navigate("/login")}
        style={{ padding: "10px 28px", borderRadius: 10, background: "#10B981", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
        ← Déconnexion
      </button>
    </div>
  );
}
