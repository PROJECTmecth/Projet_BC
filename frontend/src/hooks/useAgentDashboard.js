import { useState, useEffect, useCallback } from "react";
import axiosClient from "../lib/axios";

/**
 * ============================================================
 *  useAgentDashboard — BOMBA CASH
 * ============================================================
 *  Hook personnalisé pour gérer les données du dashboard agent.
 *  Sépare la logique métier du composant UI.
 *
 *  Retourne :
 *    - stats       : statistiques du dashboard
 *    - profil      : informations profil agent + kiosque
 *    - rapportJour : transactions du jour
 *    - loading     : état de chargement
 *    - error       : message d'erreur
 *    - refresh     : fonction pour recharger les données
 * ============================================================
 */
export function useAgentDashboard() {
  const [stats, setStats] = useState({
    total_clients: 0,
    total_kiosques: 0,
    solde_total: 0,
    revenus_encaisses: 0,
  });
  const [profil, setProfil] = useState(null);
  const [rapportJour, setRapportJour] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosClient.get("/api/agent/dashboard");
      const { data } = response.data;

      setStats(data.stats);
      setProfil(data.profil);
      setRapportJour(data.rapport_jour);
    } catch (err) {
      // Gestion des erreurs HTTP
      if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
      } else if (err.response?.status === 403) {
        setError("Accès refusé. Votre compte n'est pas autorisé.");
      } else {
        setError("Impossible de charger le tableau de bord. Vérifiez votre connexion.");
      }
      console.error("[useAgentDashboard] Erreur:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    // Rafraîchissement automatique toutes les 60 secondes
    const interval = setInterval(fetchDashboard, 60_000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return {
    stats,
    profil,
    rapportJour,
    loading,
    error,
    refresh: fetchDashboard,
  };
}