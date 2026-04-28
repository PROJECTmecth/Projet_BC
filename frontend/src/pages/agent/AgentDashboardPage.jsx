import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axiosClient from "../../lib/axios";
import "./AgentDashboardPage.css";

export default function AgentDashboardPage() {
  const navigate = useNavigate();
  const { setProfil } = useOutletContext() ?? {};

  const [stats, setStats] = useState({
    total_clients: 0,
    total_kiosques: 0,
    solde_total: 0,
    revenus_encaisses: 0,
  });
  const [rapportJour, setRapportJour] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get("/api/agent/dashboard");
        const { data } = response.data;
        setStats(data.stats);
        setRapportJour(data.rapport_jour);
        // ✅ Passer le profil au layout + sauvegarder en localStorage
        if (setProfil) setProfil(data.profil);
        localStorage.setItem("bc_profil", JSON.stringify(data.profil));
      } catch (err) {
        setError("Impossible de charger le tableau de bord.");
        console.error("Dashboard agent error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatMontant = (val) =>
    new Intl.NumberFormat("fr-FR").format(val) + " F";

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="skeleton-grid">
          {[...Array(4)].map((_, i) => (<div key={i} className="skeleton-card" />))}
        </div>
        <div className="skeleton-grid-3">
          {[...Array(3)].map((_, i) => (<div key={i} className="skeleton-card" />))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-box">
          <span>⚠️</span> {error}
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      <section className="stats-grid" aria-label="Statistiques">

        <div className="stat-card stat-card--white">
          <div className="stat-card__content">
            <p className="stat-card__label">NOMBRE TOTAL CLIENTS</p>
            <p className="stat-card__value">{stats.total_clients}</p>
          </div>
          <div className="stat-card__icon stat-card__icon--blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="7" r="4" />
              <path d="M3 21v-1a6 6 0 0 1 6-6h0" />
              <circle cx="17" cy="11" r="3" />
              <path d="M21 21v-1a4 4 0 0 0-4-4h0" />
            </svg>
          </div>
        </div>

        <div className="stat-card stat-card--white">
          <div className="stat-card__content">
            <p className="stat-card__label">NOMBRE TOTAL KIOSQUES</p>
            <p className="stat-card__value">{stats.total_kiosques}</p>
          </div>
          <div className="stat-card__icon stat-card__icon--green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9M15 21V9" />
            </svg>
          </div>
        </div>

        <div className="stat-card stat-card--orange">
          <div className="stat-card__content">
            <p className="stat-card__label">SOLDE DE TOUT COMPTE</p>
            <p className="stat-card__value">{formatMontant(stats.solde_total)}</p>
          </div>
          <div className="stat-card__icon stat-card__icon--orange-light">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M16 12a2 2 0 1 0 0 .001M2 10h20" />
            </svg>
          </div>
        </div>

        <div className="stat-card stat-card--yellow">
          <div className="stat-card__content">
            <p className="stat-card__label">REVENUS ENCAISSÉS</p>
            <p className="stat-card__value">{formatMontant(stats.revenus_encaisses)}</p>
          </div>
          <div className="stat-card__icon stat-card__icon--yellow-light">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
        </div>

      </section>

      <section className="modules-grid" aria-label="Modules">

        <button className="module-card module-card--yellow" onClick={() => navigate("/agent/clients")}>
          <div className="module-card__icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="7" r="4" />
              <path d="M3 21v-1a6 6 0 0 1 6-6h0" />
              <circle cx="17" cy="11" r="3" />
              <path d="M21 21v-1a4 4 0 0 0-4-4h0" />
            </svg>
          </div>
          <span className="module-card__label">Mes clients</span>
        </button>

        <button className="module-card module-card--white" onClick={() => navigate("/agent/historique")}>
          <div className="module-card__icon-wrapper module-card__icon-wrapper--gray">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
              <path d="M3.05 11A9 9 0 0 1 12 3" strokeDasharray="2 2" />
            </svg>
          </div>
          <span className="module-card__label">Historique</span>
        </button>

        {/* ✅ CORRECTION ICI : /agent/scanner → /agent/scan */}
        <button className="module-card module-card--white" onClick={() => navigate("/agent/scan")}>
          <div className="module-card__icon-wrapper module-card__icon-wrapper--gray">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="6" height="6" rx="1" />
              <rect x="15" y="3" width="6" height="6" rx="1" />
              <rect x="3" y="15" width="6" height="6" rx="1" />
              <path d="M15 15h2v2h-2zM19 15h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z" />
            </svg>
          </div>
          <span className="module-card__label">Scanne carte</span>
        </button>

      </section>

      <section className="rapport-section" aria-label="Rapport du jour">
        <div className="rapport-header">
          <h2 className="rapport-title">Rapport des Kiosques du Jour</h2>
        </div>
        <div className="rapport-table-wrapper">
          <table className="rapport-table">
            <thead>
              <tr>
                <th>ID CARTE</th>
                <th>NOM ET PRÉNOM</th>
                <th>OPÉRATION</th>
                <th>MONTANT</th>
                <th>HEURE</th>
                <th>AGENT</th>
              </tr>
            </thead>
            <tbody>
              {rapportJour.length === 0 ? (
                <tr>
                  <td colSpan={6} className="rapport-empty">
                    Aucune transaction dans les kiosques aujourd'hui
                  </td>
                </tr>
              ) : (
                rapportJour.map((row, index) => (
                  <tr key={index} className="rapport-row">
                    <td>{row.id_carte}</td>
                    <td>{row.nom_prenom}</td>
                    <td><span className={`badge badge--${row.operation}`}>{row.operation}</span></td>
                    <td className="montant-cell">{row.montant}</td>
                    <td>{row.heure}</td>
                    <td>{row.agent}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}