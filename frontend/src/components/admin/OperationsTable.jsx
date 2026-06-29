// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/OperationsTable.jsx
// Pagination SERVEUR — 5 lignes par page, données paginées depuis l'API
// ─────────────────────────────────────────────────────────────────────────────

const HEADERS = ["ID CARTE", "NOM ET PRENOM", "OPERATION", "MONTANT", "DATE", "KIOSQUE", "AGENT"];

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

// ── Boutons de pages (max 5 boutons visibles) ─────────────────────────────────
function pageButtons(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5];
  if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
}

export default function OperationsTable({
  operations  = [],
  loading     = false,
  pagination  = { current_page: 1, total_pages: 1, total: 0, limit: 5 },
  onPageChange,
  onRefresh,
  refreshing  = false,
  lastUpdated = null,
}) {
  const { current_page = 1, total_pages = 1, total = 0 } = pagination;

  // ── Skeleton loader ──────────────────────────────────────────────────────────
  if (loading && operations.length === 0) return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#FF6600] to-orange-400 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">Opérations récentes</h3>
      </div>
      <div className="p-6 space-y-3">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#FF6600] to-orange-400 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Opérations récentes</h3>
          {lastUpdated && (
            <p className="text-xs text-orange-100 mt-0.5">
              Actualisé {timeAgo(lastUpdated)} — auto toutes les 30s
            </p>
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

      {/* ── Tableau ─────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-orange-50">
            <tr>
              {HEADERS.map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {operations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                  Aucune opération récente (dernières 24h)
                </td>
              </tr>
            ) : (
              operations.map((op, idx) => (
                <tr key={op._raw?.id_trans ?? idx} className="hover:bg-orange-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{op.carte}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{op.client}</td>
                  <td className="px-6 py-4">
                    <span className={[
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      op.type?.toLowerCase().includes("dépôt")
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-orange-100 text-orange-700 border border-orange-200",
                    ].join(" ")}>
                      {op.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {typeof op.montant === "number"
                      ? op.montant.toLocaleString("fr-FR") + " F"
                      : op.montant + " F"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{op.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{op.kiosque}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{op.agent}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination serveur ───────────────────────────────────────────────── */}
      {total_pages >= 1 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Infos */}
          <p className="text-xs text-gray-500">
            Page{" "}
            <span className="font-semibold text-gray-800">{current_page}</span>
            {" "}/ {" "}
            <span className="font-semibold text-gray-800">{total_pages}</span>
            <span className="text-gray-400 ml-2">({total} opération{total > 1 ? "s" : ""})</span>
          </p>

          {/* Boutons */}
          {total_pages > 1 && (
            <div className="flex items-center gap-1.5">
              {/* Précédent */}
              <button
                onClick={() => onPageChange?.(current_page - 1)}
                disabled={current_page <= 1 || loading}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                ← Préc.
              </button>

              {/* Numéros */}
              {pageButtons(current_page, total_pages).map(n => (
                <button
                  key={n}
                  onClick={() => onPageChange?.(n)}
                  disabled={loading}
                  className={[
                    "w-8 h-8 text-xs rounded-lg font-semibold transition-colors",
                    n === current_page
                      ? "bg-[#FF6600] text-white shadow-sm"
                      : "border border-gray-200 text-gray-700 hover:bg-orange-50",
                  ].join(" ")}
                >
                  {n}
                </button>
              ))}

              {/* Suivant */}
              <button
                onClick={() => onPageChange?.(current_page + 1)}
                disabled={current_page >= total_pages || loading}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Suiv. →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
