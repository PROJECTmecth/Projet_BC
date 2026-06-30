import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../lib/axios";
import Swal from "sweetalert2";

const fmt = (n) => Number(n).toLocaleString("fr-FR") + " F";
const todayStr = () => new Date().toISOString().split("T")[0];
const firstOfYear = () => `${new Date().getFullYear()}-01-01`;

const TYPE_LABELS = {
  dépôt_cash:           { label: "Dépôt cash",       color: "#16a34a" },
  retrait_partiel:      { label: "Retrait partiel",   color: "#ea580c" },
  retrait_solde_compte: { label: "Retrait solde",     color: "#dc2626" },
};

const SYNC_LABELS = {
  synchronisé: { label: "Sync",       bg: "#d1fae5", color: "#065f46" },
  en_attente:  { label: "En attente", bg: "#fef3c7", color: "#92400e" },
};

export default function HistoriquePage() {
  const navigate = useNavigate();

  const [dateDebut,     setDateDebut]     = useState(firstOfYear());
  const [dateFin,       setDateFin]       = useState(todayStr());
  const [typeOp,        setTypeOp]        = useState("");
  const [clientSearch,  setClientSearch]  = useState("");
  const [transactions,  setTransactions]  = useState([]);
  const [kpi,           setKpi]           = useState({ total: 0, depots: 0, retraits: 0, montant_total: 0 });
  const [pagination,    setPagination]    = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
  const [loading,       setLoading]       = useState(false);

  const fetchHistorique = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { date_debut: dateDebut, date_fin: dateFin, page, per_page: 15 };
      if (typeOp)              params.type_op = typeOp;
      if (clientSearch.trim()) params.client  = clientSearch.trim();

      const { data } = await axiosClient.get("/api/agent/historique", { params });

      setTransactions(data.transactions.data || []);
      setPagination({
        current_page: data.transactions.current_page,
        last_page:    data.transactions.last_page,
        per_page:     data.transactions.per_page,
        total:        data.transactions.total,
      });
      setKpi(data.kpi || { total: 0, depots: 0, retraits: 0, montant_total: 0 });
    } catch (err) {
      Swal.fire({
        icon: "error", title: "Erreur",
        text: err?.response?.data?.message || "Impossible de charger l'historique.",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setLoading(false);
    }
  }, [dateDebut, dateFin, typeOp, clientSearch]);

  useEffect(() => { fetchHistorique(1); }, []);

  const buildParams = () => {
    const p = new URLSearchParams({ date_debut: dateDebut, date_fin: dateFin });
    if (typeOp)              p.append("type_op", typeOp);
    if (clientSearch.trim()) p.append("client",  clientSearch.trim());
    return p.toString();
  };

  const triggerDownload = async (url, filename) => {
    try {
      const response = await axiosClient.get(url, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.setAttribute("download", filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      Swal.fire({ icon: "error", title: "Export échoué", confirmButtonColor: "#f97316" });
    }
  };

  const exportExcel = () =>
    triggerDownload(
      `/api/agent/historique/export-excel?${buildParams()}`,
      `historique_${dateDebut}_${dateFin}.csv`
    );

  const exportPDF = () =>
    triggerDownload(
      `/api/agent/historique/export-pdf?${buildParams()}`,
      `historique_${dateDebut}_${dateFin}.pdf`
    );

  const pageNumbers = () => {
    const pages = Array.from({ length: pagination.last_page }, (_, i) => i + 1);
    return pages.reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);
  };

  return (
    <div className="bg-[#fdf6ec] min-h-screen font-sans w-full pb-10">

      <div className="pt-6 px-4 md:px-8 max-w-7xl mx-auto">

        {/* Titre */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}
            className="text-slate-800 hover:text-orange-500 transition-colors text-2xl focus:outline-none">
            ←
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 m-0">
            Historique des opérations
          </h1>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl p-4 md:p-5 flex flex-col md:flex-row flex-wrap items-center gap-3 md:gap-4 mb-6 shadow-sm border border-slate-100">
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Du</label>
            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} 
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full md:w-auto" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Au</label>
            <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} 
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full md:w-auto" />
          </div>

          <select value={typeOp} onChange={e => setTypeOp(e.target.value)} 
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full md:w-44">
            <option value="">Tous les types</option>
            <option value="dépôt_cash">Dépôt cash</option>
            <option value="retrait_partiel">Retrait partiel</option>
            <option value="retrait_solde_compte">Retrait solde</option>
          </select>

          <input type="text" placeholder="Rechercher un client…"
            value={clientSearch} onChange={e => setClientSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchHistorique(1)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full md:w-56" />

          <button onClick={() => fetchHistorique(1)} disabled={loading} 
            className={`w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white border-none rounded-lg py-2 px-5 font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            {loading ? "Chargement…" : "Rechercher"}
          </button>

          <div className="hidden md:block flex-1" />

          <div className="flex w-full md:w-auto gap-3 mt-2 md:mt-0">
            <button onClick={exportPDF} className="flex-1 md:flex-none border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-lg py-2 px-4 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Export PDF
            </button>
            <button onClick={exportExcel} className="flex-1 md:flex-none border-2 border-green-600 text-green-700 hover:bg-green-50 rounded-lg py-2 px-4 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export Excel
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 md:p-6 flex items-center justify-between shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-white/85 text-sm md:text-sm font-medium mb-1 uppercase tracking-wide">Total des opérations</p>
              <p className="text-white text-3xl md:text-4xl font-extrabold m-0">{kpi.total}</p>
            </div>
            <div className="relative z-10 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 md:p-6 flex items-center justify-between shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-white/85 text-sm md:text-sm font-medium mb-1 uppercase tracking-wide">Dépôts</p>
              <p className="text-white text-3xl md:text-4xl font-extrabold m-0">{kpi.depots}</p>
            </div>
            <div className="relative z-10 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 md:p-6 flex items-center justify-between shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-white/85 text-sm md:text-sm font-medium mb-1 uppercase tracking-wide">Retraits</p>
              <p className="text-white text-3xl md:text-4xl font-extrabold m-0">{kpi.retraits}</p>
            </div>
            <div className="relative z-10 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>
            </div>
          </div>
        </div>

        {/* Montant total */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 md:p-8 text-center mb-6 shadow-[0_8px_20px_rgba(124,58,237,0.25)] relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-white/5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 150%, rgba(255,255,255,0.2) 0%, transparent 50%)' }}></div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 shadow-inner backdrop-blur-sm text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12a2 2 0 1 0 0 .001M2 10h20"/></svg>
          </div>
          <p className="text-purple-100 text-xs md:text-sm font-semibold mb-1 md:mb-2 uppercase tracking-widest relative z-10">
            Montant total des opérations
          </p>
          <p className="text-white text-3xl md:text-5xl font-extrabold m-0 tracking-wide relative z-10">
            {fmt(kpi.montant_total)}
          </p>
        </div>
      </div>

      {/* Tableau */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="bg-orange-500 rounded-t-xl px-5 py-3 shadow-sm">
          <span className="text-white font-bold text-sm md:text-base uppercase tracking-wider">Historique</span>
        </div>

        <div className="bg-white rounded-b-xl shadow-md overflow-hidden border border-slate-200 border-t-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-slate-800 text-white uppercase tracking-wider text-xs font-bold">
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Nom et Prénom</th>
                  <th className="px-5 py-4">Opération</th>
                  <th className="px-5 py-4">Montant</th>
                  <th className="px-5 py-4">Heure</th>
                  <th className="px-5 py-4">N. Carte</th>
                  <th className="px-5 py-4">Téléphone</th>
                  <th className="px-5 py-4 text-center">Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-orange-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="text-sm font-medium">Chargement en cours…</p>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400">
                      <span className="text-4xl block mb-3">📭</span>
                      <p className="text-sm font-medium">Aucune transaction pour cette période.</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, i) => {
                    const op   = TYPE_LABELS[tx.type_op]     || { label: tx.type_op, color: "#6b7280" };
                    const sync = SYNC_LABELS[tx.sync_status] || SYNC_LABELS.en_attente;
                    const dt   = new Date(tx.date_heure);
                    return (
                      <tr key={tx.id_trans}
                        onClick={() => navigate(`/agent/clients/${tx.id_client}`)}
                        className={`hover:bg-orange-50 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                      >
                        <td className="px-5 py-3.5 font-medium">{dt.toLocaleDateString("fr-FR")}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{tx.client_prenom} {tx.client_nom}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-white rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: op.color }}>
                            {op.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{fmt(tx.montant)}</td>
                        <td className="px-5 py-3.5">{dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-600">{tx.numero_carte || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-600">{tx.telephone || "—"}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: sync.bg, color: sync.color }}>
                            {sync.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex justify-center items-center gap-1.5 md:gap-2 mt-6">
            <button disabled={pagination.current_page === 1 || loading}
              onClick={() => fetchHistorique(pagination.current_page - 1)}
              className="px-3 md:px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              ← <span className="hidden md:inline">Préc.</span>
            </button>
            {pageNumbers().map((p, i) =>
              p === "…"
                ? <span key={`d${i}`} className="text-slate-400 px-1.5">…</span>
                : <button key={p} onClick={() => fetchHistorique(p)} disabled={loading}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                      p === pagination.current_page 
                        ? 'bg-orange-500 text-white shadow-sm' 
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}>
                    {p}
                  </button>
            )}
            <button disabled={pagination.current_page === pagination.last_page || loading}
              onClick={() => fetchHistorique(pagination.current_page + 1)}
              className="px-3 md:px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <span className="hidden md:inline">Suiv.</span> →
            </button>
          </div>
        )}

        <p className="text-center text-slate-400 text-xs font-medium mt-4">
          {pagination.total} transaction{pagination.total !== 1 ? "s" : ""} — page {pagination.current_page} / {pagination.last_page}
        </p>
      </div>
    </div>
  );
}