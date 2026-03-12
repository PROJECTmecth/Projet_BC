// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/pages/admin/GestionCartesPage.jsx
//
// Page Gestion des Cartes — Admin BOMBA CASH
//
// Sections :
//   1. Titre de page
//   2. Carte stat "Total Générés" — pleine largeur
//   3. Section génération QR (sélecteur quantité + bouton)
//   4. Modal aperçu impression (ApercuImpressionModal)
//   5. Historique des lots générés
//
// NOTE BACKEND :
//   Décommenter les appels axios quand les endpoints sont prêts :
//   POST /api/cartes/generer { quantite }
//   GET  /api/cartes/lots/{id}/imprimer
//   GET  /api/cartes/lots/{id}/export-csv
//
// Dépendances : framer-motion, lucide-react, qrcode.react
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, QrCode } from "lucide-react";
import { Button } from "../../components/ui/button";
import Toast from "../../components/ui/Toast";
import LotCarteItem from "../../components/admin/LotCarteItem";
import ApercuImpressionModal from "../../components/admin/ApercuImpressionModal";

// ── Données mock initiales ────────────────────────────────────────────────────
const MOCK_LOTS = [
  { id: "1", numero: "Lot #042", quantite: 500, dateGeneration: "05/03/2026", heureGeneration: "14:30", statut: "Actif" },
  { id: "2", numero: "Lot #041", quantite: 300, dateGeneration: "04/03/2026", heureGeneration: "09:15", statut: "Utilisé" },
  { id: "3", numero: "Lot #040", quantite: 400, dateGeneration: "03/03/2026", heureGeneration: "16:45", statut: "Actif" },
  { id: "4", numero: "Lot #039", quantite: 200, dateGeneration: "02/03/2026", heureGeneration: "11:20", statut: "En attente" },
  { id: "5", numero: "Lot #038", quantite: 500, dateGeneration: "01/03/2026", heureGeneration: "08:00", statut: "Utilisé" },
];

const QUANTITIES = [100, 200, 300, 400, 500];

// ─────────────────────────────────────────────────────────────────────────────
export default function GestionCartesPage() {
  const [lots, setLots]                         = useState(MOCK_LOTS);
  const [selectedQuantity, setSelectedQuantity] = useState(100);
  const [isGenerating, setIsGenerating]         = useState(false);
  const [toast, setToast]                       = useState({ msg: "", type: "success" });

  // ── État du modal aperçu impression ──────────────────────────────────────
  const [apercuOpen, setApercuOpen]   = useState(false);
  const [apercuLot, setApercuLot]     = useState(null);

  const totalGeneres   = lots.reduce((sum, l) => sum + l.quantite, 0);
  const objectifAnnuel = 32000;
  const pctObjectif    = Math.min(Math.round((totalGeneres / objectifAnnuel) * 100), 100);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "" }), 3500);
  }

  // ── Générer un nouveau lot + ouvrir aperçu ────────────────────────────────
  async function handleGenerate() {
    setIsGenerating(true);
    // TODO backend : POST /api/cartes/generer { quantite: selectedQuantity }
    await new Promise((r) => setTimeout(r, 1500));

    const nextNum = 43 + lots.length;
    const newLot = {
      id: String(Date.now()),
      numero: `Lot #${String(nextNum).padStart(3, "0")}`,
      quantite: selectedQuantity,
      dateGeneration: new Date().toLocaleDateString("fr-FR"),
      heureGeneration: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      statut: "Actif",
    };

    setLots([newLot, ...lots]);
    setIsGenerating(false);

    // Ouvrir l'aperçu avec le nouveau lot
    setApercuLot(newLot);
    setApercuOpen(true);
  }

  function handlePrint(lot) {
    // TODO backend : GET /api/cartes/lots/{id}/imprimer
    setApercuLot(lot);
    setApercuOpen(true);
  }

  function handleExport(lot) {
    // TODO backend : GET /api/cartes/lots/{id}/export-csv
    showToast(`Export CSV du ${lot.numero} lancé`);
  }

  return (
    <div className="space-y-6 pb-6">

      {/* Toast */}
      <Toast msg={toast.msg} type={toast.type} />

      {/* Modal aperçu impression */}
      <ApercuImpressionModal
        isOpen={apercuOpen}
        onClose={() => setApercuOpen(false)}
        quantite={apercuLot?.quantite || 0}
        numeroLot={apercuLot?.numero || ""}
      />

      {/* ── 1. TITRE ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Cartes</h1>
        <p className="text-gray-500 mt-1 text-sm">Génération et suivi des codes QR prépayés</p>
      </div>

      {/* ── 2. CARTE STAT TOTAL GÉNÉRÉS — pleine largeur ─────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[20px] p-6 shadow-xl w-full"
        style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Total Générés</p>
            <h2 className="text-5xl font-bold text-white font-mono">
              {totalGeneres.toLocaleString("fr-FR")}
            </h2>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
        {/* Barre de progression */}
        <div className="mt-4">
          <div className="h-2 bg-blue-800/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pctObjectif}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="text-blue-100 text-xs mt-2">{pctObjectif}% de l'objectif annuel</p>
        </div>
      </motion.div>

      {/* ── 3. SECTION GÉNÉRATION QR ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-[24px] shadow-xl p-8"
      >
        <div className="max-w-3xl mx-auto">

          {/* Titre section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <QrCode className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Génération de nouveaux codes QR
            </h2>
            <p className="text-gray-500 text-sm">
              Sélectionnez la quantité et lancez la production
            </p>
          </div>

          {/* Sélecteur quantité */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-600 mb-4 text-center">
              Choisir la quantité
            </label>
            <div className="flex justify-center gap-3 flex-wrap">
              {QUANTITIES.map((qty) => (
                <motion.button
                  key={qty}
                  onClick={() => setSelectedQuantity(qty)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${
                    selectedQuantity === qty
                      ? "bg-orange-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {qty}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Bouton générer */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-6 text-lg font-bold rounded-[20px] shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed h-auto"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <QrCode className="h-6 w-6 mr-2" />
                  Lancer la production
                </>
              )}
            </Button>
          </div>

          {/* Barre génération en cours */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 bg-blue-50 border border-blue-200 rounded-[16px] p-4"
            >
              <p className="text-blue-700 text-sm text-center font-medium">
                ⚡ Génération de {selectedQuantity} codes QR en cours...
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── 4. HISTORIQUE DES LOTS ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-[20px] shadow-xl overflow-hidden"
      >
        {/* En-tête */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Historique des lots générés</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Cliquez sur un lot pour imprimer ou exporter
          </p>
        </div>

        {/* Liste des lots */}
        <div>
          {lots.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">Aucun lot généré pour le moment</p>
            </div>
          ) : (
            lots.map((lot, index) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                <LotCarteItem
                  lot={lot}
                  onPrint={handlePrint}
                  onExport={handleExport}
                />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

    </div>
  );
}