// src/components/admin/kiosques/KiosqueModal.jsx

import { useState, useEffect } from "react";
import { User, Tag, MapPin, Phone, Lock, Store, X } from "lucide-react";

export default function KiosqueModal({ open, kiosque, onClose, onSave }) {
  const VIDE = {
    code_kiosque: "", nom_kiosque: "", adresse: "",
    ville: "", statut_service: "actif",
  };
  const [form,   setForm]   = useState(VIDE);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(kiosque ? {
      code_kiosque:   kiosque.code_kiosque,
      nom_kiosque:    kiosque.nom_kiosque,
      adresse:        kiosque.adresse,
      ville:          kiosque.ville,
      statut_service: kiosque.statut_service,
    } : VIDE);
    setErrors({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.code_kiosque.trim()) e.code_kiosque = "Requis";
    if (!form.nom_kiosque.trim())  e.nom_kiosque  = "Requis";
    if (!form.adresse.trim())      e.adresse      = "Requis";
    if (!form.ville.trim())        e.ville        = "Requis";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({ ...form, id: kiosque?.id });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-[460px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="bg-[#FF6600] px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
              <Store size={22} />
            </div>
            <div>
              <h2 className="text-white font-black text-[17px] leading-none">
                {kiosque ? "Modifier le kiosque" : "Ajouter un kiosque"}
              </h2>
              <p className="text-white/70 text-[12px] mt-[2px]">
                {kiosque ? "Mettre à jour les informations" : "Créer un nouveau point de vente"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Corps ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">

          <FormField icon={<User size={18} />}  label="Nom du kiosque"  error={errors.nom_kiosque}>
            <input value={form.nom_kiosque}  onChange={e => set("nom_kiosque", e.target.value)}  placeholder="Ex: KMC 01 MGL"                    className={inputCls(errors.nom_kiosque)} />
          </FormField>

          <FormField icon={<Tag size={18} />}   label="Code kiosque"    error={errors.code_kiosque}>
            <input value={form.code_kiosque} onChange={e => set("code_kiosque", e.target.value)} placeholder="Ex: KMC01MGL"                      className={inputCls(errors.code_kiosque)} />
          </FormField>

          <FormField icon={<MapPin size={18} />} label="Adresse kiosque" error={errors.adresse}>
            <input value={form.adresse}      onChange={e => set("adresse", e.target.value)}      placeholder="Ex: Marché Central, Brazzaville"   className={inputCls(errors.adresse)} />
          </FormField>

          <FormField icon={<MapPin size={18} />} label="Ville"           error={errors.ville}>
            <input value={form.ville}        onChange={e => set("ville", e.target.value)}        placeholder="Ex: Pointe-Noire"                  className={inputCls(errors.ville)} />
          </FormField>

          {/* Téléphone — lecture seule */}
          <FormField icon={<Phone size={18} />} label="Téléphone agent">
            <div className="w-full px-4 py-[13px] rounded-xl text-[14px] bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 italic">
              {kiosque?.telephone ?? "Sera renseigné à la création de l'agent"}
            </div>
          </FormField>

          {/* Statut service */}
          <FormField icon={<Lock size={18} />} label="Statut service">
            <div className="flex gap-3 mt-1">
              {[
                { val: "actif",   label: "Actif",   cls: "bg-green-500 text-white" },
                { val: "inactif", label: "Inactif", cls: "bg-red-400 text-white"   },
              ].map(s => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => set("statut_service", s.val)}
                  className={[
                    "flex-1 py-[10px] rounded-xl text-[13px] font-bold transition-all",
                    form.statut_service === s.val ? s.cls : "bg-gray-100 text-gray-400 hover:bg-gray-200",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </FormField>

        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="px-6 py-5 flex gap-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-[14px] rounded-2xl border-2 border-[#FF6600] text-[#FF6600] font-bold text-[15px] hover:bg-orange-50 transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={["flex-[2] py-[14px] rounded-2xl text-white font-bold text-[15px] transition-colors", saving ? "bg-orange-300 cursor-wait" : "bg-[#FF6600] hover:bg-orange-700"].join(" ")}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>

      </div>
    </div>
  );
}

function FormField({ icon, label, error, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-[7px]">
        <span className="text-gray-500">{icon}</span>
        <label className="text-[14px] font-semibold text-gray-800">{label}</label>
      </div>
      {children}
      {error && <p className="text-red-500 text-[11px] mt-1 ml-1">⚠ {error}</p>}
    </div>
  );
}

function inputCls(error) {
  return [
    "w-full px-4 py-[13px] rounded-xl text-[14px] bg-gray-100 outline-none transition-colors",
    error ? "border-2 border-red-400" : "border-2 border-transparent focus:border-[#FF6600] focus:bg-white",
  ].join(" ");
}