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
  const [copied, setCopied] = useState(false);
  const [showUnfrozenPopup, setShowUnfrozenPopup] = useState(false);

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

        // ✅ Vérifier si le compte vient d'être dégelé
        if (localStorage.getItem("bc_was_frozen") === "true") {
          setShowUnfrozenPopup(true);
          localStorage.removeItem("bc_was_frozen");
        }

      } catch (err) {
        const msg = err.response?.data?.message || "Impossible de charger le tableau de bord.";
        setError(msg);
        
        // ✅ Marquer le compte comme gelé si on obtient l'erreur de restriction
        if (msg.toLowerCase().includes("gelé") || msg.toLowerCase().includes("désactivé")) {
          localStorage.setItem("bc_was_frozen", "true");
        }

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
    const isFrozen = error.includes("gelé") || error.includes("désactivé");

    // Récupération des informations de l'agent depuis le localStorage pour pré-remplir le mail
    let agentNom = "Non spécifié";
    let kiosqueCode = "Non spécifié";
    let telephone = "Non spécifié";

    try {
      const cached = localStorage.getItem("bc_profil");
      if (cached) {
        const profil = JSON.parse(cached);
        agentNom = profil.nom || agentNom;
        kiosqueCode = profil.kiosque || kiosqueCode;
        telephone = profil.telephone || telephone;
      }
    } catch (e) {
      console.error("Erreur lecture localStorage profil:", e);
    }

    const emailSubject = encodeURIComponent("Demande de déblocage - Kiosque / Compte Gelé");
    const emailBody = encodeURIComponent(
      `Bonjour la Direction Bomba Cash,\n\n` +
      `Mon compte ou mon kiosque a été gelé et je ne peux plus effectuer mes opérations sur le terrain.\n\n` +
      `Voici mes informations :\n` +
      `- Nom de l'agent : ${agentNom}\n` +
      `- Kiosque : ${kiosqueCode}\n` +
      `- Téléphone : ${telephone}\n\n` +
      `Je sollicite votre assistance afin d'obtenir plus de détails sur la cause de cette restriction et de m'aider à réactiver mon compte pour que je puisse continuer mes différentes opérations.\n\n` +
      `Merci d'avance pour votre aide.\n\n` +
      `Cordialement,\n` +
      `${agentNom}`
    );

    const mailtoUrl = `mailto:direction@bombacash.com,support@bombacash.com?subject=${emailSubject}&body=${emailBody}`;

    const handleCopyEmailText = () => {
      const plainSubject = "Demande de déblocage - Kiosque / Compte Gelé";
      const plainBody = 
        `Bonjour la Direction Bomba Cash,\n\n` +
        `Mon compte ou mon kiosque a été gelé et je ne peux plus effectuer mes opérations sur le terrain.\n\n` +
        `Voici mes informations :\n` +
        `- Nom de l'agent : ${agentNom}\n` +
        `- Kiosque : ${kiosqueCode}\n` +
        `- Téléphone : ${telephone}\n\n` +
        `Je sollicite votre assistance afin d'obtenir plus de détails sur la cause de cette restriction et de m'aider à réactiver mon compte pour que je puisse continuer mes différentes opérations.\n\n` +
        `Merci d'avance pour votre aide.\n\n` +
        `Cordialement,\n` +
        `${agentNom}`;

      const textToCopy = `Destinataire : direction@bombacash.com, support@bombacash.com\nSujet : ${plainSubject}\n\n${plainBody}`;
      
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    };

    return (
      <div className="dashboard-container flex-center">
        <div className={isFrozen ? "error-card error-card--frozen" : "error-card"}>
          <div className="error-card__icon-wrapper">
            {isFrozen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-card__icon animate-pulse-slow">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-card__icon">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>
          <h2 className="error-card__title">
            {isFrozen ? "Accès Restreint" : "Erreur de chargement"}
          </h2>
          <p className="error-card__message">{error}</p>
          <div className="error-card__actions">
            <button className="btn-retry" onClick={() => window.location.reload()}>
              Réessayer
            </button>
            {isFrozen && (
              <a href={mailtoUrl} className="btn-support">
                Contacter le support
              </a>
            )}
          </div>
          {isFrozen && (
            <div className="error-card__copy-section">
              <p className="error-card__copy-tip">
                Si votre application mail ne s'ouvre pas, vous pouvez copier le message pré-rempli pour l'envoyer manuellement :
              </p>
              <button 
                className={`btn-copy-fallback ${copied ? "btn-copy-fallback--success" : ""}`} 
                onClick={handleCopyEmailText}
              >
                {copied ? (
                  <>
                    <span>✓</span> Message copié !
                  </>
                ) : (
                  <>
                    <span>📋</span> Copier le message rédigé
                  </>
                )}
              </button>
            </div>
          )}
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
            <p className="stat-card__label">KIOSQUE ASSIGNÉ</p>
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
          <h2 className="rapport-title">Rapport du Kiosque du Jour</h2>
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
                    Aucune transaction dans le kiosque aujourd'hui
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

      {/* ✅ POPUP DÉGEL DU COMPTE */}
      {showUnfrozenPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md overflow-hidden transform scale-100 transition-transform duration-300">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 flex flex-col items-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-center">Nouvelle connexion !</h2>
            </div>
            
            <div className="p-6 flex flex-col items-center text-center">
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Votre compte a été dégelé avec succès. <br/>
                <span className="font-semibold text-gray-900 mt-2 block">Bonne continuation dans vos opérations !</span>
              </p>
              
              <button 
                onClick={() => setShowUnfrozenPopup(false)}
                className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-colors"
              >
                C'est compris, merci
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}