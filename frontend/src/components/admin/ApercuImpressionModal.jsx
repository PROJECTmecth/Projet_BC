// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/ApercuImpressionModal.jsx
//
// Composant : ApercuImpressionModal
//
// Rôle :
//   Affiche un aperçu d'impression des cartes QR générées.
//   Chaque carte est au format bancaire (CR80 : 85.6mm × 54mm).
//   Les cartes sont disposées en grille sur une feuille A4.
//   Chaque carte contient : QR code vierge unique + numéro de carte.
//
// Props :
//   - isOpen      : boolean — affiche ou cache le modal
//   - onClose     : fonction — ferme le modal
//   - quantite    : number  — nombre de cartes à générer
//   - numeroLot   : string  — ex: "Lot #043"
//
// QR Code :
//   Chaque QR contient un identifiant unique : BC-{numLot}-{numCarte}
//   Ex: BC-043-001, BC-043-002...
//   Ces identifiants seront scannés par l'agent pour enregistrer un client.
//
// Utilisé dans :
//   src/pages/admin/GestionCartesPage.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { X, Printer } from "lucide-react";
import { Button } from "../ui/button";

export default function ApercuImpressionModal({ isOpen, onClose, quantite, numeroLot }) {
  const printRef = useRef();

  // ── Extraire le numéro du lot (ex: "Lot #043" → "043") ───────────────────
  const numLot = numeroLot?.replace(/[^0-9]/g, "") || "000";

  // ── Générer les identifiants uniques des cartes ───────────────────────────
  const cartes = Array.from({ length: quantite }, (_, i) => {
    const numCarte = String(i + 1).padStart(3, "0");
    return {
      id: `BC-${numLot}-${numCarte}`,
      numero: `BC-${numLot}-${numCarte}`,
    };
  });

  // ── Lancer l'impression ───────────────────────────────────────────────────
  function handlePrint() {
    const contenu = printRef.current.innerHTML;
    const fenetre = window.open("", "_blank");
    fenetre.document.write(`
      <html>
        <head>
          <title>Impression ${numeroLot}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: white; }
            .grille {
              display: grid;
              grid-template-columns: repeat(3, 85.6mm);
              gap: 4mm;
              padding: 10mm;
            }
            .carte {
              width: 85.6mm;
              height: 54mm;
              border: 1px solid #ccc;
              border-radius: 4mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 3mm;
              background: white;
              page-break-inside: avoid;
            }
            .carte-numero {
              font-size: 8pt;
              color: #666;
              font-family: monospace;
              letter-spacing: 1px;
            }
            .carte-titre {
              font-size: 7pt;
              color: #FF6600;
              font-weight: bold;
              letter-spacing: 2px;
            }
            @media print {
              body { margin: 0; }
              .grille { padding: 5mm; gap: 3mm; }
            }
          </style>
        </head>
        <body>${contenu}</body>
      </html>
    `);
    fenetre.document.close();
    fenetre.focus();
    setTimeout(() => {
      fenetre.print();
      fenetre.close();
    }, 500);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">

              {/* En-tête modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Aperçu d'impression — {numeroLot}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {quantite} cartes QR au format bancaire (85.6 × 54 mm)
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Zone d'aperçu scrollable */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                <div
                  ref={printRef}
                  className="grille"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  {cartes.map((carte) => (
                    <div
                      key={carte.id}
                      style={{
                        width: "100%",
                        aspectRatio: "85.6 / 54",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        background: "white",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }}
                    >
                      {/* Titre BOMBA CASH */}
                      <span style={{
                        fontSize: "9px",
                        color: "#FF6600",
                        fontWeight: "bold",
                        letterSpacing: "2px",
                      }}>
                        BOMBA CASH
                      </span>

                      {/* QR Code */}
                      <QRCodeSVG
                        value={carte.id}
                        size={80}
                        bgColor="white"
                        fgColor="#1A1A2E"
                        level="M"
                      />

                      {/* Numéro de carte */}
                      <span style={{
                        fontSize: "8px",
                        color: "#6B7280",
                        fontFamily: "monospace",
                        letterSpacing: "1px",
                      }}>
                        {carte.numero}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer modal */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <p className="text-sm text-gray-500">
                  Format : 85.6 × 54 mm — 3 cartes par ligne
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Fermer
                  </Button>
                  <Button
                    onClick={handlePrint}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold"
                  >
                    <Printer size={16} />
                    Imprimer
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