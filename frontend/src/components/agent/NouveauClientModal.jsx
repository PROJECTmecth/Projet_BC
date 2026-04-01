import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Swal from "sweetalert2";
import axiosClient from "../../lib/axios";
import "./NouveauClientModal.css";

const ETAPES = { SCAN: "scan", FORMULAIRE: "formulaire" };

const initialForm = {
  genre: "Homme", prenom: "", nom: "", adresse: "", ville: "",
  activite: "", nationalite: "Résident", type_piece: "CNI",
  num_piece: "", telephone: "+242 06 ", montant: "", duree: "15 jours",
};

export default function NouveauClientModal({ onClose, onSuccess }) {
  const [etape, setEtape]           = useState(ETAPES.SCAN);
  const [form, setForm]             = useState(initialForm);
  const [carteInfo, setCarteInfo]   = useState(null);
  const [scanning, setScanning]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]         = useState({});
  const scannerRef                  = useRef(null);
  const html5QrRef                  = useRef(null);

  // ============================================================
  // ✅ MODE TEST — SIMULATION SCAN (actif pendant les tests)
  // ⚠️  AVANT DE MERGER SUR developpement :
  //     1. Supprimer ce bloc useEffect TEST
  //     2. Décommenter le bloc useEffect PRODUCTION ci-dessous
  // ============================================================
  /* useEffect(() => {
    if (etape !== ETAPES.SCAN) return;
    setScanning(true);
    const timer = setTimeout(() => {
      setScanning(false);
      handleScanResult("BC-001-001"); // ← ID de la carte insérée en base pour les tests
    }, 2000);
    return () => clearTimeout(timer);
  }, [etape]);
  // ============================================================
  // FIN MODE TEST
  // ============================================================
*/

  // ============================================================
  // 🚀 MODE PRODUCTION — VRAI SCANNER CAMÉRA
  // ⚠️  AVANT DE MERGER SUR developpement :
  //     1. Supprimer le bloc useEffect TEST ci-dessus
  //     2. Décommenter CE bloc useEffect ci-dessous
  // ============================================================
  
  useEffect(() => {
    if (etape !== ETAPES.SCAN) return;
    let scanner;

    const startScanner = async () => {
      try {
        setScanning(true);
        scanner = new Html5Qrcode("qr-reader");
        html5QrRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 280, height: 140 } },
          async (decodedText) => {
            await scanner.stop();
            setScanning(false);
            await handleScanResult(decodedText);
          },
          () => {}
        );
      } catch {
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, [etape]);
  
  // ============================================================
  // FIN MODE PRODUCTION
  // ============================================================


  const handleScanResult = async (qrCodeUid) => {
    try {
      const res = await axiosClient.post("/api/agent/scan", { qr_code_uid: qrCodeUid });
      if (res.data.success) {
        const result = await Swal.fire({
          title: "Carte détectée",
          html: `<p>Numéro : <b>${res.data.data.numero_carte}</b></p>
                 <p>Voulez-vous enregistrer un client sur cette carte ?</p>`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Oui, continuer",
          cancelButtonText: "Non",
          confirmButtonColor: "#F97316",
          cancelButtonColor: "#6B7280",
        });
        if (result.isConfirmed) {
          setCarteInfo(res.data.data);
          setEtape(ETAPES.FORMULAIRE);
        } else {
          setEtape(ETAPES.SCAN);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Carte invalide ou déjà utilisée.";
      await Swal.fire({ icon: "error", title: "Erreur", text: msg, confirmButtonColor: "#F97316" });
      setEtape(ETAPES.SCAN);
    }
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.prenom.trim())    e.prenom    = "Requis";
    if (!form.nom.trim())       e.nom       = "Requis";
    if (!form.adresse.trim())   e.adresse   = "Requis";
    if (!form.ville.trim())     e.ville     = "Requis";
    if (!form.activite.trim())  e.activite  = "Requis";
    if (!form.num_piece.trim()) e.num_piece = "Requis";
    if (!form.telephone.trim()) e.telephone = "Requis";
    if (!form.montant || Number(form.montant) < 1000) e.montant = "Montant minimum : 1 000 F";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const result = await Swal.fire({
      title: "Confirmer l'enregistrement ?",
      html: `<p>Client : <b>${form.prenom} ${form.nom}</b></p>
             <p>Carte : <b>${carteInfo.numero_carte}</b></p>
             <p>Montant : <b>${Number(form.montant).toLocaleString("fr-FR")} F</b></p>
             <p>Durée : <b>${form.duree}</b></p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Enregistrer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#16A34A",
      cancelButtonColor: "#6B7280",
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await axiosClient.post("/api/agent/clients/register", {
        ...form,
        qr_code_uid: carteInfo.qr_code_uid,
        montant: Number(form.montant),
      });
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
      Swal.fire({ icon: "error", title: "Erreur", text: msg, confirmButtonColor: "#F97316" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {etape === ETAPES.SCAN ? "Scanner la carte" : "Nouveau client"}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ===== ÉTAPE 1 : SCAN ===== */}
        {etape === ETAPES.SCAN && (
          <div className="scan-section">
            <div className="scan-frame-wrapper">
              {/* Icône QR */}
              <div className="scan-qr-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="6" height="6" rx="1" />
                  <rect x="15" y="3" width="6" height="6" rx="1" />
                  <rect x="3" y="15" width="6" height="6" rx="1" />
                  <path d="M15 15h2v2h-2zM19 15h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z" />
                </svg>
              </div>

              <p className="scan-title">Scan en cours...</p>
              <p className="scan-instruction">
                Placez le QR code de la carte vierge devant la caméra
              </p>

              {/* Barre de progression animée */}
              <div className="scan-progress">
                <div className={`scan-progress-bar ${scanning ? "scan-progress-bar--active" : ""}`} />
              </div>

              <p className="scan-hint">
                {scanning
                  ? "Détection automatique en cours..."
                  : "Initialisation..."}
              </p>

              {/* Zone caméra cachée (utilisée en production) */}
              <div id="qr-reader" ref={scannerRef} style={{ display: "none" }} />
            </div>

            <button className="btn-annuler-scan" onClick={onClose}>Annuler</button>
          </div>
        )}

        {/* ===== ÉTAPE 2 : FORMULAIRE ===== */}
        {etape === ETAPES.FORMULAIRE && (
          <div className="form-section">
            <div className="form-two-cols">

              {/* COLONNE GAUCHE : Identification client */}
              <div className="form-col">
                <div className="form-col-header form-col-header--orange">
                  Identification client
                </div>
                <div className="form-col-body">

                  <div className="form-group">
                    <label className="form-label">Genre</label>
                    <div className="radio-group">
                      {["Homme", "Femme"].map(g => (
                        <label key={g} className="radio-label">
                          <input type="radio" name="genre" value={g}
                            checked={form.genre === g} onChange={handleChange} />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Prénom(s) *</label>
                      <input className={`form-input ${errors.prenom ? "form-input--error" : ""}`}
                        name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} />
                      {errors.prenom && <span className="form-error">{errors.prenom}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nom(s) *</label>
                      <input className={`form-input ${errors.nom ? "form-input--error" : ""}`}
                        name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} />
                      {errors.nom && <span className="form-error">{errors.nom}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Adresse</label>
                    <input className={`form-input ${errors.adresse ? "form-input--error" : ""}`}
                      name="adresse" placeholder="Adresse complète" value={form.adresse} onChange={handleChange} />
                    {errors.adresse && <span className="form-error">{errors.adresse}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ville</label>
                    <input className={`form-input ${errors.ville ? "form-input--error" : ""}`}
                      name="ville" placeholder="Ville" value={form.ville} onChange={handleChange} />
                    {errors.ville && <span className="form-error">{errors.ville}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nationalité</label>
                    <select className="form-input" name="nationalite" value={form.nationalite} onChange={handleChange}>
                      <option value="Résident">Résident</option>
                      <option value="Étranger">Étranger</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Pièce d'identité</label>
                      <div className="radio-group radio-group--col">
                        {["CNI", "NIU", "Passeport", "Permis"].map(p => (
                          <label key={p} className="radio-label">
                            <input type="radio" name="type_piece" value={p}
                              checked={form.type_piece === p} onChange={handleChange} />
                            {p}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Numéro de pièce</label>
                      <input className={`form-input ${errors.num_piece ? "form-input--error" : ""}`}
                        name="num_piece" placeholder="Numéro" value={form.num_piece} onChange={handleChange} />
                      {errors.num_piece && <span className="form-error">{errors.num_piece}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input className={`form-input ${errors.telephone ? "form-input--error" : ""}`}
                      name="telephone" placeholder="+242 06 XXX XX XX" value={form.telephone} onChange={handleChange} />
                    {errors.telephone && <span className="form-error">{errors.telephone}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Activité</label>
                    <input className={`form-input ${errors.activite ? "form-input--error" : ""}`}
                      name="activite" placeholder="Profession / Activité" value={form.activite} onChange={handleChange} />
                    {errors.activite && <span className="form-error">{errors.activite}</span>}
                  </div>

                </div>
              </div>

              {/* COLONNE DROITE : Activation carte */}
              <div className="form-col">
                <div className="form-col-header form-col-header--green">
                  Activation carte
                </div>
                <div className="form-col-body">

                  <div className="form-group">
                    <label className="form-label">Numéro de carte *</label>
                    <input className="form-input form-input--readonly"
                      value={carteInfo?.numero_carte || ""} readOnly />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Durée de carte</label>
                    <div className="radio-group">
                      {["15 jours", "30 jours"].map(d => (
                        <label key={d} className="radio-label">
                          <input type="radio" name="duree" value={d}
                            checked={form.duree === d} onChange={handleChange} />
                          {d}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Montant de versement *</label>
                    <input
                      className={`form-input ${errors.montant ? "form-input--error" : ""}`}
                      name="montant" type="number" placeholder="Montant en FCFA"
                      value={form.montant} onChange={handleChange} min="1000" />
                    {errors.montant && <span className="form-error">{errors.montant}</span>}
                  </div>

                  <div className="info-box">
                    <p className="info-box__title">Informations importantes :</p>
                    <ul>
                      <li>La carte sera active immédiatement après validation</li>
                      <li>Le client recevra une carte avec QR code unique</li>
                      <li>La date d'expiration sera calculée automatiquement</li>
                    </ul>
                  </div>

                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-annuler" onClick={onClose} disabled={submitting}>
                Annuler
              </button>
              <button className="btn-enregistrer" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}