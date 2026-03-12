// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/ApercuImpressionModal.jsx
//
// Composant : ApercuImpressionModal
//
// Rôle :
//   Affiche un aperçu d'impression des codes QR générés.
//   - 25 QR par page avec pagination
//   - Format carte bancaire (85.6 × 54 mm)
//   - Bouton Imprimer → window.print()
//   - Bouton Exporter PDF → jsPDF
//
// Props :
//   - isOpen     : boolean  — affiche ou cache le modal
//   - onClose    : fonction — ferme le modal
//   - cartes     : array    — liste des cartes reçues du backend
//                            [{ id_carte, numero_carte, qr_code_uid, statut, date_creation }]
//   - numeroLot  : string   — ex: "Lot #043"
//
// NOTE BACKEND :
//   Les cartes sont reçues depuis POST /api/admin/qrcodes/generer
//   En mode mock, elles sont générées localement avec crypto.randomUUID()
//
// Dépendances : framer-motion, qrcode.react, jspdf, html2canvas
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { X, Printer, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ── Nombre de QR par page ─────────────────────────────────────────────────────
const QR_PAR_PAGE = 25;

export default function ApercuImpressionModal({
  isOpen,
  onClose,
  cartes = [],
  numeroLot = "",
}) {
  const pageRef                  = useRef();
  const [pageCourante, setPage]  = useState(1);
  const [exportEnCours, setExp]  = useState(false);

  // ── Calcul pagination ─────────────────────────────────────────────────────
  const totalPages   = Math.ceil(cartes.length / QR_PAR_PAGE) || 1;
  const debut        = (pageCourante - 1) * QR_PAR_PAGE;
  const cartesDuPage = cartes.slice(debut, debut + QR_PAR_PAGE);

  // ── Réinitialiser la page quand on ouvre le modal ─────────────────────────
  useMemo(() => { if (isOpen) setPage(1); }, [isOpen]);

  // ── Imprimer la page courante ─────────────────────────────────────────────
  function handlePrint() {
    const contenu = pageRef.current.innerHTML;
    const fenetre = window.open("", "_blank");
    fenetre.document.write(`
      <html>
        <head>
          <title>Impression ${numeroLot} — Page ${pageCourante}/${totalPages}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: white; }
            .grille {
              display: grid;
              grid-template-columns: repeat(5, 85.6mm);
              gap: 4mm;
              padding: 8mm;
            }
            .carte {
              width: 85.6mm;
              height: 54mm;
              border: 1px solid #E5E7EB;
              border-radius: 4mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 3mm;
              background: white;
              page-break-inside: avoid;
            }
            .carte-titre {
              font-size: 8pt;
              color: #FF6600;
              font-weight: bold;
              letter-spacing: 2px;
            }
            .carte-numero {
              font-size: 7pt;
              color: #6B7280;
              font-family: monospace;
              letter-spacing: 1px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>${contenu}</body>
      </html>
    `);
    fenetre.document.close();
    fenetre.focus();
    setTimeout(() => { fenetre.print(); fenetre.close(); }, 500);
  }

  // ── Exporter toutes les pages en PDF ─────────────────────────────────────
  async function handleExportPDF() {
    setExp(true);
    try {
      const pdf        = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const totalPgs   = Math.ceil(cartes.length / QR_PAR_PAGE);

      for (let pg = 1; pg <= totalPgs; pg++) {
        // Créer un conteneur temporaire hors écran
        const container = document.createElement("div");
        container.style.cssText = `
          position: fixed; top: -9999px; left: -9999px;
          width: 297mm; background: white; padding: 8mm;
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 4mm;
        `;

        const slice = cartes.slice((pg - 1) * QR_PAR_PAGE, pg * QR_PAR_PAGE);

        // Créer les cartes HTML
        slice.forEach((carte) => {
          const div = document.createElement("div");
          div.style.cssText = `
            border: 1px solid #E5E7EB; border-radius: 6px;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            gap: 4px; padding: 6px; background: white;
            aspect-ratio: 85.6/54;
          `;
          div.innerHTML = `
            <span style="font-size:8px;color:#FF6600;font-weight:bold;letter-spacing:2px;">BOMBA CASH</span>
            <div id="qr-${carte.qr_code_uid}" style="width:60px;height:60px;"></div>
            <span style="font-size:7px;color:#6B7280;font-family:monospace;">${carte.numero_carte}</span>
          `;
          container.appendChild(div);
        });

        document.body.appendChild(container);

        // Générer les QR codes dans les divs
        const { default: QRCode } = await import("qrcode");
        for (const carte of slice) {
          const qrDiv = container.querySelector(`#qr-${carte.qr_code_uid}`);
          if (qrDiv) {
            const canvas = await QRCode.toCanvas(carte.qr_code_uid, { width: 60, margin: 1 });
            qrDiv.appendChild(canvas);
          }
        }

        await new Promise(r => setTimeout(r, 300));

        const canvas  = await html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");

        if (pg > 1) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, 297, 210);

        document.body.removeChild(container);
      }

      pdf.save(`${numeroLot.replace(/\s/g, "_")}_QR_codes.pdf`);
    } catch (err) {
      console.error("Erreur export PDF:", err);
    } finally {
      setExp(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Overlay ──────────────────────────────────────────────────── */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* ── Modal ────────────────────────────────────────────────────── */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col">

              {/* ── En-tête ───────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Aperçu d'impression — {numeroLot}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {cartes.length} codes QR · 25 par page · Format carte bancaire
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>

              {/* ── Zone d'aperçu scrollable ──────────────────────────────── */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                <div
                  ref={pageRef}
                  className="grille bg-white rounded-xl p-4 shadow"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "12px",
                  }}
                >
                  {cartesDuPage.map((carte) => (
                    <div
                      key={carte.qr_code_uid}
                      style={{
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        background: "white",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "8px",
                        aspectRatio: "85.6 / 54",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* Titre */}
                      <span style={{
                        fontSize: "8px",
                        color: "#FF6600",
                        fontWeight: "bold",
                        letterSpacing: "2px",
                      }}>
                        BOMBA CASH
                      </span>

                      {/* QR Code — valeur = qr_code_uid (UUID v4) */}
                      <QRCodeSVG
                        value={carte.qr_code_uid}
                        size={65}
                        bgColor="white"
                        fgColor="#1A1A2E"
                        level="M"
                      />

                      {/* Numéro lisible */}
                      <span style={{
                        fontSize: "7px",
                        color: "#6B7280",
                        fontFamily: "monospace",
                        letterSpacing: "1px",
                      }}>
                        {carte.numero_carte}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Footer ───────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl shrink-0">

                {/* Pagination */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pageCourante === 1}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-40 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-sm font-semibold text-gray-700">
                    Page {pageCourante} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={pageCourante === totalPages}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-40 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <span className="text-xs text-gray-400 ml-2">
                    {debut + 1}–{Math.min(debut + QR_PAR_PAGE, cartes.length)} sur {cartes.length} QR
                  </span>
                </div>

                {/* Boutons actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Fermer
                  </Button>

                  <Button
                    onClick={handleExportPDF}
                    disabled={exportEnCours}
                    variant="outline"
                    className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold"
                  >
                    {exportEnCours ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        Export en cours...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Exporter PDF
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handlePrint}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold"
                  >
                    <Printer size={16} />
                    Imprimer cette page
                  </Button>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}