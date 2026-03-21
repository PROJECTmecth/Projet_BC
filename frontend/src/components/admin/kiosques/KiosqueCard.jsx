// src/components/admin/kiosques/KiosqueCard.jsx

import { useState }        from "react";
import { useNavigate }     from "react-router-dom";
import { MapPin, Phone, Tag, Store } from "lucide-react";
import ToggleSwitch        from "./ToggleSwitch";

// ── Modal de confirmation ─────────────────────────────────────────────────────
function ConfirmModal({ kiosque, action, onConfirm, onCancel }) {
  const isGeler = action === "inactif";
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-3xl w-full max-w-[380px] p-8 flex flex-col items-center gap-4 shadow-2xl">

        <div className={["w-16 h-16 rounded-full flex items-center justify-center", isGeler ? "bg-red-100" : "bg-green-100"].join(" ")}>
          <Store size={30} className={isGeler ? "text-red-500" : "text-green-500"} />
        </div>

        <h2 className="text-[20px] font-black text-gray-900 text-center">
          {isGeler ? "Geler ce kiosque ?" : "Activer ce kiosque ?"}
        </h2>

        <p className="text-[14px] text-gray-500 text-center leading-relaxed">
          {isGeler ? (
            <>Êtes-vous sûr de vouloir geler <strong className="text-gray-800">{kiosque.nom_kiosque}</strong> ? Ce point de vente ne pourra plus effectuer de transactions.</>
          ) : (
            <>Êtes-vous sûr de vouloir activer <strong className="text-gray-800">{kiosque.nom_kiosque}</strong> ? Ce point de vente pourra à nouveau effectuer des transactions.</>
          )}
        </p>

        <div className="flex gap-3 w-full mt-2">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-[14px] hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} className={["flex-1 py-3 rounded-2xl text-white font-bold text-[14px] transition-colors", isGeler ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"].join(" ")}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── KiosqueCard ───────────────────────────────────────────────────────────────
export default function KiosqueCard({ kiosque, onToggle, onEdit }) {
  const navigate                = useNavigate();
  const [toggling, setToggling] = useState(false);
  const [confirm,  setConfirm]  = useState(null);

  const isActif = kiosque.est_actif ?? kiosque.statut_service === "actif";

  const handleToggle = (val) => setConfirm(val ? "actif" : "inactif");

  const handleConfirm = async () => {
    const action = confirm;
    setConfirm(null);
    setToggling(true);
    await onToggle(kiosque.id, action);
    setToggling(false);
  };

  return (
    <>
      <div className={[
        "bg-white rounded-2xl p-6 flex flex-col gap-4",
        "shadow-sm hover:shadow-md transition-shadow duration-200",
        isActif ? "border-2 border-green-400" : "border-2 border-gray-200",
      ].join(" ")}>

        {/* Icône + toggle */}
        <div className="flex items-start justify-between">
          <div className={["w-[52px] h-[52px] rounded-xl flex items-center justify-center", isActif ? "bg-orange-100 text-[#FF6600]" : "bg-gray-100 text-gray-400"].join(" ")}>
            <Store size={24} />
          </div>
          <ToggleSwitch checked={isActif} onChange={handleToggle} loading={toggling} />
        </div>

        {/* nom_kiosque + badge */}
        <div>
          <h3 className={["font-extrabold text-[17px] mb-[6px]", isActif ? "text-gray-900" : "text-gray-400"].join(" ")}>
            {kiosque.nom_kiosque}
          </h3>
          <span className={["inline-block px-3 py-[3px] rounded-full text-[11px] font-bold uppercase tracking-wide", isActif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"].join(" ")}>
            {isActif ? "EN LIGNE" : "HORS LIGNE"}
          </span>
        </div>

        {/* Infos */}
        <div className="border-t border-gray-100 pt-3 flex flex-col gap-[7px]">
          <InfoRow icon={<MapPin size={14} />} text={kiosque.adresse} />
          <InfoRow icon={<Phone size={14} />}  text={kiosque.telephone} />
          <InfoRow icon={<Tag size={14} />}    text={kiosque.code_kiosque} mono />
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate(`/admin/kiosques/${kiosque.id}`)}
          className={["text-left text-[13px] font-semibold transition-colors", isActif ? "text-[#FF6600] hover:text-orange-700" : "text-gray-400"].join(" ")}
        >
          Cliquez pour voir les détails →
        </button>
      </div>

      {confirm && (
        <ConfirmModal
          kiosque={kiosque}
          action={confirm}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}

function InfoRow({ icon, text, mono }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className={["text-[13px] text-gray-500", mono ? "font-mono" : ""].join(" ")}>
        {text}
      </span>
    </div>
  );
}