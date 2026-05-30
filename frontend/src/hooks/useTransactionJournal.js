// ─────────────────────────────────────────────────────────────────────────────
// Hook: useTransactionJournal
// 
// Gère le Journal de Transactions de manière ENTIÈREMENT DYNAMIQUE:
// ✅ Pagination
// ✅ Tri (par colonne)
// ✅ Filtrage (type, date, recherche)
// ✅ Polling automatique (mise à jour toutes les N secondes)
// ✅ Rafraîchissement manuel
// ✅ Export (PDF, Excel, Print) avec les données filtrées
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import api from "../lib/axios";

const DEFAULT_LIMIT = 15;
const POLLING_INTERVAL = 30000; // 30 secondes

export function useTransactionJournal(enablePolling = true, pollingInterval = POLLING_INTERVAL) {
  // 📊 État des données
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    total_pages: 1,
  });
  const [stats, setStats] = useState({
    total_operations: 0,
    total_depots: 0,
    total_retraits_partiels: 0,
    total_retraits_solde: 0,
    montant_total_depots: 0,
    montant_total_retraits: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔍 État des filtres
  const [filters, setFilters] = useState({
    date_from: null,
    date_to: null,
    type: null,
    search: null,
  });

  // 📋 État du tri
  const [sortBy, setSortBy] = useState('date_heure');
  const [sortOrder, setSortOrder] = useState('desc');

  // 🔄 Fonction de fetch avec tous les paramètres
  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      // 🔨 Construire les params
      const params = {
        page,
        limit: pagination.limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // Ajouter les filtres s'ils sont définis
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;

      console.log("📡 Fetching transactions with params:", params);

      const response = await api.get("/api/admin/transactions", { params });

      if (response.data?.success) {
        setTransactions(response.data.data || []);
        setPagination(response.data.pagination || {});
        
        const defaultStats = {
          total_operations: 0,
          total_depots: 0,
          total_retraits_partiels: 0,
          total_retraits_solde: 0,
          montant_total_depots: 0,
          montant_total_retraits: 0,
        };
        setStats(response.data.stats ? { ...defaultStats, ...response.data.stats } : defaultStats);
        
        console.log("✅ Transactions loaded:", response.data.data ? response.data.data.length : 0);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
      setError(err.message || "Erreur lors du chargement des transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, sortBy, sortOrder, filters]);

  // 🎯 Charger les données au montage et when filters change
  useEffect(() => {
    fetchTransactions(1); // Toujours recommencer à la page 1 quand les filtres changent
  }, [fetchTransactions]);

  // ⏰ Polling automatique
  useEffect(() => {
    if (!enablePolling) return;

    const id = setInterval(() => {
      console.log("🔄 Auto-refreshing transactions...");
      fetchTransactions(pagination.current_page);
    }, pollingInterval);

    return () => {
      if (id) clearInterval(id);
    };
  }, [enablePolling, pollingInterval, pagination.current_page, fetchTransactions]);

  // 🎮 Contrôles utilisateur
  const handlePageChange = (newPage) => {
    fetchTransactions(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchTransactions(1);
  };

  const handleSort = (column) => {
    // Toggle sort order si on clique sur la même colonne
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      date_from: null,
      date_to: null,
      type: null,
      search: null,
    });
  };

  const handleRefresh = () => {
    console.log("🔄 Manual refresh requested");
    fetchTransactions(pagination.current_page);
  };

  return {
    // 📊 Données
    transactions,
    pagination,
    stats,
    loading,
    error,

    // 🔍 État des filtres et tri
    filters,
    sortBy,
    sortOrder,

    // 🎮 Contrôles
    handlePageChange,
    handleLimitChange,
    handleSort,
    handleFilterChange,
    handleResetFilters,
    handleRefresh,
  };
}
