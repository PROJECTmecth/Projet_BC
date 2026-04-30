// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/pages/admin/AdminDashboardPage.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// import useAdminStats from "../../hooks/useAdminStats"; // ← COMMENTÉ TEMPORAIREMENT
const useAdminStats = () => ({ data: null, loading: false }); // ← MOCK TEMPORAIRE
import StatCard from "../../components/admin/StatCard";
import OperationsTable from "../../components/admin/OperationsTable";

// ── Icônes SVG ────────────────────────────────────────────────────────────────
const IcoUsers = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IcoStore = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IcoTrendUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const IcoTrendDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
  </svg>
);
const IcoChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { stats, demographics, monthly, operations, loading, error } = useAdminStats();

  const [showClientsDetail, setShowClientsDetail] = useState(false);
  const [showKiosquesDetail, setShowKiosquesDetail] = useState(false);
  const [animatedTotalKiosques, setAnimatedTotalKiosques] = useState(0);

  // ── Animation du total kiosques ──────────────────────────────────────────────
  useEffect(() => {
    if (!stats?.totalKiosques || loading) {
      setAnimatedTotalKiosques(0);
      return;
    }

    let start = 0;
    const target = stats.totalKiosques;
    const duration = 1500; // 1.5s
    const increment = target / (duration / 16);

    const animate = () => {
      start += increment;
      if (start < target) {
        setAnimatedTotalKiosques(Math.ceil(start));
        requestAnimationFrame(animate);
      } else {
        setAnimatedTotalKiosques(target);
      }
    };
    requestAnimationFrame(animate);
  }, [stats?.totalKiosques, loading]);

  // ── État d'erreur ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-600 font-semibold text-lg mb-2">⚠️ Erreur de chargement</p>
          <p className="text-red-500 text-sm">{error}</p>
          <p className="text-gray-400 text-xs mt-3">
            Vérifiez que le backend Laravel tourne sur le port 8000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">

      {/* ══ 1. TITRE ════════════════════════════════════════════════════════ */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-500 mt-1 text-sm">Vue d'ensemble de l'activité du système</p>
      </div>

      {/* ══ 2. CARTES STATS : 2 par ligne ═══════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Carte Clients ── */}
        <div
          className="relative"
          onMouseEnter={() => setShowClientsDetail(true)}
          onMouseLeave={() => setShowClientsDetail(false)}
        >
          <StatCard
            title="Nombre total clients"
            value={loading ? "..." : stats?.totalClients}
            subtitle={
              <span className="flex items-center gap-1">
                <IcoTrendUp /> {stats?.clientsGrowth}
              </span>
            }
            gradient="from-blue-500 via-blue-500 to-cyan-500"
            textColor="text-blue-100"
            icon={<IcoUsers />}
            onClick={() => navigate("/admin/clients")}
          />

          {/* Dropdown glassmorphic au hover */}
          {showClientsDetail && !loading && (
            <div
              className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl p-5 shadow-xl"
              style={{
                background: "rgba(255,255,255,0.90)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-1.5 rounded-lg">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Hommes</span>
                  </div>
                  <span className="text-2xl font-bold text-indigo-600">{demographics?.hommesCnt}</span>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-pink-100 p-1.5 rounded-lg">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Femmes</span>
                  </div>
                  <span className="text-2xl font-bold text-pink-600">{demographics?.femmesCnt}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Carte Kiosques ── */}
        <div
          className="relative"
          onMouseEnter={() => setShowKiosquesDetail(true)}
          onMouseLeave={() => setShowKiosquesDetail(false)}
        >
          <StatCard
            title="Nombre total kiosque"
            value={loading ? "..." : animatedTotalKiosques}
            subtitle="Points de vente"
            gradient="from-orange-500 via-orange-500 to-yellow-500"
            textColor="text-orange-100"
            icon={<IcoStore />}
            onClick={() => navigate("/admin/kiosques")}
          />

          {/* Dropdown kiosques */}
          {showKiosquesDetail && !loading && (
            <div
              className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl p-5 shadow-xl"
              style={{
                background: "rgba(255,255,255,0.90)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1.5 rounded-lg">
                      <IcoTrendUp />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Kiosques actifs</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{stats?.kiosquesActifs}</span>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-1.5 rounded-lg">
                      <IcoTrendDown />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Kiosques inactifs</span>
                  </div>
                  <span className="text-2xl font-bold text-red-500">{stats?.kiosquesInactifs}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Carte Solde total ── */}
        <StatCard
          title="Solde de tout compte"
          value={loading ? "..." : `${stats?.soldeTotal} F`}
          subtitle={
            <span className="flex items-center gap-1">
              <IcoTrendUp /> {stats?.soldeGrowth}
            </span>
          }
          subtitleExtra="Comptes actifs uniquement"
          gradient="from-green-500 to-green-600"
          textColor="text-green-100"
        />

        {/* ── Carte Revenus ── */}
        <StatCard
          title="Revenus encaissés"
          value={loading ? "..." : `${stats?.revenus} F`}
          subtitle={<span className="flex items-center gap-1"><IcoTrendUp /> Ce mois</span>}
          gradient="from-yellow-500 to-yellow-600"
          textColor="text-yellow-100"
          onClick={() => navigate("/admin/revenus")}
        >
          <p className="text-yellow-100 text-xs mt-3 flex items-center gap-1">
            <span>Cliquez pour voir les détails</span>
            <IcoChevronRight />
          </p>
        </StatCard>
      </div>

      {/* ══ 4. GRAPHIQUES ════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── BarChart : Enregistrement clients ── */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Enregistrement des clients</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthly} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                    cursor={{ fill: "rgba(59,130,246,0.06)" }}
                  />
                  <Bar dataKey="clients" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Répartition démographique ── */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Répartition démographique</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">

                {/* Barres Hommes / Femmes */}
                {[
                  { label: "Hommes", pct: demographics?.hommes, color: "bg-indigo-500" },
                  { label: "Femmes", pct: demographics?.femmes, color: "bg-pink-500" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <span className="text-sm font-bold text-gray-900">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${color} h-3 rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}

                {/* Grille par catégorie */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm">Par catégorie</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {demographics?.categories?.map(({ label, count, color, bg }) => (
                      <div key={label} className={`${bg} p-3 rounded-xl`}>
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className={`text-xl font-bold ${color}`}>{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ 5. TABLEAU OPÉRATIONS RÉCENTES ══════════════════════════════════ */}
      <OperationsTable operations={operations} loading={loading} />

    </div>
  );
}