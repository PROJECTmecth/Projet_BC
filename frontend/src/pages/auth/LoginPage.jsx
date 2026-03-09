import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── MOCK API ─────────────────────────────────────────────────────────────────
// Simule Laravel Sanctum en attendant le vrai backend.
// Quand le back est prêt, remplacer mockApi par :
//   import api from "../api/axios";
//   await api.get("/sanctum/csrf-cookie");
//   await api.post("/login", { username, password });
// ─────────────────────────────────────────────────────────────────────────────
const mockApi = {
  get: (_url) => new Promise((res) => setTimeout(res, 500)),
  post: (_url, data) =>
    new Promise((res, rej) =>
      setTimeout(() => {
        const u = (data.username || "").toLowerCase().trim();
        const p = (data.password || "").trim();
        if (u === "admin" && p === "admin123")
          res({ data: { user: { name: "Admin BOMBA", role: "admin" } } });
        else if (u === "agent" && p === "agent123")
          res({ data: { user: { name: "Agent KALI", role: "agent" } } });
        else if (!u || !p)
          rej({ response: { status: 422, data: { message: "Champs obligatoires.", errors: { username: ["Le nom d'utilisateur est requis."] } } } });
        else
          rej({ response: { status: 422, data: { message: "Identifiants incorrects.", errors: {} } } });
      }, 900)
    ),
};

// ─── ICONES ───────────────────────────────────────────────────────────────────
const IconUser = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconSpinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: type === "success" ? "#10B981" : "#EF4444",
      color: "#fff", padding: "12px 28px", borderRadius: 12,
      fontWeight: 700, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,.3)",
      zIndex: 9999, whiteSpace: "nowrap",
    }}>
      {type === "success" ? "✓  " : "✕  "}{msg}
    </div>
  );
}

// ─── FLUX SANCTUM ─────────────────────────────────────────────────────────────
function FlowStep({ num, label, state }) {
  const colors = { idle: "#475569", active: "#F97316", done: "#10B981" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: state === "idle" ? 0.4 : 1, transition: "opacity .4s" }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: colors[state], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0, transition: "background .4s" }}>
        {state === "done" ? "✓" : num}
      </div>
      <span style={{ fontSize: 11, fontFamily: "monospace", color: state === "active" ? "#FDBA74" : state === "done" ? "#6EE7B7" : "#64748B" }}>
        {label}
      </span>
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();

  const [username,    setUsername]    = useState("");
  const [password,    setPassword]    = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [flowStep,    setFlowStep]    = useState(0);
  const [toast,       setToast]       = useState({ msg: "", type: "" });

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3500);
  };

  const fieldError = (f) => fieldErrors[f]?.[0];

  const handleLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!username.trim() || !password.trim()) {
      showToast("Veuillez remplir tous les champs", "error");
      return;
    }

    setIsLoading(true);
    setFlowStep(1);

    try {
      await mockApi.get("/sanctum/csrf-cookie");
      setFlowStep(2);

      const response = await mockApi.post("/login", { username, password });
      setFlowStep(3);

      const user = response.data?.user;
      showToast(`Connexion réussie — ${user.name}`, "success");

      setTimeout(() => {
        if (user.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }, 900);

    } catch (error) {
      setFlowStep(0);
      if (!error.response) { showToast("Serveur inaccessible.", "error"); return; }
      const { status, data } = error.response;
      if (status === 422)      { setFieldErrors(data.errors ?? {}); showToast(data.message, "error"); }
      else if (status === 419) showToast("Session expirée.", "error");
      else if (status === 429) showToast("Trop de tentatives.", "error");
      else                     showToast("Erreur serveur.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const stepState = (n) => (flowStep > n ? "done" : flowStep === n ? "active" : "idle");

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ minHeight: "100vh", background: "#ffffff", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Fond diagonal orange */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <svg viewBox="0 0 1200 800" style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
            <path d="M 0,600 L 800,100 L 1200,200 L 1200,800 L 0,800 Z" fill="#FF6600"/>
            <path d="M 600,0 L 1200,100 L 1200,0 Z" fill="#FF8833"/>
          </svg>
        </div>

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 940, padding: "24px 20px" }}>

          {/* Logos header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ width: 68, height: 68, background: "#FF6600", borderRadius: 18, boxShadow: "0 4px 20px rgba(0,0,0,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>🐟</div>
            <div style={{ background: "#fff", padding: "10px 22px", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,.12)" }}>
              <span style={{ fontWeight: 900, fontSize: 20 }}>
                <span style={{ color: "#111" }}>BOMBA </span><span style={{ color: "#22C55E" }}>CASH</span>
              </span>
            </div>
          </div>

          {/* Card */}
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,.22)", overflow: "hidden", border: "2px solid #E5E7EB" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 520 }}>

              {/* Colonne gauche */}
              <div style={{ background: "#111827", display: "flex", flexDirection: "column", padding: 36 }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 16px" }}>
                    <span style={{ fontSize: 18 }}>🐷</span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "#15803D" }}>HANN Finance</span>
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 220, height: 260, borderRadius: 16, background: "linear-gradient(160deg,#1E3A5F 0%,#0F172A 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 80 }}>🧑‍💼</span>
                  </div>
                </div>
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, lineHeight: 1.3, letterSpacing: ".04em" }}>
                    LA FINANCE SOLIDAIRE<br/>
                    <span style={{ color: "#F97316" }}>QUI VOUS FAIT GRANDIR</span>
                  </div>
                </div>
              </div>

              {/* Colonne droite — formulaire */}
              <div style={{ background: "#E5E7EB", padding: "40px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>Compte Agent</h2>
                  <div style={{ width: 52, height: 52, background: "#111827", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,.3)" }}>
                    <IconUser/>
                  </div>
                </div>

                <form onSubmit={handleLogin}>

                  {/* Nom d'utilisateur */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>nom d'utilisateur</label>
                    <input
                      type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading} autoComplete="username"
                      style={{ width: "100%", height: 48, padding: "0 16px", borderRadius: 10, fontSize: 15, color: "#111", background: "#fff", border: `2px solid ${fieldError("username") ? "#EF4444" : "#D1D5DB"}`, outline: "none", boxSizing: "border-box", opacity: isLoading ? 0.6 : 1 }}
                    />
                    {fieldError("username") && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#EF4444", fontWeight: 600 }}>{fieldError("username")}</p>}
                  </div>

                  {/* Mot de passe */}
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>mot de passe</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading} autoComplete="current-password"
                        style={{ width: "100%", height: 48, padding: "0 48px 0 16px", borderRadius: 10, fontSize: 15, color: "#111", background: "#fff", border: `2px solid ${fieldError("password") ? "#EF4444" : "#D1D5DB"}`, outline: "none", boxSizing: "border-box", opacity: isLoading ? 0.6 : 1 }}
                      />
                      <button type="button" onClick={() => setShowPwd((v) => !v)}
                        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex", padding: 0 }}>
                        {showPwd ? <IconEyeOff/> : <IconEye/>}
                      </button>
                    </div>
                    {fieldError("password") && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#EF4444", fontWeight: 600 }}>{fieldError("password")}</p>}
                  </div>

                  {/* Bouton connexion */}
                  <button type="submit" disabled={isLoading}
                    style={{ width: "100%", height: 52, marginTop: 24, background: isLoading ? "#E5B800" : "#FFD700", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, color: "#111", cursor: isLoading ? "not-allowed" : "pointer", boxShadow: "0 4px 20px rgba(255,215,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background .2s" }}>
                    {isLoading ? (<><IconSpinner/> connexion en cours…</>) : "connexion"}
                  </button>

                </form>

                {/* Flux Sanctum live */}
                {flowStep > 0 && (
                  <div style={{ marginTop: 20, padding: "12px 16px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: ".1em", marginBottom: 8 }}>FLUX SANCTUM EN DIRECT</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <FlowStep num={1} label="GET /sanctum/csrf-cookie"    state={stepState(1)}/>
                      <FlowStep num={2} label="POST /login → vérification"  state={stepState(2)}/>
                      <FlowStep num={3} label="Session créée → redirection" state={stepState(3)}/>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Copyright */}
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#6B7280", fontWeight: 500 }}>
            johann Finance.SA Copyright © 2026
          </div>

          {/* Comptes de test */}
          <div style={{ position: "fixed", bottom: 80, right: 16, background: "#fff", borderRadius: 14, padding: "14px 18px", boxShadow: "0 8px 32px rgba(0,0,0,.15)", border: "2px solid #E5E7EB", fontSize: 12, minWidth: 190 }}>
            <div style={{ fontWeight: 800, color: "#111", marginBottom: 10, fontSize: 13 }}>🔑 Comptes de test</div>
            <div style={{ background: "#EFF6FF", borderRadius: 8, padding: "8px 12px", marginBottom: 8, border: "1px solid #BFDBFE" }}>
              <div style={{ fontWeight: 700, color: "#1E40AF", marginBottom: 2 }}>Admin :</div>
              <code style={{ color: "#2563EB", fontSize: 12 }}>admin / admin123</code>
            </div>
            <div style={{ background: "#FFF7ED", borderRadius: 8, padding: "8px 12px", border: "1px solid #FED7AA" }}>
              <div style={{ fontWeight: 700, color: "#C2410C", marginBottom: 2 }}>Agent :</div>
              <code style={{ color: "#EA580C", fontSize: 12 }}>agent / agent123</code>
            </div>
          </div>

        </div>

        <Toast msg={toast.msg} type={toast.type}/>
      </div>
    </>
  );
}
