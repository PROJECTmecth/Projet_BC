// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/ApercuImpressionModal.jsx
// Format : A4 Paysage — 25 QR par page (5 colonnes × 5 lignes)
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { X, Printer, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

const QR_PAR_PAGE = 25;

// ── Génère un QR code en base64 PNG ──────────────────────────────────────────
async function genererQRBase64(valeur, taille = 90) {
  return await QRCode.toDataURL(valeur, {
    width: taille,
    margin: 1,
    color: { dark: "#1A1A2E", light: "#ffffff" },
  });
}

export default function ApercuImpressionModal({
  isOpen,
  onClose,
  cartes = [],
  numeroLot = "",
  onImprime,
}) {
  const pageRef                 = useRef();
  const [pageCourante, setPage] = useState(1);
  const [exportEnCours, setExp] = useState(false);
  const [impEnCours, setImpEnCours] = useState(false);

  const totalPages   = Math.ceil(cartes.length / QR_PAR_PAGE) || 1;
  const debut        = (pageCourante - 1) * QR_PAR_PAGE;
  const cartesDuPage = cartes.slice(debut, debut + QR_PAR_PAGE);

  useMemo(() => { if (isOpen) setPage(1); }, [isOpen]);

  // ── Impression A4 paysage — QR en base64 ─────────────────────────────────
  async function handlePrint() {
    setImpEnCours(true);
    try {
      const fenetre  = window.open("", "_blank");
      const totalPgs = Math.ceil(cartes.length / QR_PAR_PAGE);
      let pagesHTML  = "";

      for (let pg = 0; pg < totalPgs; pg++) {
        const slice = cartes.slice(pg * QR_PAR_PAGE, (pg + 1) * QR_PAR_PAGE);

        // Générer tous les QR en base64 pour cette page
        const qrDataList = await Promise.all(
          slice.map(carte => genererQRBase64(carte.qr_code_uid, 100))
        );

        const cartesHTML = slice.map((carte, i) => `
          <div class="carte">
            <span class="titre">BOMBA CASH</span>
            <img src="${qrDataList[i]}" width="90" height="90" alt="QR" />
          </div>
        `).join("");

        pagesHTML += `
          <div class="page">
            <div class="grille">${cartesHTML}</div>
            ${totalPgs > 1 ? `<p class="page-num">${numeroLot} — Page ${pg + 1} / ${totalPgs}</p>` : ""}
          </div>
        `;
      }

      fenetre.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${numeroLot} — Codes QR</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; background: white; }
              .page {
                width: 297mm;
                min-height: 210mm;
                padding: 8mm;
                page-break-after: always;
                display: flex;
                flex-direction: column;
              }
              .grille {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                grid-template-rows: repeat(5, 1fr);
                gap: 4mm;
                flex: 1;
              }
              .carte {
                border: 1px solid #D1D5DB;
                border-radius: 4mm;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 2mm;
                background: white;
                aspect-ratio: 85.6 / 54;
                page-break-inside: avoid;
              }
              .titre {
                font-size: 7pt;
                color: #F97316;
                font-weight: bold;
                letter-spacing: 1.5px;
              }
              .page-num {
                text-align: center;
                font-size: 7pt;
                color: #9CA3AF;
                margin-top: 3mm;
              }
              @page { size: A4 landscape; margin: 0; }
              @media print { body { margin: 0; } .page { page-break-after: always; } }
            </style>
          </head>
          <body>${pagesHTML}</body>
        </html>
      `);
      fenetre.document.close();
      fenetre.focus();
      setTimeout(() => {
        fenetre.print();
        fenetre.close();
        if (onImprime) onImprime();
      }, 500);

    } catch (err) {
      console.error("Erreur impression:", err);
    } finally {
      setImpEnCours(false);
    }
  }

  // ── Export PDF A4 paysage — QR en base64 ─────────────────────────────────
  async function handleExportPDF() {
    setExp(true);
    try {
      const pdf      = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const totalPgs = Math.ceil(cartes.length / QR_PAR_PAGE);

      for (let pg = 1; pg <= totalPgs; pg++) {
        const container = document.createElement("div");
        container.style.cssText = `
          position: fixed; top: -9999px; left: -9999px;
          width: 1122px; height: 794px;
          background: white; padding: 30px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(5, 1fr);
          gap: 14px;
        `;

        const slice = cartes.slice((pg - 1) * QR_PAR_PAGE, pg * QR_PAR_PAGE);

        // Générer tous les QR en base64
        const qrDataList = await Promise.all(
          slice.map(carte => genererQRBase64(carte.qr_code_uid, 80))
        );

        slice.forEach((carte, i) => {
          const div = document.createElement("div");
          div.style.cssText = `
            border: 1px solid #E5E7EB; border-radius: 8px;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            gap: 4px; padding: 8px; background: white;
            aspect-ratio: 85.6/54;
          `;
          div.innerHTML = `
            <span style="font-size:7px;color:#F97316;font-weight:bold;letter-spacing:2px;">BOMBA CASH</span>
            <img src="${qrDataList[i]}" width="75" height="75" alt="QR" />
          `;
          container.appendChild(div);
        });

        document.body.appendChild(container);
        await new Promise(r => setTimeout(r, 200));

        const canvas  = await html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");

        if (pg > 1) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, 297, 210);

        document.body.removeChild(container);
      }

      pdf.save(`${numeroLot.replace(/\s/g, "_")}_QR_codes.pdf`);
      if (onImprime) onImprime();

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
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col">

              {/* En-tête */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Aperçu — {numeroLot}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {cartes.length} codes QR · 25 par page · A4 Paysage
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Zone aperçu */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                <div className="text-center mb-3">
                  <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                    📄 Page {pageCourante} / {totalPages} — A4 Paysage (297 × 210 mm)
                  </span>
                </div>

                {/* Aperçu A4 paysage */}
                <div
                  ref={pageRef}
                  style={{
                    background: "white",
                    width: "297mm",
                    minHeight: "210mm",
                    margin: "0 auto",
                    padding: "8mm",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                    borderRadius: "4px",
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gridTemplateRows: "repeat(5, 1fr)",
                    gap: "4mm",
                  }}
                >
                  {cartesDuPage.map((carte) => (
                    <div
                      key={carte.qr_code_uid}
                      style={{
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        background: "white",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "3px",
                        padding: "6px",
                        aspectRatio: "85.6 / 54",
                      }}
                    >
                      <span style={{ fontSize: "7px", color: "#F97316", fontWeight: "bold", letterSpacing: "1.5px" }}>
                        BOMBA CASH
                      </span>
                      <QRCodeSVG
                        value={carte.qr_code_uid}
                        size={58}
                        bgColor="white"
                        fgColor="#1A1A2E"
                        level="M"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
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

                {/* Boutons */}
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
                    disabled={exportEnCours || impEnCours}
                    variant="outline"
                    className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold"
                  >
                    {exportEnCours ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
                        Export en cours...
                      </>
                    ) : (
                      <>
                        <Download size={16} className="mr-1" />
                        Exporter PDF
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handlePrint}
                    disabled={impEnCours || exportEnCours}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold disabled:opacity-50"
                  >
                    {impEnCours ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                        Préparation...
                      </>
                    ) : (
                      <>
                        <Printer size={16} className="mr-1" />
                        Imprimer
                      </>
                    )}
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