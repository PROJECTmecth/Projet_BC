// src/pages/admin/GestionClients.jsx
import { useState, useEffect, useMemo } from "react";
import { Search, Printer, Download, FileText, User, X } from "lucide-react";
import api from "../../lib/axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const fmt = (n) => Number(n ?? 0).toLocaleString("fr-FR").replace(/\s/g, "\u00A0");

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

function ModalClient({ clientId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    api.get(`/api/admin/clients/${clientId}`)
      .then(({ data: res }) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Chargement…</div>
        ) : !data ? (
          <div className="p-6 text-red-500">Erreur de chargement.</div>
        ) : (
          <>
            <div className="relative bg-[#FF6600] px-6 pt-5 pb-8 text-white rounded-t-2xl">
              <button onClick={onClose}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 rounded-full p-1 z-10">
                <X size={18} />
              </button>
              <div className="flex items-center gap-4 pr-10">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <User size={28} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold truncate">{data.infos.nom} {data.infos.prenom}</h2>
                  <p className="mt-1 text-white/90 text-sm"><span className="font-semibold">Activité :</span> {data.infos.activite}</p>
                  <p className="text-white/90 text-sm"><span className="font-semibold">Adresse :</span> {data.infos.adresse}</p>
                  <p className="text-white/90 text-sm"><span className="font-semibold">Téléphone :</span> {data.infos.telephone}</p>
                  <p className="text-white/90 text-sm"><span className="font-semibold">Résident :</span> {data.infos.nationalite === "Résident" ? "OUI" : "NON"}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <h3 className="font-bold text-[#1e2a3a] text-lg mb-4">Tableau de bord de la Carte</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                <div className="shrink-0">
                  <CircleProgress pct={data.carte.progression ?? 0} />
                </div>
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

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#1e2a3a] text-lg">Journal des Opérations</h3>
                </div>
                <div className="bg-orange-50 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function GestionClients() {
  const [clients, setClients]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    api.get("/api/admin/clients")
      .then(({ data }) => { setClients(data.data ?? []); setTotal(data.total ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    clients.filter(c =>
      `${c.nom} ${c.prenom} ${c.telephone} ${c.numero_carte}`
        .toLowerCase().includes(search.toLowerCase())
    ), [clients, search]);

  // --- ACTIONS & SECURITÉS ---
  const hasData = (label) => {
    if (filtered.length === 0) {
      Swal.fire("Action impossible", `Aucune donnée à ${label}.`, "warning");
      return false;
    }
    return true;
  };

  const handlePrint = () => {
    if (!hasData("imprimer")) return;
    Swal.fire({
      title: "Imprimer ?",
      text: "Voulez-vous imprimer la liste filtrée ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1e2a3a",
      confirmButtonText: "Oui, imprimer"
    }).then(res => res.isConfirmed && window.print());
  };

  const exportPDF = () => {
    if (!hasData("exporter")) return;
    Swal.fire({
      title: "Export PDF",
      text: "Générer le fichier PDF ?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Exporter"
    }).then(res => {
      if (res.isConfirmed) {
        const doc = new jsPDF('landscape');
        doc.text("Liste des Clients", 14, 15);
        const head = [["No.", "Nom & Prénom", "Carte", "Adresse", "Nationalité", "Tél.", "Activité"]];
        const body = filtered.map((c, i) => [i + 1, `${c.nom} ${c.prenom}`, c.numero_carte, c.adresse, c.nationalite, c.telephone, c.activite]);
        doc.autoTable({ head, body, startY: 20, theme: 'grid', headStyles: { fillColor: [30, 42, 58] } });
        doc.save("liste_clients.pdf");
      }
    });
  };

  const exportExcel = () => {
    if (!hasData("exporter")) return;
    Swal.fire({
      title: "Export Excel",
      text: "Générer le fichier Excel ?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Exporter"
    }).then(res => {
      if (res.isConfirmed) {
        const ws = XLSX.utils.json_to_sheet(filtered);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Clients");
        XLSX.writeFile(wb, "liste_clients.xlsx");
      }
    });
  };

  return (
    <div className="printable-area">
      {/* Bannière */}
      <div className="relative bg-[#1e2a3a] rounded-2xl px-5 sm:px-8 py-5 sm:py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-7 overflow-hidden gap-4">
        <div className="absolute right-40 -top-6 w-28 h-28 rounded-full bg-white/[0.04]" />
        <div className="flex items-center gap-4 z-10 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] bg-white/10 flex items-center justify-center text-white shrink-0">
            <User size={26} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate">Gestion de clients</h1>
            <p className="text-white/60 text-xs sm:text-sm mt-0.5">Base de données complète des clients</p>
          </div>
        </div>
        <div className="z-10 bg-white rounded-2xl px-4 sm:px-6 py-2 sm:py-3 text-center shadow shrink-0">
          <p className="text-xs text-gray-500">Total clients</p>
          <p className="text-2xl sm:text-3xl font-black text-[#1e2a3a]">{String(total).padStart(2, "0")}</p>
        </div>
      </div>

      {/* Recherche + actions */}
      <div className="bg-white rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3 mb-6 shadow-sm no-print">
        <div className="flex-1 relative min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Recherche du nom, téléphone ou compte..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none" />
        </div>
        <button onClick={handlePrint} className="flex items-center gap-1.5 border border-[#1e2a3a] text-[#1e2a3a] px-3 py-2 rounded-lg text-sm hover:bg-gray-50" title="Imprimer">
          <Printer size={15} /><span className="hidden sm:inline">Imprimer</span>
        </button>
        <button onClick={exportPDF} className="flex items-center gap-1.5 border border-red-500 text-red-500 px-3 py-2 rounded-lg text-sm hover:bg-red-50" title="PDF">
          <FileText size={15} /><span className="hidden sm:inline">PDF</span>
        </button>
        <button onClick={exportExcel} className="flex items-center gap-1.5 border border-green-600 text-green-600 px-3 py-2 rounded-lg text-sm hover:bg-green-50" title="Excel">
          <Download size={15} /><span className="hidden sm:inline">Excel</span>
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-[#1e2a3a] text-white text-xs uppercase">
              <th className="px-4 py-4 text-left">No.</th>
              <th className="px-4 py-4 text-left">Genre</th>
              <th className="px-4 py-4 text-left">Nom & Prénom</th>
              <th className="px-4 py-4 text-left">Adresse</th>
              <th className="px-4 py-4 text-left">Nationalité</th>
              <th className="px-4 py-4 text-left">Pièce ID</th>
              <th className="px-4 py-4 text-left">No. Pièce</th>
              <th className="px-4 py-4 text-left">Activité</th>
              <th className="px-4 py-4 text-left">Tél.</th>
              <th className="px-4 py-4 text-center no-print">Détail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-10 text-gray-400">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-10 text-gray-400">Aucun client trouvé</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c.id_client} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-4 text-gray-500">{i + 1}</td>
                <td className="px-4 py-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${c.genre === "Homme" ? "bg-blue-400" : "bg-pink-400"}`}>
                    {c.genre === "Homme" ? "M" : "F"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold text-[#1e2a3a]">{c.nom} {c.prenom}</p>
                  <p className="text-xs text-[#FF6600]">{c.numero_carte}</p>
                </td>
                <td className="px-4 py-4 text-gray-600">{c.adresse}</td>
                <td className="px-4 py-4 text-gray-600">{c.nationalite}</td>
                <td className="px-4 py-4 text-gray-600">{c.type_piece}</td>
                <td className="px-4 py-4 text-gray-600">{c.num_piece}</td>
                <td className="px-4 py-4 text-gray-600">{c.activite}</td>
                <td className="px-4 py-4 text-gray-600">{c.telephone}</td>
                <td className="px-4 py-4 text-center no-print">
                  <button onClick={() => setSelectedId(c.id_client)}
                    className="border border-blue-400 text-blue-500 rounded-lg p-1.5 hover:bg-blue-50">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <ModalClient clientId={selectedId} onClose={() => setSelectedId(null)} />

      {/* Styles CSS pour l'impression propre */}
      <style>{`
        @media print {
          @page { size: auto; margin: 5mm; }
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .printable-area { padding: 0 !important; margin: 0 !important; }
          table { border-collapse: collapse !important; width: 100% !important; }
          th, td { border: 1px solid #ddd !important; padding: 8px !important; }
        }
      `}</style>
    </div>
  );
}