import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../lib/axios";
import Swal from "sweetalert2";

const fmt = (n) => Number(n).toLocaleString("fr-FR") + " F";
const todayStr = () => new Date().toISOString().split("T")[0];
const firstOfYear = () => `${new Date().getFullYear()}-01-01`;

const TYPE_LABELS = {
  dépôt_cash:           { label: "Dépôt cash",       color: "#16a34a" },
  retrait_partiel:      { label: "Retrait partiel",   color: "#ea580c" },
  retrait_solde_compte: { label: "Retrait solde",     color: "#dc2626" },
};

const SYNC_LABELS = {
  synchronisé: { label: "Sync",       bg: "#d1fae5", color: "#065f46" },
  en_attente:  { label: "En attente", bg: "#fef3c7", color: "#92400e" },
};

export default function HistoriquePage() {
  const navigate = useNavigate();

  const [dateDebut,     setDateDebut]     = useState(firstOfYear());
  const [dateFin,       setDateFin]       = useState(todayStr());
  const [typeOp,        setTypeOp]        = useState("");
  const [clientSearch,  setClientSearch]  = useState("");
  const [transactions,  setTransactions]  = useState([]);
  const [kpi,           setKpi]           = useState({ total: 0, depots: 0, retraits: 0, montant_total: 0 });
  const [pagination,    setPagination]    = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
  const [loading,       setLoading]       = useState(false);

  const fetchHistorique = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { date_debut: dateDebut, date_fin: dateFin, page, per_page: 15 };
      if (typeOp)              params.type_op = typeOp;
      if (clientSearch.trim()) params.client  = clientSearch.trim();

      const { data } = await axiosClient.get("/api/agent/historique", { params });

      setTransactions(data.transactions.data || []);
      setPagination({
        current_page: data.transactions.current_page,
        last_page:    data.transactions.last_page,
        per_page:     data.transactions.per_page,
        total:        data.transactions.total,
      });
      setKpi(data.kpi || { total: 0, depots: 0, retraits: 0, montant_total: 0 });
    } catch (err) {
      Swal.fire({
        icon: "error", title: "Erreur",
        text: err?.response?.data?.message || "Impossible de charger l'historique.",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setLoading(false);
    }
  }, [dateDebut, dateFin, typeOp, clientSearch]);

  useEffect(() => { fetchHistorique(1); }, []);

  const buildParams = () => {
    const p = new URLSearchParams({ date_debut: dateDebut, date_fin: dateFin });
    if (typeOp)              p.append("type_op", typeOp);
    if (clientSearch.trim()) p.append("client",  clientSearch.trim());
    return p.toString();
  };

  const triggerDownload = async (url, filename) => {
    try {
      const response = await axiosClient.get(url, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.setAttribute("download", filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      Swal.fire({ icon: "error", title: "Export échoué", confirmButtonColor: "#f97316" });
    }
  };

  const exportExcel = () =>
    triggerDownload(
      `/api/agent/historique/export-excel?${buildParams()}`,
      `historique_${dateDebut}_${dateFin}.csv`
    );

  const exportPDF = () =>
    triggerDownload(
      `/api/agent/historique/export-pdf?${buildParams()}`,
      `historique_${dateDebut}_${dateFin}.pdf`
    );

  const pageNumbers = () => {
    const pages = Array.from({ length: pagination.last_page }, (_, i) => i + 1);
    return pages.reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);
  };

  return (
    <div style={{ background: "#fdf6ec", minHeight: "100vh", fontFamily: "sans-serif" }}>

      <div style={{ padding: "24px 32px 0" }}>

        {/* Titre */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#1e293b" }}>
            ←
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Historique des opérations
          </h1>
        </div>

        {/* Filtres */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "16px 20px",
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12,
          marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}>
          <label style={labelSt}>Du</label>
          <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} style={inputSt} />

          <label style={labelSt}>Au</label>
          <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} style={inputSt} />

          <select value={typeOp} onChange={e => setTypeOp(e.target.value)} style={{ ...inputSt, minWidth: 170 }}>
            <option value="">Tous les types</option>
            <option value="dépôt_cash">Dépôt cash</option>
            <option value="retrait_partiel">Retrait partiel</option>
            <option value="retrait_solde_compte">Retrait solde</option>
          </select>

          <input type="text" placeholder="Rechercher un client…"
            value={clientSearch} onChange={e => setClientSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchHistorique(1)}
            style={{ ...inputSt, minWidth: 200 }} />

          <button onClick={() => fetchHistorique(1)} disabled={loading} style={{
            background: "#3b82f6", color: "#fff", border: "none",
            borderRadius: 8, padding: "9px 22px", fontWeight: 600, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            🔍 {loading ? "Chargement…" : "Rechercher"}
          </button>

          <div style={{ flex: 1 }} />

          <button onClick={exportPDF}   style={exportBtnSt("#dc2626")}>📄 Export PDF</button>
          <button onClick={exportExcel} style={exportBtnSt("#16a34a")}>⬇ Export Excel</button>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
          {[
            { label: "Total des opérations", value: kpi.total,    color: "#3b82f6", icon: "📋" },
            { label: "Dépôts",               value: kpi.depots,   color: "#16a34a", icon: "＋" },
            { label: "Retraits",             value: kpi.retraits, color: "#ea580c", icon: "－" },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={{ ...kpiCardSt, background: color }}>
              <div>
                <p style={kpiLabelSt}>{label}</p>
                <p style={kpiValueSt}>{value}</p>
              </div>
              <div style={kpiIconSt}>{icon}</div>
            </div>
          ))}
        </div>

        {/* Montant total */}
        <div style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
          borderRadius: 16, padding: "28px 32px", textAlign: "center",
          marginBottom: 24, boxShadow: "0 4px 16px rgba(124,58,237,0.25)",
        }}>
          <p style={{ color: "#e9d5ff", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>
            Montant total des opérations
          </p>
          <p style={{ color: "#fff", fontSize: 40, fontWeight: 800, margin: 0, letterSpacing: 1 }}>
            {fmt(kpi.montant_total)}
          </p>
        </div>
      </div>

      {/* Tableau */}
      <div style={{ padding: "0 32px 40px" }}>

        <div style={{ background: "#f97316", borderRadius: "12px 12px 0 0", padding: "14px 20px" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Historique</span>
        </div>

        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", overflow: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#1e293b" }}>
                {["DATE","NOM ET PRÉNOM","OPÉRATION","MONTANT","HEURE","N. CARTE","TÉLÉPHONE","SYNC"].map(h => (
                  <th key={h} style={thSt}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
                  <span style={{ fontSize: 28 }}>⏳</span>
                  <p style={{ marginTop: 8 }}>Chargement en cours…</p>
                </td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
                  <span style={{ fontSize: 28 }}>📭</span>
                  <p style={{ marginTop: 8 }}>Aucune transaction pour cette période.</p>
                </td></tr>
              ) : (
                transactions.map((tx, i) => {
                  const op   = TYPE_LABELS[tx.type_op]     || { label: tx.type_op, color: "#6b7280" };
                  const sync = SYNC_LABELS[tx.sync_status] || SYNC_LABELS.en_attente;
                  const dt   = new Date(tx.date_heure);
                  return (
                    <tr key={tx.id_trans}
                      onClick={() => navigate(`/agent/clients/${tx.id_client}`)}
                      style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fff7ed"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#f8fafc"}
                    >
                      <td style={tdSt}>{dt.toLocaleDateString("fr-FR")}</td>
                      <td style={{ ...tdSt, fontWeight: 600 }}>{tx.client_prenom} {tx.client_nom}</td>
                      <td style={tdSt}>
                        <span style={{ background: op.color, color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
                          {op.label}
                        </span>
                      </td>
                      <td style={{ ...tdSt, fontWeight: 700 }}>{fmt(tx.montant)}</td>
                      <td style={tdSt}>{dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")}</td>
                      <td style={{ ...tdSt, fontWeight: 700 }}>{tx.numero_carte || "—"}</td>
                      <td style={tdSt}>{tx.telephone || "—"}</td>
                      <td style={tdSt}>
                        <span style={{ background: sync.bg, color: sync.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>
                          {sync.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 20 }}>
            <button disabled={pagination.current_page === 1 || loading}
              onClick={() => fetchHistorique(pagination.current_page - 1)}
              style={pageBtnSt(false, pagination.current_page === 1 || loading)}>
              ← Préc.
            </button>
            {pageNumbers().map((p, i) =>
              p === "…"
                ? <span key={`d${i}`} style={{ color: "#94a3b8", padding: "0 4px" }}>…</span>
                : <button key={p} onClick={() => fetchHistorique(p)} disabled={loading}
                    style={pageBtnSt(p === pagination.current_page, loading)}>{p}</button>
            )}
            <button disabled={pagination.current_page === pagination.last_page || loading}
              onClick={() => fetchHistorique(pagination.current_page + 1)}
              style={pageBtnSt(false, pagination.current_page === pagination.last_page || loading)}>
              Suiv. →
            </button>
          </div>
        )}

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, marginTop: 10 }}>
          {pagination.total} transaction{pagination.total !== 1 ? "s" : ""} — page {pagination.current_page} / {pagination.last_page}
        </p>
      </div>

      <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, paddingBottom: 24 }}>
        JOHANN Finance SA Copyright ©2026
      </p>
    </div>
  );
}

const labelSt     = { fontSize: 13, fontWeight: 600, color: "#374151" };
const inputSt     = { border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#1e293b", outline: "none", background: "#f8fafc" };
const exportBtnSt = (color) => ({ border: `1.5px solid ${color}`, background: "transparent", color, borderRadius: 8, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" });
const kpiCardSt   = { borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" };
const kpiLabelSt  = { color: "rgba(255,255,255,0.85)", fontSize: 13, margin: "0 0 6px", fontWeight: 500 };
const kpiValueSt  = { color: "#fff", fontSize: 36, fontWeight: 800, margin: 0 };
const kpiIconSt   = { width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 };
const thSt        = { color: "#fff", fontWeight: 700, fontSize: 12, padding: "12px 16px", textAlign: "left", whiteSpace: "nowrap", letterSpacing: 0.5 };
const tdSt        = { padding: "13px 16px", color: "#1e293b", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };
const pageBtnSt   = (active, disabled) => ({ minWidth: 36, height: 36, borderRadius: 8, border: active ? "none" : "1px solid #d1d5db", background: active ? "#f97316" : "#fff", color: active ? "#fff" : "#374151", fontWeight: active ? 700 : 500, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled && !active ? 0.5 : 1 });