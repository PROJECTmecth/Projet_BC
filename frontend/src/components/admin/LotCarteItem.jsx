// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/LotCarteItem.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

const statutStyles = {
  "Vierge":     "bg-blue-100 text-blue-700",
  "Actif":      "bg-green-100 text-green-700",
  "Utilisé":    "bg-gray-100 text-gray-600",
  "En attente": "bg-yellow-100 text-yellow-700",
  "Expiré":     "bg-red-100 text-red-600",
  "Terminé":    "bg-purple-100 text-purple-600",
};

export default function LotCarteItem({ lot, onDelete, isSelected, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const statut = statutStyles[lot.statut] || statutStyles["En attente"];

  return (
    <div className={`border-b border-gray-100 last:border-b-0 transition-colors ${isSelected ? "bg-red-50" : ""}`}>

      <div
        className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">

            {/* Case à cocher */}
            <div
              onClick={e => { e.stopPropagation(); onSelect(lot.id); }}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer shrink-0 transition-all ${
                isSelected ? "bg-red-500 border-red-500" : "border-gray-300 hover:border-red-400"
              }`}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            {/* Icône + infos */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shrink-0">
                <QrCode size={22} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-base">{lot.numero}</h4>
                <p className="text-sm text-gray-400">{lot.dateGeneration}</p>
              </div>
            </div>

            {/* Quantité + badge */}
            <div className="hidden md:flex items-center gap-8">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Quantité</p>
                <p className="text-lg font-bold text-gray-800 font-mono">{lot.quantite}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statut}`}>
                {lot.statut}
              </span>
            </div>
          </div>

          <motion.span
            className="text-gray-400 text-xs"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: "inline-block" }}
          >
            ▼
          </motion.span>
        </div>
      </div>

      {/* ── Panneau : Supprimer uniquement ───────────────────────────────── */}
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
            <div className="px-6 pb-4 pt-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button
                onClick={e => { e.stopPropagation(); onDelete([lot.id]); }}
                variant="outline"
                className="border-2 border-red-400 text-red-500 hover:bg-red-50 rounded-xl font-semibold px-6"
              >
                <Trash2 size={16} className="mr-1" />
                Supprimer ce lot
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}