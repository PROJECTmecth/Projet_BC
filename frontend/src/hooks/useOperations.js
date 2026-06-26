// ─────────────────────────────────────────────────────────────────────────────
// Hook: useOperations
// 
// Gère complètement la table "Opérations récentes" de manière DYNAMIQUE:
// ✅ Pagination
// ✅ Tri (par colonne)
// ✅ Filtrage (type, date, recherche)
// ✅ Polling automatique (mise à jour toutes les N secondes)
// ✅ Rafraîchissement manuel
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import api from "../lib/axios";

const DEFAULT_LIMIT = 10;
const POLLING_INTERVAL = 30000; // 30 secondes (faire la mise à jour automatique)

export function useOperations(enablePolling = true, pollingInterval = POLLING_INTERVAL) {
  // 📊 État des données
  const [operations, setOperations] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔍 État des filtres
  const [filters, setFilters] = useState({
    type: null,           // 'dépôt_cash', 'retrait_partiel', 'retrait_solde_compte'
    date_from: null,      // YYYY-MM-DD
    date_to: null,        // YYYY-MM-DD
    search: null,         // nom client ou numéro carte
  });

  // 📋 État du tri
  const [sortBy, setSortBy] = useState('date_heure');
  const [sortOrder, setSortOrder] = useState('desc');

  // ⏱️ ID du timeout de polling
  const [pollingId, setPollingId] = useState(null);

  // 🔄 Fonction de fetch avec tous les paramètres
  const fetchOperations = useCallback(async (page = 1) => {
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
      if (filters.type) params.type = filters.type;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      if (filters.search) params.search = filters.search;

      console.log("📡 Fetching operations with params:", params);

      const response = await api.get("/api/admin/mouvements-caisse", { params });

      if (response.data?.success) {
        const raw = response.data.transactions || [];

        // Normaliser la forme des données pour OperationsTable
        const mapped = raw.map((t) => {
          // Carte: backend peut renvoyer id_carte (numero) ou objet carte
          const carte = t.id_carte || t.numero_carte || t.carte?.numero_carte || '';

          // Client: priorité au champ nom_client puis objet client
          const client = t.nom_client || (t.client ? `${t.client.nom || ''} ${t.client.prenom || ''}`.trim() : '');

          // Type lisible
          const rawType = t.type_op || t.operation || t.type || '';
          const type = rawType ? String(rawType).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

          // Montant
          const montant = (t.montant !== undefined && t.montant !== null) ? Number(t.montant) : '';

          // Date: essayer date_heure ISO ou champ date formaté
          let date = '';
          if (t.date) date = t.date;
          else if (t.date_heure) {
            try {
              const d = new Date(t.date_heure);
              date = d.toLocaleDateString('fr-FR');
            } catch (e) { date = t.date_heure; }
          }

          // Agent: plusieurs fallback possibles
          const agent = t.nom_agent || (t.agent ? (t.agent.user?.name || `${t.agent.nom || ''} ${t.agent.prenom || ''}`.trim()) : '');

          return {
            // champs attendus par OperationsTable
            carte,
            client,
            type,
            montant,
            date,
            agent,

            // champs bruts pour debug/usage ultérieur
            _raw: t,
          };
        });

        setOperations(mapped);
        setPagination(response.data.pagination || {});
        console.log("✅ Operations loaded:", mapped.length);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("❌ Error fetching operations:", err);
      setError(err.message || "Erreur lors du chargement des opérations");
      setOperations([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, sortBy, sortOrder, filters]);

  // 🎯 Charger les données au montage et when filters change
  useEffect(() => {
    fetchOperations(1); // Toujours recommencer à la page 1 quand les filtres changent
  }, [fetchOperations]);

  // ⏰ Polling automatique
  useEffect(() => {
    if (!enablePolling) return;

    // Charger une première fois immédiatement
    const id = setInterval(() => {
      console.log("🔄 Auto-refreshing operations...");
      fetchOperations(pagination.current_page);
    }, pollingInterval);

    setPollingId(id);

    return () => {
      if (id) clearInterval(id);
    };
  }, [enablePolling, pollingInterval, pagination.current_page, fetchOperations]);

  // 🎮 Contrôles utilisateur
  const handlePageChange = (newPage) => {
    fetchOperations(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchOperations(1);
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
      type: null,
      date_from: null,
      date_to: null,
      search: null,
    });
  };

  const handleRefresh = () => {
    console.log("🔄 Manual refresh requested");
    fetchOperations(pagination.current_page);
  };

  return {
    // 📊 Données
    operations,
    pagination,
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
