import { ChevronDown, RotateCw, Search } from "lucide-react";
import { useState } from "react";

const HEADERS = [
  { key: "id_carte", label: "ID CARTE", sortable: true },
  { key: "nom_client", label: "NOM ET PRENOM", sortable: false },
  { key: "type_op", label: "OPERATION", sortable: true },
  { key: "montant", label: "MONTANT", sortable: true },
  { key: "date_heure", label: "DATE", sortable: true },
];

function formatMontant(value) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toLocaleString("fr-FR") : "0";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("fr-FR");
}

function formatOperation(type) {
  const labels = {
    "dépôt_cash": "Dépôt cash",
    "retrait_partiel": "Retrait partiel",
    "retrait_solde_compte": "Retrait solde",
  };
  return labels[type] || type || "";
}

export default function OperationsTable({
  operations = [],
  loading = false,
  filters = {},
  sortBy = "date_heure",
  sortOrder = "desc",
  onSort = () => {},
  onFilterChange = () => {},
  onRefresh = () => {},
}) {
  const [localFilters, setLocalFilters] = useState({
    type: filters.type || null,
    date_from: filters.date_from || null,
    date_to: filters.date_to || null,
  });
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleApplyFilters = () => {
    onFilterChange({
      type: localFilters.type || null,
      date_from: localFilters.date_from || null,
      date_to: localFilters.date_to || null,
      search: searchInput || null,
    });
  };

  const handleResetFilters = () => {
    const emptyFilters = { type: null, date_from: null, date_to: null };
    setLocalFilters(emptyFilters);
    setSearchInput("");
    onFilterChange({ ...emptyFilters, search: null });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const renderSortIcon = (header) => {
    if (!header.sortable) return null;

    if (sortBy !== header.key) {
      return <span className="text-gray-300 text-xs">▼▲</span>;
    }

    return (
      <ChevronDown
        size={14}
        className={`text-orange-600 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
      />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#FF6600] to-orange-400 px-6 py-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Opérations récentes</h3>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCw size={17} className={isRefreshing || loading ? "animate-spin" : ""} />
          <span className="text-sm font-semibold">Rafraîchir</span>
        </button>
      </div>

      <div className="border-b border-gray-200 p-5 bg-gray-50 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou n° carte..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            />
          </div>

          <select
            value={localFilters.type || ""}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, type: e.target.value || null }))}
            className="h-12 px-5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white md:w-40"
          >
            <option value="">Tous les types</option>
            <option value="dépôt_cash">Dépôt</option>
            <option value="retrait_partiel">Retrait partiel</option>
            <option value="retrait_solde_compte">Retrait solde</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">De:</label>
            <input
              type="date"
              value={localFilters.date_from || ""}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, date_from: e.target.value || null }))}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">À:</label>
            <input
              type="date"
              value={localFilters.date_to || ""}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, date_to: e.target.value || null }))}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            />
          </div>

          <button
            type="button"
            onClick={handleApplyFilters}
            className="h-12 px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Appliquer
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            className="h-12 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-orange-50 border-b border-gray-200">
            <tr>
              {HEADERS.map(header => (
                <th
                  key={header.key}
                  onClick={() => header.sortable && onSort(header.key)}
                  className={[
                    "px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide",
                    header.sortable ? "cursor-pointer hover:bg-orange-100 transition-colors" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    {header.label}
                    {renderSortIcon(header)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {operations.length === 0 ? (
              <tr>
                <td colSpan={HEADERS.length} className="px-6 py-12 text-center text-sm text-gray-400">
                  {loading ? "Chargement..." : "Aucune opération trouvée"}
                </td>
              </tr>
            ) : (
              operations.map((op) => (
                <tr key={op.id_trans} className="hover:bg-orange-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{op.id_carte}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{op.nom_client}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{formatOperation(op.type_op)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatMontant(op.montant)} F</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(op.date_heure)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
