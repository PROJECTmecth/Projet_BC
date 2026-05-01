import { useState, useEffect } from "react";
import axiosClient from "../lib/axios";

export function useAdminStats() {
  const [data, setData] = useState({
    stats: {
      totalClients: 0,
      clientsGrowth: "0%",
      totalKiosques: 0,
      kiosquesActifs: 0,
      kiosquesInactifs: 0,
      soldeTotal: 0,
      soldeGrowth: "0%",
      revenus: 0,
    },
    demographics: {
      hommesCnt: 0,
      femmesCnt: 0,
      hommes: 0,
      femmes: 0,
      categories: [],
    },
    monthly: [],
    operations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get("/api/admin/dashboard");
        setData(response.data.data || response.data);
        setError(null);
      } catch (err) {
        console.error("Erreur stats admin:", err);
        setError(err.response?.data?.message || "Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return {
    ...data,
    loading,
    error,
  };
}