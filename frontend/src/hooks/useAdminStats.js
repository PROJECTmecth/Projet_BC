// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/hooks/useAdminStats.js
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import api from "../lib/axios";

const MOCK_MODE = false;

const EMPTY_STATS = {
  totalClients: 0, clientsGrowth: "+0%", totalKiosques: 0,
  kiosquesActifs: 0, kiosquesInactifs: 0, soldeTotal: "0", soldeGrowth: "+0%",
  revenus: "0", revenusBreakdown: { frais_garde: 0, penalites: 0 },
};
const EMPTY_DEMOGRAPHICS = {
  hommes: 0, femmes: 0, hommesCnt: 0, femmesCnt: 0,
  categories: [
    { label: "Commerçant",   count: 0, color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Ménagère",     count: 0, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Travailleurs", count: 0, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Étudiants",    count: 0, color: "text-green-600",  bg: "bg-green-50"  },
  ],
};
const EMPTY_MONTHLY = [
  { month: "Jan", clients: 0 }, { month: "Fév", clients: 0 },
  { month: "Mar", clients: 0 }, { month: "Avr", clients: 0 },
  { month: "Mai", clients: 0 }, { month: "Juin", clients: 0 },
  { month: "Juil", clients: 0 }, { month: "Aoû", clients: 0 },
  { month: "Sep", clients: 0 }, { month: "Oct", clients: 0 },
  { month: "Nov", clients: 0 }, { month: "Déc", clients: 0 },
];
const MONTH_EN_TO_FR = {
  'Jan':'Jan','Feb':'Fév','Mar':'Mar','Apr':'Avr','May':'Mai','Jun':'Juin',
  'Jul':'Juil','Aug':'Aoû','Sep':'Sep','Oct':'Oct','Nov':'Nov','Dec':'Déc',
};

function formatMonthForChart(m) { return MONTH_EN_TO_FR[m] ?? m ?? 'Inconnu'; }

const TYPE_LABELS = {
  'dépôt_cash': 'Dépôt', 'retrait_partiel': 'Retrait', 'retrait_solde_compte': 'Retrait',
};

function mapOperations(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(t => ({
    id:      t.id_trans,
    carte:   t.id_carte   ?? '-',
    client:  t.nom_client ?? '-',
    type:    TYPE_LABELS[t.type_op] ?? t.type_op,
    montant: Number(t.montant).toLocaleString('fr-FR'),
    date:    t.date_heure ? new Date(t.date_heure).toLocaleDateString('fr-FR') : '-',
    agent:   t.nom_agent  ?? '-',
  }));
}

export function useAdminStats() {
  const [stats,         setStats]         = useState(null);
  const [demographics,  setDemographics]  = useState(null);
  const [monthly,       setMonthly]       = useState([]);
  const [operations,    setOperations]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [lastUpdated,   setLastUpdated]   = useState(null);
  const [refreshingOps, setRefreshingOps] = useState(false);

  // Rafraîchissement léger des opérations (polling + bouton manuel)
  const refreshOperations = useCallback(async () => {
    setRefreshingOps(true);
    try {
      const res = await api.get("/api/admin/mouvements-caisse");
      const raw = res.data?.transactions ?? res.data?.data ?? res.data ?? [];
      setOperations(mapOperations(raw));
      setLastUpdated(new Date());
    } catch { /* silent */ } finally {
      setRefreshingOps(false);
    }
  }, []);

  // Chargement initial complet
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true); setError(null);
      try {
        if (MOCK_MODE) {
          await new Promise(r => setTimeout(r, 300));
          setStats(EMPTY_STATS); setDemographics(EMPTY_DEMOGRAPHICS);
          setMonthly(EMPTY_MONTHLY); setOperations([]); setLastUpdated(new Date());
          return;
        }

        const [clientsRes, kiosquesRes, revenusRes, analyticsRes, opsRes] = await Promise.allSettled([
          api.get("/api/admin/clients"),
          api.get("/api/admin/kiosques"),
          api.get("/api/admin/mouvements-caisse/revenus"),
          api.get("/api/admin/clients/analytics"),
          api.get("/api/admin/mouvements-caisse"),
        ]);

        const currentStats = {
          totalClients: (function() {
            if (clientsRes.status !== 'fulfilled') return 0;
            const d = clientsRes.value.data;
            if (typeof d?.total === 'number') return d.total;
            if (typeof d?.data?.total === 'number') return d.data.total;
            if (Array.isArray(d?.data?.clients)) return d.data.clients.length;
            if (Array.isArray(d?.data)) return d.data.length;
            if (Array.isArray(d)) return d.length;
            return 0;
          })(),
          clientsGrowth: "+0%",
          totalKiosques:    kiosquesRes.status === 'fulfilled' ? (kiosquesRes.value.data?.stats?.total  ?? 0) : 0,
          kiosquesActifs:   kiosquesRes.status === 'fulfilled' ? (kiosquesRes.value.data?.stats?.actifs ?? 0) : 0,
          kiosquesInactifs: kiosquesRes.status === 'fulfilled' ? (kiosquesRes.value.data?.stats?.geles  ?? 0) : 0,
          soldeTotal: (function() {
            if (opsRes.status !== 'fulfilled') return "0";
            return Number(opsRes.value.data?.totaux?.total_solde ?? 0).toLocaleString('fr-FR');
          })(),
          soldeGrowth: "+0%",
          revenus: revenusRes.status === 'fulfilled' ? String(revenusRes.value.data?.data?.total ?? 0) : "0",
          revenusBreakdown: revenusRes.status === 'fulfilled'
            ? (revenusRes.value.data?.data?.breakdown ?? { frais_garde: 0, penalites: 0 })
            : { frais_garde: 0, penalites: 0 },
        };

        let demoData = EMPTY_DEMOGRAPHICS, monthlyData = EMPTY_MONTHLY;
        if (analyticsRes.status === 'fulfilled') {
          const ad = analyticsRes.value.data;
          if (ad?.data?.demographics) demoData = ad.data.demographics;
          if (Array.isArray(ad?.data?.monthly) && ad.data.monthly.length > 0) {
            monthlyData = ad.data.monthly.map(item => ({
              month:   formatMonthForChart(item?.month ?? item?.mois ?? item?.label),
              clients: typeof item?.clients === 'number' ? item.clients : Number(item?.count ?? item?.total ?? 0) || 0,
            }));
          }
        }

        if (monthlyData.length >= 2) {
          const cur = monthlyData[monthlyData.length - 1].clients;
          const prv = monthlyData[monthlyData.length - 2].clients;
          if (prv > 0) {
            const pct = Math.round(((cur - prv) / prv) * 100);
            currentStats.clientsGrowth = pct >= 0 ? `+${pct}%` : `${pct}%`;
          } else if (cur > 0) currentStats.clientsGrowth = "+100%";
        }

        const raw = opsRes.status === 'fulfilled'
          ? (opsRes.value.data?.transactions ?? opsRes.value.data?.data ?? opsRes.value.data ?? [])
          : [];

        setStats(currentStats); setDemographics(demoData); setMonthly(monthlyData);
        setOperations(mapOperations(raw)); setLastUpdated(new Date());

      } catch (err) {
        console.error("[useAdminStats]", err);
        setError("Certaines données n'ont pas pu être chargées");
        setStats(EMPTY_STATS); setDemographics(EMPTY_DEMOGRAPHICS);
        setMonthly(EMPTY_MONTHLY); setOperations([]);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  // Polling automatique toutes les 30s
  useEffect(() => {
    const interval = setInterval(refreshOperations, 30000);
    return () => clearInterval(interval);
  }, [refreshOperations]);

  return { stats, demographics, monthly, operations, loading, error, lastUpdated, refreshingOps, refreshOperations };
}
