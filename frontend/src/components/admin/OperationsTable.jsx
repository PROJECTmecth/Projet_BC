// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/OperationsTable.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";

const PAGE_SIZE = 10;
const HEADERS   = ["ID CARTE", "NOM ET PRENOM", "OPERATION", "MONTANT", "DATE", "AGENT"];

const IcoRefresh = ({ spinning }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: spinning ? "spin 0.8s linear infinite" : "none" }}>
    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
  </svg>
);

function timeAgo(date) {
  if (!date) return null;
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 10)  return "à l'instant";
  if (s < 60)  return `il y a ${s}s`;
  return `il y a ${Math.floor(s / 60)}min`;
}

export default function OperationsTable({ operations = [], loading = false, onRefresh, refreshing = false, lastUpdated = null }) {
  const [page, setPage] = useState(1);
  const [, setTick]     = useState(0);

  useEffect(() => { setPage(1); }, [operations]);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const totalPages = Math.max(1, Math.ceil(operations.length / PAGE_SIZE));
  const paged      = operations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageButtons = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3)       return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) return [totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages];
    return [page-2, page-1, page, page+1, page+2];
  };

  if (loading) return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#FF6600] to-orange-400 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">Opérations récentes</h3>
      </div>
      <div className="p-6 space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">

      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#FF6600] to-orange-400 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Opérations récentes</h3>
          {lastUpdated && (
            <p className="text-xs text-orange-100 mt-0.5">Actualisé {timeAgo(lastUpdated)} — auto toutes les 30s</p>
          )}
        </div>
        {onRefresh && (
          <button onClick={onRefresh} disabled={refreshing}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
            <IcoRefresh spinning={refreshing} />
            {refreshing ? "Actualisation…" : "Actualiser"}
          </button>
        )}
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-orange-50">
            <tr>{HEADERS.map(h => <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paged.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Aucune opération récente</td></tr>
            ) : paged.map((op) => (
              <tr key={op.id} className="hover:bg-orange-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-800">{op.carte}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{op.client}</td>
                <td className="px-6 py-4">
                  <span className={["px-3 py-1 rounded-full text-xs font-semibold",
                    op.type === "Dépôt"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-orange-100 text-orange-700 border border-orange-200"].join(" ")}>
                    {op.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">{op.montant} F</td>
                <td className="px-6 py-4 text-sm text-gray-500">{op.date}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{op.agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page <span className="font-semibold text-gray-800">{page}</span> / <span className="font-semibold text-gray-800">{totalPages}</span>
            <span className="text-gray-400 ml-2">({operations.length} opérations)</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">
              ← Préc.
            </button>
            {pageButtons().map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={["w-8 h-8 text-sm rounded-lg font-semibold transition-colors",
                  n === page ? "bg-[#FF6600] text-white shadow-sm" : "border border-gray-200 text-gray-700 hover:bg-orange-50"].join(" ")}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">
              Suiv. →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
