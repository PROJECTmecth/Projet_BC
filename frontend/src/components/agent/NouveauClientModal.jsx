import { useState, useEffect, useRef, useCallback } from "react";
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

const SCANNER_ELEMENT_ID = 'nouveau-client-qr-reader';
const QR_CONFIG = {
  fps: 12,
  qrbox: (vw, vh) => {
    const side = Math.min(vw, vh) * 0.72;
    return { width: Math.round(side), height: Math.round(side) };
  },
  aspectRatio: 1.0,
  experimentalFeatures: { useBarCodeDetectorIfSupported: true },
};

export default function NouveauClientModal({ onClose, onSuccess }) {
  const [etape, setEtape] = useState(ETAPES.SCAN);
  const [form, setForm] = useState(initialForm);
  const [carteInfo, setCarteInfo] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [cameras, setCameras] = useState([]);
  const [useFront, setUseFront] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const html5QrRef = useRef(null);
  const processingRef = useRef(false);
  const trackRef = useRef(null);

  // ─── Nettoyage ────────────────────────────────────────────────
  const stopScanner = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (_) { }
      html5QrRef.current = null;
    }
    trackRef.current = null;
  }, []);

  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  // ─── Appel API scan ───────────────────────────────────────────
  const callScanAPI = useCallback(async (qrCodeUid) => {
    try {
      const res = await axiosClient.post("/api/agent/scan", { numero_carte: qrCodeUid });
      const result = await Swal.fire({
        title: "Carte détectée",
        html: `<p>Numéro : <b>${res.data.carte.numero_carte}</b></p>
               <p>Voulez-vous enregistrer un client sur cette carte ?</p>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Oui, continuer",
        cancelButtonText: "Non",
        confirmButtonColor: "#F97316",
        cancelButtonColor: "#6B7280",
      });
      if (result.isConfirmed) {
        setCarteInfo(res.data);
        setEtape(ETAPES.FORMULAIRE);
      } else {
        await stopScanner();
        setEtape(ETAPES.SCAN);
      }
    } catch (err) {
      await stopScanner();
      const msg = err.response?.data?.message || "Carte invalide ou déjà utilisée.";
      await Swal.fire({ icon: "error", title: "Erreur", text: msg, confirmButtonColor: "#F97316" });
      setEtape(ETAPES.SCAN);
    }
  }, [stopScanner]);

  // ─── Callback QR détecté ─────────────────────────────────────
  const onQrSuccess = useCallback((decodedText) => {
    if (processingRef.current) return;
    processingRef.current = true;
    if (navigator.vibrate) navigator.vibrate([80, 30, 80]);
    callScanAPI(decodedText.trim());
  }, [callScanAPI]);

  // ─── Démarrer le scanner ──────────────────────────────────────
  useEffect(() => {
    if (etape !== ETAPES.SCAN) return;

    setScanning(true);
    setErrors({});
    processingRef.current = false;

    const startScanner = async () => {
      await new Promise(r => setTimeout(r, 80));

      try {
        const camList = await Html5Qrcode.getCameras();
        if (camList?.length) setCameras(camList);

        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false });
        html5QrRef.current = scanner;

        const constraint = camList?.length > 1
          ? { facingMode: useFront ? 'user' : 'environment' }
          : (camList?.[0]?.id ? { deviceId: { exact: camList[0].id } } : { facingMode: 'environment' });

        await scanner.start(
          constraint,
          QR_CONFIG,
          onQrSuccess,
          () => { }
        );

        // Récupérer le track pour le torch
        try {
          const videoElem = document.querySelector(`#${SCANNER_ELEMENT_ID} video`);
          if (videoElem?.srcObject) {
            const [t] = videoElem.srcObject.getVideoTracks();
            if (t) {
              trackRef.current = t;
              const caps = t.getCapabilities?.();
              setTorchSupported(!!(caps?.torch));
            }
          }
        } catch (_) { }

        setScanning(false);
      } catch (err) {
        setScanning(false);
        const msg = err?.message?.includes('Permission')
          ? 'Accès caméra refusé. Autorisez la caméra.'
          : err?.message?.includes('No camera')
            ? 'Aucune caméra détectée.'
            : `Erreur caméra : ${err.message}`;

        Swal.fire({
          icon: 'error',
          title: 'Caméra indisponible',
          text: msg,
          confirmButtonColor: '#f97316',
        });
      }
    };

    startScanner();

    return () => { stopScanner(); };
  }, [etape, useFront, onQrSuccess, stopScanner]);

  // ─── Changer de caméra ────────────────────────────────────────
  const flipCamera = useCallback(async () => {
    setUseFront(prev => !prev);
    await stopScanner();
    setTorchOn(false);
  }, [stopScanner]);

  // ─── Toggle Torch ─────────────────────────────────────────────
  const toggleTorch = useCallback(async () => {
    if (!trackRef.current) return;
    const next = !torchOn;
    try {
      await trackRef.current.applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch (_) { }
  }, [torchOn]);

  // ─── Reset scan ───────────────────────────────────────────────
  const resetScan = async () => {
    await stopScanner();
    processingRef.current = false;
    setCarteInfo(null);
    setErrors({});
    setTorchOn(false);
    setEtape(ETAPES.SCAN);
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.prenom.trim()) e.prenom = "Requis";
    if (!form.nom.trim()) e.nom = "Requis";
    if (!form.adresse.trim()) e.adresse = "Requis";
    if (!form.ville.trim()) e.ville = "Requis";
    if (!form.activite.trim()) e.activite = "Requis";
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
             <p>Carte : <b>${carteInfo.carte.numero_carte}</b></p>
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
        numero_carte: carteInfo.carte.numero_carte,
        montant: Number(form.montant),
      });
      await stopScanner();
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

              {/* Zone caméra visible */}
              <div className="scanner-container">
                <div
                  id={SCANNER_ELEMENT_ID}
                  className="scanner-video-wrapper"
                  style={{ minHeight: 'min(72vw, 360px)' }}
                />

                {/* Overlay coins animés */}
                <div className="scanner-overlay">
                  <span className="scanner-corner scanner-corner--tl" />
                  <span className="scanner-corner scanner-corner--tr" />
                  <span className="scanner-corner scanner-corner--bl" />
                  <span className="scanner-corner scanner-corner--br" />
                  <div className="scanner-line" />
                </div>
              </div>

              <div className="scan-info">
                <div className="scan-qr-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="6" height="6" rx="1" />
                    <rect x="15" y="3" width="6" height="6" rx="1" />
                    <rect x="3" y="15" width="6" height="6" rx="1" />
                    <path d="M15 15h2v2h-2zM19 15h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z" />
                  </svg>
                </div>
                <p className="scan-title">Placez le QR code dans le cadre</p>
                <p className="scan-instruction">
                  Scannez le QR code de la carte vierge pour continuer
                </p>
              </div>

              {/* Contrôles caméra */}
              <div className="scan-controls">
                {cameras.length > 1 && (
                  <button onClick={flipCamera} className="scan-control-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path d="M1 4v6h6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {useFront ? 'Caméra avant' : 'Caméra arrière'}
                  </button>
                )}
                {torchSupported && (
                  <button onClick={toggleTorch} className={`scan-control-btn ${torchOn ? 'scan-control-btn--active' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M15.75 18V7.5H8.25V18M15.75 18l.75 3H7.5l.75-3M8.25 7.5V6.108c0-1.135-.845-2.098-1.976-2.192A48.424 48.424 0 0 0 6.25 3.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Flash
                  </button>
                )}
                <button onClick={resetScan} className="scan-control-btn scan-control-btn--cancel">
                  ✕ Réinitialiser
                </button>
              </div>

              <p className="scan-hint">
                {scanning ? "Initialisation de la caméra..." : "Détection automatique en cours..."}
              </p>
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
                      value={carteInfo?.carte?.numero_carte || ""} readOnly />
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

      {/* Styles CSS pour le scanner */}
      <style>{`
        .scanner-container {
          position: relative;
          border-radius: 1.5rem;
          overflow: hidden;
          background: #000;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .scanner-video-wrapper {
          width: 100%;
        }
        .scanner-video-wrapper video {
          width: 100% !important;
          height: auto !important;
          object-fit: cover;
          border-radius: 1.5rem;
        }
        .scanner-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .scanner-corner {
          position: absolute;
          width: 2rem;
          height: 2rem;
          border: 4px solid #f97316;
        }
        .scanner-corner--tl { top: 1.5rem; left: 1.5rem; border-right: 0; border-bottom: 0; border-radius: 0.75rem 0 0 0; }
        .scanner-corner--tr { top: 1.5rem; right: 1.5rem; border-left: 0; border-bottom: 0; border-radius: 0 0.75rem 0 0; }
        .scanner-corner--bl { bottom: 1.5rem; left: 1.5rem; border-right: 0; border-top: 0; border-radius: 0 0 0 0.75rem; }
        .scanner-corner--br { bottom: 1.5rem; right: 1.5rem; border-left: 0; border-top: 0; border-radius: 0 0 0.75rem 0; }
        .scanner-line {
          position: absolute;
          left: 2rem;
          right: 2rem;
          top: 50%;
          transform: translateY(-50%);
          height: 2px;
          background: linear-gradient(90deg, transparent, #f97316, transparent);
          animation: scanLine 2s ease-in-out infinite;
        }
        @keyframes scanLine {
          0% { transform: translateY(-60px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(60px); opacity: 0; }
        }
        .scan-controls {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        .scan-control-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: white;
          border: 2px solid #fdba74;
          border-radius: 0.75rem;
          color: #f97316;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .scan-control-btn:hover {
          background: #fff7ed;
        }
        .scan-control-btn--active {
          background: #f97316;
          border-color: #f97316;
          color: white;
        }
        .scan-control-btn--cancel {
          background: #f3f4f6;
          border-color: #d1d5db;
          color: #6b7280;
        }
        .scan-control-btn--cancel:hover {
          background: #e5e7eb;
        }
        #${SCANNER_ELEMENT_ID} select,
        #${SCANNER_ELEMENT_ID} img[alt="Info icon"],
        #${SCANNER_ELEMENT_ID} > div > div:last-child {
          display: none !important;
        }
      `}</style>
    </div>
  );
}