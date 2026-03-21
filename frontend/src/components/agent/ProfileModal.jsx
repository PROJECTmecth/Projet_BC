export default function ProfileModal({ user, profil, onClose, onLogout }) {
  const lat = profil?.latitude ?? -4.2634;
  const lng = profil?.longitude ?? 15.2429;
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&output=embed`;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1000,
        }}
      />

      {/* Modal large horizontal */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
        background: "#fff",
        borderRadius: "16px",
        width: "min(680px, 95vw)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        overflow: "hidden",
      }}>

        {/* Header orange */}
        <div style={{
          background: "linear-gradient(135deg, #F97316, #F59E0B)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: "16px", letterSpacing: "1px" }}>
            PROFIL AGENT
          </span>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.3)",
            border: "none", borderRadius: "50%",
            width: 32, height: 32,
            color: "#fff", fontWeight: 700,
            cursor: "pointer", fontSize: "16px",
          }}>✕</button>
        </div>

        {/* Corps — ligne horizontale */}
        <div style={{ display: "flex", gap: 0 }}>

          {/* Colonne gauche — infos */}
          <div style={{
            flex: 1,
            padding: "24px",
            borderRight: "1px solid #f0f0f0",
          }}>
            {/* Avatar + nom */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{
                width: 64, height: 64,
                borderRadius: "50%",
                background: "#F3F4F6",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M3 21c0-5 4-9 9-9s9 4 9 9" />
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: "18px", color: "#111" }}>
                  Agent {user?.name ?? "—"}
                </p>
                <span style={{
                  display: "inline-block",
                  background: profil?.statut === "en_ligne" ? "#DCFCE7" : "#FEE2E2",
                  color: profil?.statut === "en_ligne" ? "#16A34A" : "#DC2626",
                  fontSize: "11px", fontWeight: 700,
                  padding: "2px 8px", borderRadius: "999px", marginTop: "4px",
                }}>
                  {profil?.statut === "en_ligne" ? "● En ligne" : "● Hors ligne"}
                </span>
              </div>
            </div>

            {/* Infos détail */}
            {[
              { label: "Kiosque", value: profil?.kiosque },
              { label: "Adresse", value: profil?.adresse },
              { label: "Ville", value: profil?.ville },
              { label: "Téléphone", value: profil?.telephone },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: "flex", gap: "8px",
                padding: "8px 0",
                borderBottom: "1px solid #F9FAFB",
              }}>
                <span style={{ color: "#6B7280", fontSize: "13px", minWidth: "80px", fontWeight: 600 }}>
                  {label} :
                </span>
                <span style={{ color: "#111", fontSize: "13px", fontWeight: 500 }}>
                  {value ?? "—"}
                </span>
              </div>
            ))}

            {/* Bouton déconnexion */}
            <button onClick={onLogout} style={{
              marginTop: "24px",
              width: "100%",
              padding: "12px",
              background: "linear-gradient(135deg, #F97316, #F59E0B)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "15px",
              cursor: "pointer",
              letterSpacing: "0.5px",
            }}>
              Déconnexion
            </button>
          </div>

          {/* Colonne droite — carte */}
          <div style={{ flex: 1, padding: "24px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              marginBottom: "12px",
            }}>
              <span style={{ fontSize: "18px" }}>📍</span>
              <span style={{ fontWeight: 700, fontSize: "14px", color: "#374151" }}>Localisation</span>
            </div>
            <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
              <iframe
                title="Localisation kiosque"
                src={mapUrl}
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}