import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axiosClient from "../../lib/axios";
import "./AjouterOperationPage.css";

const TYPE_OPS = [
  { label: "Dépôt cash",          value: "dépôt_cash" },
  { label: "Retrait cash partiel", value: "retrait_partiel" },
  { label: "Retrait de solde",     value: "retrait_solde_compte" },
];

export default function AjouterOperationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient]       = useState(null);
  const [typeOp, setTypeOp]       = useState("");
  const [montant, setMontant]     = useState("");
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]       = useState({});

  useEffect(() => {
    const fetchClient = async () => {
      try {
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

  const validate = () => {
    const e = {};
    if (!typeOp) e.typeOp = "Sélectionnez un type d'opération";
    if (!montant || Number(montant) < 100) e.montant = "Montant minimum : 100 F";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const typeLabel = TYPE_OPS.find(t => t.value === typeOp)?.label;
    const solde = client?.compte?.solde_total ?? 0;

    // Vérification retrait
    if ((typeOp === "retrait_partiel" || typeOp === "retrait_solde_compte") && Number(montant) > solde) {
      Swal.fire({ icon: "warning", title: "Solde insuffisant",
        text: `Solde disponible : ${fmt(solde)}`, confirmButtonColor: "#F97316" });
      return;
    }

    const confirm = await Swal.fire({
      title: "Confirmer l'opération ?",
      html: `<p>Client : <b>${client.infos.prenom} ${client.infos.nom}</b></p>
             <p>Opération : <b>${typeLabel}</b></p>
             <p>Montant : <b>${Number(montant).toLocaleString("fr-FR")} F</b></p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Valider",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#F59E0B",
      cancelButtonColor: "#6B7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      setSubmitting(true);
      await axiosClient.post("/api/agent/transactions", {
        id_client: id,
        type_op: typeOp,
        montant: Number(montant),
      });
      await Swal.fire({
        icon: "success", title: "Opération enregistrée !",
        timer: 2000, showConfirmButton: false,
      });
      navigate(`/agent/clients/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
      Swal.fire({ icon: "error", title: "Erreur", text: msg, confirmButtonColor: "#F97316" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="op-container">
      <div className="skeleton-block" style={{ height: 100, marginBottom: 20 }} />
      <div className="skeleton-block" style={{ height: 280 }} />
    </div>
  );

  return (
    <div className="op-container">

      {/* Header */}
      <div className="op-header">
        <button className="btn-back" onClick={() => navigate(`/agent/clients/${id}`)}>
          ← <span>Ajouter une opération</span>
        </button>
      </div>

      {/* Résumé client */}
      <div className="op-client-card">
        <div className="op-client-info">
          <p className="op-client-nom">{client?.infos.prenom} {client?.infos.nom}</p>
          <p>Carte : {client?.carte?.numero_carte}</p>
          <p>Téléphone : {client?.infos.telephone}</p>
        </div>
        <div className="op-client-solde">
          <span className="op-solde-label">Solde actuel</span>
          <span className="op-solde-value">{fmt(client?.compte?.solde_total ?? 0)}</span>
        </div>
      </div>

      {/* Formulaire */}
      <div className="op-form-section">
        <div className="op-form-header">Détails de l'opération</div>
        <div className="op-form-body">

          {/* Type opération */}
          <div className="op-form-group">
            <label className="op-form-label">Type d'opération *</label>
            <select
              className={`op-form-select ${errors.typeOp ? "op-input--error" : ""}`}
              value={typeOp}
              onChange={e => { setTypeOp(e.target.value); setErrors(er => ({ ...er, typeOp: "" })); }}
            >
              <option value="">Sélectionnez le type d'opération</option>
              {TYPE_OPS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.typeOp && <span className="op-form-error">{errors.typeOp}</span>}
          </div>

          {/* Montant */}
          <div className="op-form-group">
            <label className="op-form-label">Montant *</label>
            <input
              className={`op-form-input ${errors.montant ? "op-input--error" : ""}`}
              type="number" placeholder="Entrez le montant en FCFA"
              value={montant} min="100"
              onChange={e => { setMontant(e.target.value); setErrors(er => ({ ...er, montant: "" })); }}
            />
            {errors.montant && <span className="op-form-error">{errors.montant}</span>}
          </div>

          {/* Actions */}
          <div className="op-form-actions">
            <button className="btn-annuler" onClick={() => navigate(`/agent/clients/${id}`)}
              disabled={submitting}>
              Annuler
            </button>
            <button className="btn-valider" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Validation..." : "Valider"}
            </button>
          </div>

        </div>
      </div>

      {/* Attention */}
      <div className="op-attention">
        <span className="op-attention-icon">⚠️</span>
        <div>
          <p className="op-attention-title">Attention</p>
          <p className="op-attention-text">
            Assurez-vous de vérifier le montant avant de valider.
            Toute opération validée sera enregistrée dans l'historique et ne pourra pas être annulée.
          </p>
        </div>
      </div>

    </div>
  );
}