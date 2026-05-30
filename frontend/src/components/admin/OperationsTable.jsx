// ─────────────────────────────────────────────────────────────────────────────
// Composant: OperationsTable (ENTIÈREMENT DYNAMIQUE)
//
// Affiche les opérations récentes avec:
// ✅ Pagination (précédent/suivant + jump to page)
// ✅ Tri (cliquable sur les colonnes)
// ✅ Filtrage (type, date, recherche)
// ✅ Refresh manuel + auto polling
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { ChevronUp, ChevronDown, RotateCw, Search } from "lucide-react";

export default function OperationsTable({ 
  operations = [], 
  loading = false,
  pagination = {},
  filters = {},
  sortBy = 'date_heure',
  sortOrder = 'desc',
  onPageChange = () => {},
  onLimitChange = () => {},
  onSort = () => {},
  onFilterChange = () => {},
  onRefresh = () => {},
}) {
  const HEADERS = [
    { key: "id_carte", label: "ID CARTE", sortable: true },
    { key: "nom_client", label: "NOM ET PRENOM", sortable: false },
    { key: "type_op", label: "OPERATION", sortable: true },
    { key: "montant", label: "MONTANT", sortable: true },
    { key: "date_heure", label: "DATE", sortable: true },
  ];

  // État local pour les filtres
  const [localFilters, setLocalFilters] = useState(filters);
  const [searchInput, setSearchInput] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🔍 Appliquer les filtres
  const handleApplyFilters = () => {
    onFilterChange({
      type: localFilters.type || null,
      date_from: localFilters.date_from || null,
      date_to: localFilters.date_to || null,
      search: searchInput || null,
    });
  };

  // 🔄 Rafraîchir
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 🏷️ Badge pour le type d'opération
  const getTypeBadge = (typeOp) => {
    const normalizedType = typeOp?.toLowerCase() || '';
    const isDeposit = normalizedType.includes('dépôt');
    
    return (
      <span className={[
        "px-3 py-1 rounded-full text-xs font-semibold",
        isDeposit
          ? "bg-green-100 text-green-700 border border-green-200"
          : "bg-orange-100 text-orange-700 border border-orange-200",
      ].join(" ")}>
        {typeOp}
      </span>
    );
  };

  // 📊 Icône de tri pour les colonnes
  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return <span className="text-gray-300 text-xs">▼▲</span>;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp size={14} className="text-orange-600" />
      : <ChevronDown size={14} className="text-orange-600" />;
  };

  if (loading && operations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#FF6600] to-orange-400 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Opérations récentes</h3>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────────────*/}
      {/* En-tête orange                                                     */}
      {/* ─────────────────────────────────────────────────────────────────────*/}
      <div className="bg-gradient-to-r from-[#FF6600] to-orange-400 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Opérations récentes</h3>
        
        {/* Bouton Refresh */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span className="text-xs font-semibold">Rafraîchir</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────*/}
      {/* Barre de filtrage                                                   */}
      {/* ─────────────────────────────────────────────────────────────────────*/}
      <div className="border-b border-gray-200 p-4 bg-gray-50 space-y-3">
        {/* Ligne 1: Recherche + Type */}
        <div className="flex gap-3 flex-wrap">
          {/* Recherche */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou n° carte..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Filtre Type */}
          <select
            value={localFilters.type || ''}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, type: e.target.value || null }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tous les types</option>
            <option value="dépôt_cash">Dépôt</option>
            <option value="retrait_partiel">Retrait partiel</option>
            <option value="retrait_solde_compte">Retrait solde</option>
          </select>
        </div>

        {/* Ligne 2: Dates + Boutons */}
        <div className="flex gap-3 flex-wrap items-end">
          {/* Date From */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">De:</label>
            <input
              type="date"
              value={localFilters.date_from || ''}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, date_from: e.target.value || null }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Date To */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">À:</label>
            <input
              type="date"
              value={localFilters.date_to || ''}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, date_to: e.target.value || null }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Boutons */}
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Appliquer
          </button>
          <button
            onClick={() => {
              setLocalFilters({ type: null, date_from: null, date_to: null });
              setSearchInput("");
              onFilterChange({ type: null, date_from: null, date_to: null, search: null });
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────*/}
      {/* Tableau                                                             */}
      {/* ─────────────────────────────────────────────────────────────────────*/}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* En-têtes */}
          <thead className="bg-orange-50 border-b border-gray-200">
            <tr>
              {HEADERS.map(header => (
                <th
                  key={header.key}
                  onClick={() => header.sortable && onSort(header.key)}
                  className={[
                    "px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide",
                    header.sortable ? "cursor-pointer hover:bg-orange-100 transition-colors" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    {header.label}
                    {header.sortable && <SortIcon column={header.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Corps */}
          <tbody className="divide-y divide-gray-100">
            {operations.length === 0 ? (
              <tr>
                <td colSpan={HEADERS.length} className="px-6 py-8 text-center text-sm text-gray-400">
                  {loading ? "Chargement..." : "Aucune opération trouvée"}
                </td>
              </tr>
            ) : (
              operations.map((op) => (
                <tr key={op.id_trans} className="hover:bg-orange-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{op.id_carte}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{op.nom_client}</td>
                  <td className="px-6 py-4">{getTypeBadge(op.type_op)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{op.montant} F</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(op.date_heure).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────*/}
      {/* Pagination                                                          */}
      {/* ─────────────────────────────────────────────────────────────────────*/}
      {operations.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          {/* Infos pagination */}
          <div className="text-sm text-gray-600">
            Affichage de <span className="font-semibold">{(pagination.current_page - 1) * pagination.limit + 1}</span> à{" "}
            <span className="font-semibold">
              {Math.min(pagination.current_page * pagination.limit, pagination.total)}
            </span> sur <span className="font-semibold">{pagination.total}</span> résultats
          </div>

          {/* Contrôles pagination */}
          <div className="flex items-center gap-3">
            {/* Items par page */}
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value={5}>5 par page</option>
              <option value={10}>10 par page</option>
              <option value={25}>25 par page</option>
              <option value={50}>50 par page</option>
            </select>

            {/* Boutons navigation */}
            <button
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Précédent
            </button>

            {/* Numéros de page */}
            <div className="flex gap-1">
              {Array.from(
                { length: Math.min(5, pagination.total_pages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.total_pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current_page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.current_page >= pagination.total_pages - 2) {
                    pageNum = pagination.total_pages - 4 + i;
                  } else {
                    pageNum = pagination.current_page - 2 + i;
                  }
                  return pageNum;
                }
              ).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={[
                    "px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                    pageNum === pagination.current_page
                      ? "bg-orange-600 text-white"
                      : "border border-gray-300 hover:bg-orange-50",
                  ].join(" ")}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.total_pages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}