// src/components/admin/clients/ClientDetailModal.jsx

import { useState, useEffect } from "react";
import { X, Printer, FileText } from "lucide-react";

const fmt = (n) => Number(n ?? 0).toLocaleString("fr-FR").replace(/\s/g, "\u00A0");

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const h   = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function CircleProgress({ pct = 0 }) {
  const r = 54, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="#FF6600" strokeWidth="12"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 70 70)" />
      <text x="70" y="70" textAnchor="middle" dominantBaseline="central"
        fill="#FF6600" fontSize="22" fontWeight="bold">{pct}%</text>
    </svg>
  );
}

export default function ClientDetailModal({ client, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    fetch(`${API}/admin/clients/${client.id_client}`, { headers: h() })
      .then(r => r.json())
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [client]);

  if (!client) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {loading || !data ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            {loading ? "Chargement…" : "Erreur de chargement."}
          </div>
        ) : (
          <>
            {/* Header orange */}
            <div className="relative bg-[#FF6600] px-6 pt-6 pb-8 text-white rounded-t-2xl">
              <button onClick={onClose}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 rounded-full p-1">
                <X size={18} />
              </button>
              <div className="absolute top-4 right-12 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                👤
              </div>
              <h2 className="text-2xl font-bold">{data.infos.nom} {data.infos.prenom}</h2>
              <p className="mt-2 text-white/90"><span className="font-semibold">Activité :</span> {data.infos.activite}</p>
              <p className="text-white/90"><span className="font-semibold">Adresse :</span> {data.infos.adresse}</p>
              <p className="text-white/90"><span className="font-semibold">Téléphone :</span> {data.infos.telephone}</p>
              <p className="text-white/90"><span className="font-semibold">Résident :</span> {data.infos.nationalite === "Résident" ? "OUI" : "NON"}</p>
            </div>

            <div className="px-6 py-5">
              <h3 className="font-bold text-[#1e2a3a] text-lg mb-4">Tableau de bord de la Carte</h3>
              <div className="flex gap-6 items-center">
                <CircleProgress pct={data.carte.progression ?? 0} />
                <div className="flex-1 space-y-3">
                  <div className="bg-orange-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500">No. Carte</p>
                    <p className="text-[#FF6600] font-bold text-lg">{data.carte.numero_carte}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500">Activation</p>
                      <p className="font-semibold text-sm">{data.carte.date_activation}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500">Expiration</p>
                      <p className="font-semibold text-sm">{data.carte.date_expiration}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500">Montant actuel</p>
                    <p className="text-green-600 font-bold text-xl">{fmt(data.carte.montant_actuel)} FCFA</p>
                  </div>
                </div>
              </div>

              {/* Journal */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#1e2a3a] text-lg">Journal des Opérations</h3>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50">
                      <Printer size={13} /> Imprimer
                    </button>
                    <button className="flex items-center gap-1 border border-red-400 text-red-500 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50">
                      <FileText size={13} /> Exporter
                    </button>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-orange-100 text-[#1e2a3a] text-xs">
                        <th className="px-3 py-3 text-left">No.</th>
                        <th className="px-3 py-3 text-left">Date</th>
                        <th className="px-3 py-3 text-left">Heure</th>
                        <th className="px-3 py-3 text-left">Opération</th>
                        <th className="px-3 py-3 text-right">Montant</th>
                        <th className="px-3 py-3 text-left">Kiosque</th>
                        <th className="px-3 py-3 text-left">Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-6 text-gray-400 text-xs">Aucune opération</td></tr>
                      ) : data.transactions.map((t, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-orange-50/50"}>
                          <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                          <td className="px-3 py-3">{t.date}</td>
                          <td className="px-3 py-3 text-gray-500">{t.heure}</td>
                          <td className="px-3 py-3 font-semibold">{t.operation}</td>
                          <td className={`px-3 py-3 text-right font-bold ${t.type_op === "dépôt_cash" ? "text-green-600" : "text-red-500"}`}>
                            {t.type_op === "dépôt_cash" ? "+" : "-"}{fmt(t.montant)} FCFA
                          </td>
                          <td className="px-3 py-3 text-gray-600">{t.kiosque}</td>
                          <td className="px-3 py-3 text-gray-600">{t.agent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}