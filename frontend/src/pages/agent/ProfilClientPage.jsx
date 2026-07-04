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

  const fmt = (v) => new Intl.NumberFormat("fr-FR").format(isNaN(Number(v)) ? 0 : Number(v)) + " F";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
  const getPhotoUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = (axiosClient.defaults.baseURL || import.meta.env.VITE_API_URL || window.location.origin || "http://localhost:8000")
      .replace(/\/api\/?$/, '')
      .replace(/\/$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Cercle de progression SVG
  const CircleProgress = ({ pct = 0 }) => {
    // Déterminer la couleur selon la progression
    let color = "#EF4444"; // Rouge (< 30%)
    if (pct >= 90) color = "#16A34A"; // Vert (>= 90%)
    else if (pct >= 60) color = "#3B82F6"; // Bleu (>= 60%)
    else if (pct >= 30) color = "#F59E0B"; // Jaune (>= 30%)

    const r = 54;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
      <div className="circle-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#E5E7EB" strokeWidth="12" />
          <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.8s ease' }}
          />
          <text x="70" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="#111">
            {pct}%
          </text>
        </svg>

        {/* Légende */}
        <div style={{ marginTop: '16px', fontSize: '12px', color: '#6B7280', display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
           <div style={{fontWeight: '600', marginBottom: '2px', color: '#374151', textAlign: 'center'}}>Évolution de l'objectif :</div>
           <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}>
             <div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#EF4444'}}></div> <span>0% - 29%</span>
           </div>
           <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}>
             <div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#F59E0B'}}></div> <span>30% - 59%</span>
           </div>
           <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}>
             <div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#3B82F6'}}></div> <span>60% - 89%</span>
           </div>
           <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}>
             <div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#16A34A'}}></div> <span>90% - 100%</span>
           </div>
        </div>
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

  // Déterminer si le bouton "Ajouter opération" doit être grisé
  const isCarteActive = carte?.statut === 'actif' || carte?.statut === 'active';
  const isObjectifAtteint = (carte?.progression ?? 0) >= 100;
  const isAjoutDisabled = !isCarteActive || isObjectifAtteint;

  const raisonDesactivation = !isCarteActive
    ? `Carte ${carte?.statut ?? 'inactive'}`
    : isObjectifAtteint
      ? 'Objectif atteint (100%)'
      : '';

  return (
    <div className="profil-container">

      {/* Header */}
      <div className="profil-header">
        <button className="btn-back" onClick={() => navigate("/agent/clients")}>
          ← <span>Profil Client</span>
        </button>
        <button
          className={`btn-ajouter-op${isAjoutDisabled ? ' btn-ajouter-op--disabled' : ''}`}
          onClick={() => !isAjoutDisabled && navigate(`/agent/clients/${id}/operation`)}
          disabled={isAjoutDisabled}
          title={raisonDesactivation}
        >
          + Ajouter une opération
          {isAjoutDisabled && (
            <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, opacity: 0.85, marginTop: '2px' }}>
              {raisonDesactivation}
            </span>
          )}
        </button>
      </div>

      {/* Bloc identité */}
      <div className="profil-identite">
          <div className="profil-avatar">
          {infos.photo_piece_url ? (
            <a href={getPhotoUrl(infos.photo_piece_url)} target="_blank" rel="noreferrer">
              <img
                src={getPhotoUrl(infos.photo_piece_url)}
                alt="Photo de pièce"
              loading="lazy"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-client.svg'; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '2px solid #F97316' }}
              />
            </a>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          )}
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
            <div className="carte-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{fmtDate(carte?.date_expiration)}</span>
              {carte?.date_expiration && new Date(carte.date_expiration).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && (carte?.progression ?? 0) < 100 && carte?.statut === 'actif' && (
                <span style={{ backgroundColor: '#EF4444', color: '#FFF', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  En retard
                </span>
              )}
            </div>
          </div>
          <div className="carte-detail-row">
            <span className="carte-detail-label">Montant de versement</span>
            <span className="carte-detail-value">{fmt(carte?.montant_initial ?? 0)}</span>
          </div>
          <div className="carte-detail-row">
            <span className="carte-detail-label">Objectif total</span>
            <span className="carte-detail-value font-bold" style={{ color: '#1F2937' }}>
              {fmt((carte?.montant_initial ?? 0) * (carte?.duree === '15 jours' ? 15 : 30))}
            </span>
          </div>
          <div className="carte-detail-row">
            <span className="carte-detail-label">Montant total accumulé</span>
            <span className="carte-detail-value font-bold text-green-600" style={{ color: '#16A34A' }}>{fmt(compte?.solde_total ?? 0)}</span>
          </div>
          <div className="carte-detail-row">
            <span className="carte-detail-label">Montant restant à atteindre</span>
            <span className="carte-detail-value font-bold" style={{ color: '#F59E0B' }}>
              {fmt(Math.max(0, ((carte?.montant_initial ?? 0) * (carte?.duree === '15 jours' ? 15 : 30)) - (compte?.solde_total ?? 0)))}
            </span>
          </div>
          <div className="carte-detail-row">
            <span className="carte-detail-label">Commissions (Frais & Pénalités)</span>
            <span className="carte-detail-value font-bold" style={{ color: '#EF4444' }}>
              {fmt((Number(compte?.total_frais_garde) || 0) + (Number(compte?.total_penalites) || 0))}
            </span>
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