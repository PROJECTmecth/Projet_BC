// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/pages/admin/GestionCartesPage.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, QrCode, Trash2, AlertTriangle, Clock, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import Toast from "../../components/ui/Toast";
import LotCarteItem from "../../components/admin/LotCarteItem";
import ApercuImpressionModal from "../../components/admin/ApercuImpressionModal";
import axios from "../../lib/axios";

const MOCK_MODE = false;
const QUANTITIES = [100, 200, 300, 400, 500];

function genererCartesMock(quantite, startIndex = 1) {
  return Array.from({ length: quantite }, (_, i) => {
    const id = startIndex + i;
    return {
      id_carte:      id,
      numero_carte:  `BC-${String(id).padStart(5, "0")}`,
      qr_code_uid:   crypto.randomUUID(),
      statut:        "vierge",
      date_creation: new Date().toLocaleDateString("fr-FR"),
    };
  });
}

// ── Modal confirmation suppression ───────────────────────────────────────────
function ConfirmDeleteModal({ isOpen, onConfirm, onCancel, count }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white rounded-[24px] shadow-2xl p-8 max-w-md w-full mx-4 z-10"
      >
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Confirmer la suppression</h2>
        <p className="text-gray-500 text-center text-sm mb-3">
          Vous êtes sur le point de supprimer{" "}
          <span className="font-bold text-red-500">{count} lot{count > 1 ? "s" : ""}</span>{" "}
          de l'historique.
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-6">
          <p className="text-orange-700 text-xs text-center font-medium">
            ⚠️ Cette action est irréversible. Les lots supprimés ne pourront plus être récupérés.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold">
            Annuler
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold">
            <Trash2 size={16} className="mr-1" /> Supprimer
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function GestionCartesPage() {
  const [lotsHistorique, setLotsHistorique] = useState([]);
  const [lotsEnAttente, setLotsEnAttente]   = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState(100);
  const [isGenerating, setIsGenerating]         = useState(false);
  const [isLoading, setIsLoading]               = useState(!MOCK_MODE);
  const [toast, setToast]                       = useState({ msg: "", type: "success" });
  const [selectedIds, setSelectedIds]           = useState([]);
  const [confirmDelete, setConfirmDelete]       = useState({ open: false, ids: [] });
  const [apercuOpen, setApercuOpen]             = useState(false);
  const [apercuLot, setApercuLot]               = useState(null);

  const tousLots         = lotsHistorique;
  const totalGeneres     = [...lotsHistorique, ...lotsEnAttente].reduce((sum, l) => sum + l.quantite, 0);
  const tousSelectionnes = tousLots.length > 0 && selectedIds.length === tousLots.length;

  // ── Charger historique BDD ────────────────────────────────────────────────
  useEffect(() => {
    if (MOCK_MODE) return;
    async function chargerLots() {
      try {
        const response = await axios.get("/api/admin/qrcodes/lots");
        if (response.data.success) {
          setLotsHistorique(response.data.data.map(lot => ({ ...lot, cartes: [], imprime: true })));
        }
      } catch (err) {
        console.error("Erreur chargement lots :", err);
        showToast("Erreur lors du chargement de l'historique.", "error");
      } finally {
        setIsLoading(false);
      }
    }
    chargerLots();
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "" }), 3500);
  }

  function handleSelect(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  function handleSelectAll() {
    setSelectedIds(tousSelectionnes ? [] : tousLots.map(l => l.id));
  }

  function handleDeleteRequest(ids) {
    setConfirmDelete({ open: true, ids });
  }

  function handleConfirmDelete() {
    const ids = confirmDelete.ids;
    setLotsHistorique(prev => prev.filter(l => !ids.includes(l.id)));
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    setConfirmDelete({ open: false, ids: [] });
    showToast(`${ids.length} lot${ids.length > 1 ? "s" : ""} supprimé${ids.length > 1 ? "s" : ""} avec succès.`);
  }

  function handleAnnulerAttente(lotId) {
    const lot = lotsEnAttente.find(l => l.id === lotId);
    setLotsEnAttente(prev => prev.filter(l => l.id !== lotId));
    showToast(`${lot?.numero} annulé.`, "error");
  }

  function handleLotExporte(lotId) {
    const lot = lotsEnAttente.find(l => l.id === lotId);
    if (!lot) return;
    setLotsEnAttente(prev => prev.filter(l => l.id !== lotId));
    setLotsHistorique(prev => [{ ...lot, imprime: true }, ...prev]);
    showToast(`${lot.numero} ajouté à l'historique.`);
  }

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      let cartes = [];
      let newLot;

      if (MOCK_MODE) {
        await new Promise(r => setTimeout(r, 1500));
        cartes = genererCartesMock(selectedQuantity, totalGeneres + 1);
        const nextNum = lotsHistorique.length + lotsEnAttente.length + 1;
        newLot = {
          id:             String(Date.now()),
          numero:         `Lot #${String(nextNum).padStart(3, "0")}`,
          quantite:       selectedQuantity,
          dateGeneration: new Date().toLocaleDateString("fr-FR"),
          statut:         "Vierge",
          cartes,
          imprime:        false,
        };
      } else {
        const response = await axios.post("/api/admin/qrcodes/generer", { quantite: selectedQuantity });
        if (!response.data.success) throw new Error(response.data.message);
        cartes = response.data.data.cartes;
        const nextNum = lotsHistorique.length + lotsEnAttente.length + 1;
        newLot = {
          id:             String(Date.now()),
          numero:         `Lot #${String(nextNum).padStart(3, "0")}`,
          quantite:       cartes.length,
          dateGeneration: new Date().toLocaleDateString("fr-FR"),
          statut:         "Vierge",
          cartes,
          imprime:        false,
        };
      }

      setLotsEnAttente(prev => [newLot, ...prev]);
      setApercuLot(newLot);
      setApercuOpen(true);
      showToast(`${selectedQuantity} codes QR générés — Exportez en PDF pour confirmer.`);

    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la génération.", "error");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleExport(lot) {
    if (!lot.cartes || lot.cartes.length === 0) {
      setApercuLot({ ...lot, cartes: genererCartesMock(lot.quantite) });
    } else {
      setApercuLot(lot);
    }
    setApercuOpen(true);
  }

  return (
    <div className="space-y-6 pb-6">

      <Toast msg={toast.msg} type={toast.type} />

      <AnimatePresence>
        <ConfirmDeleteModal
          isOpen={confirmDelete.open}
          count={confirmDelete.ids.length}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete({ open: false, ids: [] })}
        />
      </AnimatePresence>

      {apercuLot && (
        <ApercuImpressionModal
          isOpen={apercuOpen}
          onClose={() => setApercuOpen(false)}
          cartes={apercuLot.cartes || []}
          numeroLot={apercuLot.numero}
          onImprime={() => {
            if (!apercuLot.imprime) handleLotExporte(apercuLot.id);
          }}
        />
      )}

      {/* Titre */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Cartes</h1>
        <p className="text-gray-500 mt-1 text-sm">Génération et suivi des codes QR prépayés</p>
      </div>

      {/* ── Carte bleue — Total uniquement ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[20px] p-8 shadow-xl w-full"
        style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-2">Total Codes QR Générés</p>
            <h2 className="text-6xl font-bold text-white font-mono">
              {totalGeneres.toLocaleString("fr-FR")}
            </h2>
          </div>
          <div className="bg-white/20 p-4 rounded-full">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
        </div>
      </motion.div>

      {/* ── Section génération ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-[24px] shadow-xl p-8"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <QrCode className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Génération de nouveaux codes QR</h2>
            <p className="text-gray-500 text-sm">Sélectionnez la quantité et lancez la production</p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-600 mb-4 text-center">Choisir la quantité</label>
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
        </div>
      </motion.div>

      {/* ── Lots en attente d'export ──────────────────────────────────────── */}
      <AnimatePresence>
        {lotsEnAttente.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-orange-50 border-2 border-orange-200 rounded-[20px] p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-orange-700">En attente d'export</h3>
                <p className="text-xs text-orange-500">Exportez en PDF pour ajouter à l'historique</p>
              </div>
            </div>
            <div className="space-y-2">
              {lotsEnAttente.map(lot => (
                <div key={lot.id} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <QrCode size={18} className="text-orange-400" />
                    <span className="font-semibold text-gray-700">{lot.numero}</span>
                    <span className="text-sm text-gray-400">{lot.quantite} QR · {lot.dateGeneration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setApercuLot(lot); setApercuOpen(true); }}
                      className="text-sm font-semibold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-lg transition-all"
                    >
                      Ouvrir l'aperçu →
                    </button>
                    <button
                      onClick={() => handleAnnulerAttente(lot.id)}
                      className="flex items-center gap-1 text-sm font-semibold text-red-400 hover:text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-all"
                    >
                      <X size={14} />
                      Annuler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Historique des lots ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-[20px] shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Historique des lots générés</h3>
              <p className="text-sm text-gray-500 mt-0.5">Lots exportés en PDF</p>
            </div>
            {tousLots.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="text-sm font-semibold px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  {tousSelectionnes ? "Tout désélectionner" : "Tout sélectionner"}
                </button>
                <AnimatePresence>
                  {selectedIds.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => handleDeleteRequest(selectedIds)}
                      className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all shadow-md"
                    >
                      <Trash2 size={14} />
                      Supprimer ({selectedIds.length})
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Chargement de l'historique...</p>
            </div>
          ) : tousLots.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">Aucun lot exporté pour le moment</p>
              <p className="text-gray-300 text-xs mt-1">Générez un lot puis exportez en PDF</p>
            </div>
          ) : (
            <AnimatePresence>
              {tousLots.map((lot, index) => (
                <motion.div
                  key={lot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  layout
                >
                  <LotCarteItem
                    lot={lot}
                    onExport={handleExport}
                    onDelete={handleDeleteRequest}
                    isSelected={selectedIds.includes(lot.id)}
                    onSelect={handleSelect}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

    </div>
  );
}