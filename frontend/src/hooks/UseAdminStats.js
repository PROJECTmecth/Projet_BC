// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/hooks/useAdminStats.js
//
// ⚠️  DONNÉES — À brancher sur l'API quand les collègues seront prêts
//
// Endpoints attendus :
//   GET /api/admin/stats        → { totalClients, clientsGrowth, totalKiosques,
//                                    kiosquesActifs, kiosquesInactifs,
//                                    soldeTotal, soldeGrowth, revenus }
//   GET /api/admin/demographics → { hommes, femmes, hommesCnt, femmesCnt, categories }
//   GET /api/admin/monthly      → [{ month, clients }]
//   GET /api/admin/operations   → [{ id, carte, client, type, montant, date, agent }]
//
// Pour brancher : passer MOCK_MODE = false et décommenter les appels axios
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import api from "../lib/axios"; // ← prêt pour la production

const MOCK_MODE = true; // ← passer à false quand le backend est prêt

// ─────────────────────────────────────────────────────────────────────────────
// Valeurs à zéro — terrain prêt pour les vraies données
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_STATS = {
  totalClients     : 0,
  clientsGrowth    : "+0%",
  totalKiosques    : 0,
  kiosquesActifs   : 0,
  kiosquesInactifs : 0,
  soldeTotal       : "0",
  soldeGrowth      : "+0%",
  revenus          : "0",
};

const EMPTY_DEMOGRAPHICS = {
  hommes    : 0,
  femmes    : 0,
  hommesCnt : 0,
  femmesCnt : 0,
  categories: [
    { label: "Commerçant",   count: 0, color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Ménagère",     count: 0, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Travailleurs", count: 0, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Étudiants",    count: 0, color: "text-green-600",  bg: "bg-green-50"  },
  ],
};

const EMPTY_MONTHLY = [
  { month: "Jan",  clients: 0 },
  { month: "Fév",  clients: 0 },
  { month: "Mar",  clients: 0 },
  { month: "Avr",  clients: 0 },
  { month: "Mai",  clients: 0 },
  { month: "Juin", clients: 0 },
  { month: "Juil", clients: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
export function useAdminStats() {
  const [stats,        setStats]        = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [monthly,      setMonthly]      = useState([]);
  const [operations,   setOperations]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        if (MOCK_MODE) {
          // ── MODE MOCK : données à zéro en attendant l'API ──────────────────
          await new Promise(r => setTimeout(r, 400));
          
          let currentStats = { ...EMPTY_STATS };
          try {
            // Le client souhaite que les infos des kiosques soient dynamiques dès maintenant
            const { data: res } = await api.get("/api/admin/kiosques");
            if (res && res.stats) {
              currentStats.totalKiosques = res.stats.total || 0;
              currentStats.kiosquesActifs = res.stats.actifs || 0;
              currentStats.kiosquesInactifs = res.stats.geles || 0;
            }
          } catch (e) {
            console.error("Impossible de fetcher les kiosques pour le dashboard:", e);
          }

          setStats(currentStats);
          setDemographics(EMPTY_DEMOGRAPHICS);
          setMonthly(EMPTY_MONTHLY);
          setOperations([]); // tableau vide — pas de données encore
        } else {
          // ── MODE PRODUCTION : décommenter quand les collègues ont livré ────
          // const [s, d, m, o] = await Promise.all([
          //   api.get("/api/admin/stats"),
          //   api.get("/api/admin/demographics"),
          //   api.get("/api/admin/monthly"),
          //   api.get("/api/admin/operations"),
          // ]);
          // setStats(s.data);
          // setDemographics(d.data);
          // setMonthly(m.data);
          // setOperations(o.data);
        }
      } catch (err) {
        setError("Impossible de charger les données. Vérifiez le backend.");
        console.error("[useAdminStats]", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { stats, demographics, monthly, operations, loading, error };
}