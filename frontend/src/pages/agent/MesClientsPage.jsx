import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosClient from "../../lib/axios";
import NouveauClientModal from "../../components/agent/NouveauClientModal";
import "./MesClientsPage.css";

export default function MesClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState("");

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/api/agent/clients");
      setClients(res.data.data.clients);
      setTotal(res.data.data.total);
    } catch {
      Swal.fire({ icon: "error", title: "Erreur", text: "Impossible de charger les clients.", confirmButtonColor: "#F97316" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const filteredClients = clients.filter(c =>
    c.nom_prenom.toLowerCase().includes(search.toLowerCase()) ||
    c.numero_carte.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone.includes(search)
  );

  const handleSuccess = () => {
    setShowModal(false);
    fetchClients();
    Swal.fire({ icon: "success", title: "Client enregistré !", confirmButtonColor: "#F97316", timer: 2000, showConfirmButton: false });
  };

  return (
    <div className="clients-container">

      <div className="clients-header">
        <button className="btn-back" onClick={() => navigate("/agent/dashboard")}>
          ← <span>Mes clients</span>
        </button>
        <button className="btn-nouveau" onClick={() => setShowModal(true)}>
          + Nouveau client
        </button>
      </div>

      <div className="clients-kpi">
        <div className="kpi-content">
          <p className="kpi-label">Total des clients enregistrés</p>
          <p className="kpi-value">{total}</p>
        </div>
        <div className="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="7" r="4" />
            <path d="M3 21v-1a6 6 0 0 1 6-6h0" />
            <circle cx="17" cy="11" r="3" />
            <path d="M21 21v-1a4 4 0 0 0-4-4h0" />
          </svg>
        </div>
      </div>

      <div className="clients-table-section">
        <div className="table-header-bar">
          <span className="table-title">Liste des clients</span>
          <input className="search-input" type="text" placeholder="Rechercher..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="clients-loading">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton-row" />)}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>N. CARTE</th>
                  <th>NOM ET PRÉNOM</th>
                  <th>DATE EMS.</th>
                  <th>DATE EXP.</th>
                  <th>ADRESSE</th>
                  <th>TÉLÉPHONE</th>
                  <th>STATUT</th>
                  <th>INFO</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr><td colSpan={8} className="table-empty">
                    {search ? "Aucun client trouvé." : "Aucun client enregistré."}
                  </td></tr>
                ) : (
                  filteredClients.map((c, i) => (
                    <tr key={i} className="client-row">
                      <td className="carte-num">{c.numero_carte}</td>
                      <td>{c.nom_prenom}</td>
                      <td>{c.date_activation ? new Date(c.date_activation).toLocaleDateString("fr-FR") : "—"}</td>
                      <td>{c.date_expiration ? new Date(c.date_expiration).toLocaleDateString("fr-FR") : "—"}</td>
                      <td className="adresse-cell">{c.adresse?.length > 18 ? c.adresse.slice(0, 18) + "..." : c.adresse}</td>
                      <td>{c.telephone}</td>
                      <td>
                        <span className={`badge-statut badge-statut--${c.statut_carte}`}>
                          {c.statut_carte.charAt(0).toUpperCase() + c.statut_carte.slice(1)}
                        </span>
                      </td>
                      <td>
                        {/* ✅ Clic → page profil client */}
                        <button className="btn-info"
                          onClick={() => navigate(`/agent/clients/${c.id_client}`)}>
                          ⓘ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <NouveauClientModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />
      )}
    </div>
  );
}