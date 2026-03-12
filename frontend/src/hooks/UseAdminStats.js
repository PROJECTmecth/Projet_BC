// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/hooks/useAdminStats.js
//
// Hook React pour récupérer les statistiques du tableau de bord Admin.
//
// ── COMMENT CONNECTER AU VRAI BACKEND ────────────────────────────────────────
// Tes collègues devront exposer ces endpoints Laravel :
//
//   GET /api/admin/stats        → { clients, kiosques, solde, revenus, depenses }
//   GET /api/admin/demographics → { hommes, femmes, categories }
//   GET /api/admin/monthly      → [{ month, clients }]
//   GET /api/admin/operations   → [{ id, carte, client, type, montant, date, agent }]
//
// Pour l'instant : données mock. Pour passer au vrai backend, remplacer
// MOCK_MODE = false et décommenter les appels axios.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
// import api from "../lib/axios"; // ← décommenter en production

const MOCK_MODE = true; // ← passer à false quand le backend est prêt

// ── Données mock (à supprimer quand le backend est connecté) ─────────────────
const MOCK_STATS = {
  totalClients  : 248,
  clientsGrowth : "+12% ce mois",
  totalKiosques : 12,
  kiosquesActifs: 5,
  kiosquesInactifs: 7,
  soldeTotal    : "2,450,000",
  soldeGrowth   : "+8.5% vs mois dernier",
  revenus       : "456,000",
  depenses      : "125,000",
};

const MOCK_DEMOGRAPHICS = {
  hommes   : 58,
  femmes   : 42,
  hommesCnt: 145,
  femmesCnt: 103,
  categories: [
    { label: "Commerçant", count: 78,  color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Ménagère",   count: 62,  color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Travailleurs",count: 63, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Étudiants",  count: 45,  color: "text-green-600",  bg: "bg-green-50"  },
  ],
};

const MOCK_MONTHLY = [
  { month: "Jan",  clients: 40 },
  { month: "Fév",  clients: 55 },
  { month: "Mar",  clients: 48 },
  { month: "Avr",  clients: 65 },
  { month: "Mai",  clients: 58 },
  { month: "Juin", clients: 72 },
  { month: "Juil", clients: 68 },
];

const MOCK_OPERATIONS = [
  { id: 1, carte: "CPN 01", client: "MADOUGAMA Eric",    type: "Dépôt",  montant: "2,000",  date: "28/02/2026", agent: "MABALA" },
  { id: 2, carte: "CPN 02", client: "MBOUNGOU Ive",      type: "Retrait",montant: "5,000",  date: "28/02/2026", agent: "JOHANN" },
  { id: 3, carte: "CPN 03", client: "BOUNGOU Charlotte", type: "Dépôt",  montant: "3,000",  date: "28/02/2026", agent: "MABALA" },
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
          // ── MODE MOCK : délai simulé ────────────────────────────────────
          await new Promise(r => setTimeout(r, 600));
          setStats(MOCK_STATS);
          setDemographics(MOCK_DEMOGRAPHICS);
          setMonthly(MOCK_MONTHLY);
          setOperations(MOCK_OPERATIONS);
        } else {
          // ── MODE PRODUCTION : appels vrais Laravel ─────────────────────
          // Remplacer par les vrais endpoints de tes collègues :
          //
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