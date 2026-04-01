import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axiosClient from "../../lib/axios";
import "./ProfilClientPage.css";

export default function ProfilClientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient]       = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/api/agent/clients/${id}`);
        setClient(res.data.data);
      } catch {
        Swal.fire({ icon: "error", title: "Erreur", text: "Client introuvable.", confirmButtonColor: "#F97316" });
        navigate("/agent/clients");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const fmt = (v) => new Intl.NumberFormat("fr-FR").format(v) + " F";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

  // Cercle de progression SVG
  const CircleProgress = ({ pct = 0 }) => {
    const r = 54;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
      <div className="circle-wrapper">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#E5E7EB" strokeWidth="12" />
          <circle cx="70" cy="70" r={r} fill="none" stroke="#16A34A" strokeWidth="12"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)" />
          <text x="70" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="#111">
            {pct}%
          </text>
        </svg>
      </div>
    );
  };

  if (loading) return (
    <div className="profil-container">
      <div className="skeleton-block" style={{ height: 120, marginBottom: 24 }} />
      <div className="skeleton-block" style={{ height: 300 }} />
    </div>
  );

  if (!client) return null;

  const { infos, carte, compte, transactions } = client;

  return (
    <div className="profil-container">

      {/* Header */}
      <div className="profil-header">
        <button className="btn-back" onClick={() => navigate("/agent/clients")}>
          ← <span>Profil Client</span>
        </button>
        <button
          className="btn-ajouter-op"
          onClick={() => navigate(`/agent/clients/${id}/operation`)}
        >
          + Ajouter une opération
        </button>
      </div>

      {/* Bloc identité */}
      <div className="profil-identite">
        <div className="profil-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div className="profil-infos">
          <h2 className="profil-nom">{infos.prenom} {infos.nom}</h2>
          <p>Activité : {infos.activite}</p>
          <p>Adresse : {infos.adresse}, {infos.ville}</p>
          <p>Nationalité : {infos.nationalite}</p>
          <p>Téléphone : {infos.telephone}</p>
          <p>Résident : {infos.nationalite === "Résident" ? "OUI" : "NON"}</p>
        </div>
      </div>

      {/* Bloc carte + progression */}
      <div className="profil-carte-section">

        {/* Cercle progression */}
        <div className="profil-progression">
          <CircleProgress pct={carte?.progression ?? 0} />
        </div>

        {/* Détails carte */}
        <div className="profil-carte-details">
          <div className="carte-detail-row">
            <span className="carte-detail-label">Numéro de carte</span>
            <span className="carte-detail-value">{carte?.numero_carte ?? "—"}</span>
          </div>
          <div className="carte-detail-row">
            <span className="carte-detail-label">Date d'activation</span>
            <span className="carte-detail-value">{fmtDate(carte?.date_activation)}</span>
          </div>
          <div className="carte-detail-row">
            <span className="carte-detail-label">Date d'expiration</span>
            <span className="carte-detail-value">{fmtDate(carte?.date_expiration)}</span>
          </div>
          <div className="carte-detail-row">
            <span className="carte-detail-label">Montant de versement</span>
            <span className="carte-detail-value">{fmt(carte?.montant_initial ?? 0)}</span>
          </div>
          <div className="carte-detail-row">
            <span className="carte-detail-label">Montant total accumulé</span>
            <span className="carte-detail-value">{fmt(compte?.solde_total ?? 0)}</span>
          </div>
          <div className="carte-detail-row">
            <span className="carte-detail-label">Statut</span>
            <span className={`badge-statut badge-statut--${carte?.statut}`}>
              {carte?.statut ? carte.statut.charAt(0).toUpperCase() + carte.statut.slice(1) : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Journal de transactions */}
      <div className="profil-journal">
        <h3 className="journal-title">Journal de transaction</h3>
        <div className="journal-table-wrapper">
          <table className="journal-table">
            <thead>
              <tr>
                <th>N./</th>
                <th>DATE</th>
                <th>HEURE</th>
                <th>OPÉRATION</th>
                <th>MONTANT</th>
                <th>KIOSQUE</th>
                <th>AGENT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="journal-empty">
                    Aucune transaction enregistrée
                  </td>
                </tr>
              ) : (
                transactions.map((t, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{t.date}</td>
                    <td>{t.heure}</td>
                    <td>{t.operation}</td>
                    <td className="montant-bold">{t.montant}</td>
                    <td>{t.kiosque}</td>
                    <td>{t.agent}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}