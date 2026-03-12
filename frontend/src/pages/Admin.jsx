import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 64 }}>👑</div>
      <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, margin: 0 }}>Panel Admin</h1>
      <p style={{ color: "#64748B", fontSize: 15 }}>Bienvenue Administrateur BOMBA CASH</p>
      <button onClick={() => navigate("/login")}
        style={{ padding: "10px 28px", borderRadius: 10, background: "#F97316", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
        ← Déconnexion
      </button>
    </div>
  );
}
