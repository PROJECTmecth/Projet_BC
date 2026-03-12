// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/LotCarteItem.jsx
//
// Composant : LotCarteItem
//
// Rôle :
//   Affiche une ligne dans l'historique des lots de cartes QR générés.
//   Chaque lot contient : numéro, date, quantité, statut.
//   Au clic, un panneau s'ouvre avec 2 actions : Imprimer et Exporter CSV.
//
// Props :
//   - lot       : { id, numero, quantite, dateGeneration, heureGeneration, statut }
//   - onPrint   : fonction appelée au clic sur "Imprimer"
//   - onExport  : fonction appelée au clic sur "Exporter CSV"
//
// Utilisé dans :
//   src/pages/admin/GestionCartesPage.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, Download, QrCode } from "lucide-react";
import { Button } from "../ui/button";

// ── Styles des badges de statut ───────────────────────────────────────────────
const statutStyles = {
  "Actif":      "bg-green-100 text-green-700",
  "Utilisé":    "bg-gray-100 text-gray-600",
  "En attente": "bg-yellow-100 text-yellow-700",
};

export default function LotCarteItem({ lot, onPrint, onExport }) {
  const [expanded, setExpanded] = useState(false);
  const statut = statutStyles[lot.statut] || statutStyles["En attente"];

  return (
    <div className="border-b border-gray-100 last:border-b-0">

      {/* ── Ligne principale cliquable ────────────────────────────────────── */}
      <motion.div
        className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
        layout
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">

            {/* Icône QR + numéro lot + date */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shrink-0">
                <QrCode size={22} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-base">{lot.numero}</h4>
                <p className="text-sm text-gray-400">
                  {lot.dateGeneration} à {lot.heureGeneration}
                </p>
              </div>
            </div>

            {/* Quantité + badge statut (masqué sur mobile) */}
            <div className="hidden md:flex items-center gap-8">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">
                  Quantité
                </p>
                <p className="text-lg font-bold text-gray-800 font-mono">{lot.quantite}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statut}`}>
                {lot.statut}
              </span>
            </div>
          </div>

          {/* Flèche animée indiquant l'état ouvert/fermé */}
          <motion.span
            className="text-gray-400 text-xs"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: "inline-block" }}
          >
            ▼
          </motion.span>
        </div>
      </motion.div>

      {/* ── Panneau d'actions (visible au clic) ──────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="actions"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 pt-4 bg-gray-50 border-t border-gray-100 flex gap-3">

              {/* Bouton Imprimer */}
              <Button
                onClick={() => onPrint(lot)}
                variant="outline"
                className="flex-1 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold"
              >
                <Printer size={16} />
                Imprimer
              </Button>

              {/* Bouton Exporter CSV */}
              <Button
                onClick={() => onExport(lot)}
                variant="outline"
                className="flex-1 border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl font-semibold"
              >
                <Download size={16} />
                Exporter CSV
              </Button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}