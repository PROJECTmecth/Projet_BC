// src/pages/admin/GestionKiosques.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ✅ PAS de Sidebar ni Topbar ici — déjà gérés par AdminLayout
// ✅ Utilise api axios directement (même instance que les collègues)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import api from "../../lib/axios";
//import { getCsrfCookie }  from "../../services/auth";
import KiosqueCard from "../../components/admin/kiosques/KiosqueCard";
import KiosqueStatsBar from "../../components/admin/kiosques/KiosqueStatsBar";
import AjouterKiosqueCard from "../../components/admin/kiosques/AjouterKiosqueCard";
import KiosqueModal from "../../components/admin/kiosques/KiosqueModal";
import { Store } from "lucide-react";

const BASE = "/api/admin/kiosques";

export default function GestionKiosques() {
  const [kiosques, setKiosques] = useState([]);
  const [stats, setStats] = useState({ total: 0, actifs: 0, geles: 0 });
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, kiosque: null });

  // ── Animation du total ──────────────────────────────────────────────────────
  useEffect(() => {
    if (stats.total === 0) {
      setAnimatedTotal(0);
      return;
    }

    let start = 0;
    const target = stats.total;
    const duration = 1500; // 1.5s
    const increment = target / (duration / 16);

    const animate = () => {
      start += increment;
      if (start < target) {
        setAnimatedTotal(Math.ceil(start));
        requestAnimationFrame(animate);
      } else {
        setAnimatedTotal(target);
      }
    };
    requestAnimationFrame(animate);
  }, [stats.total]);

  // ── GET ─────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(BASE);
      setKiosques(res.data ?? []);
      setStats(res.stats ?? { total: 0, actifs: 0, geles: 0 });
    } catch {
      setError("Impossible de charger les kiosques.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── PATCH ───────────────────────────────────────────────────────────────────
  const handleToggle = async (id, statut_service) => {
    setKiosques((prev) =>
      prev.map((k) =>
        k.id === id
          ? { ...k, statut_service, est_actif: statut_service === "actif" }
          : k,
      ),
    );
    try {
      // ❌ await getCsrfCookie();  — retirer
      const { data: res } = await api.patch(`${BASE}/${id}/statut`, {
        statut_service,
      });
      setKiosques((prev) =>
        prev.map((k) => (k.id === id ? (res.data ?? k) : k)),
      );
      load();
    } catch {
      load();
    }
  };

  const handleSave = async (form) => {
    try {
      // ❌ await getCsrfCookie();  — retirer
      if (form.id) {
        const { data: res } = await api.put(`${BASE}/${form.id}`, form);
        setKiosques((prev) =>
          prev.map((k) => (k.id === form.id ? (res.data ?? k) : k)),
        );
      } else {
        const { data: res } = await api.post(BASE, form);
        if (res.data) setKiosques((prev) => [...prev, res.data]);
      }
      load();
    } catch (err) {
      console.error("saveKiosque:", err.response?.data ?? err);
      alert("Erreur : " + (err.response?.data?.message ?? err.message));
    }
  };
  return (
    <div>
      {/* ── Bannière orange ─────────────────────────────────────────── */}
      <div className="relative bg-[#FF6600] rounded-2xl px-8 py-7 flex items-center justify-between mb-7 overflow-hidden">
        <div className="absolute right-36 -top-5 w-24 h-24 rounded-full bg-white/[0.07]" />

        <div className="flex items-center gap-5 z-10">
          <div className="w-14 h-14 rounded-[14px] bg-white/20 flex items-center justify-center text-white">
            <Store size={28} />
          </div>
          <div>
            <h1 className="text-white text-[26px] font-black tracking-tight leading-none">
              Gestion de kiosques
            </h1>
            <p className="text-white/75 text-sm mt-1">
              Gérer et surveiller tous les points de vente
            </p>
          </div>
        </div>

        <div className="z-10 bg-white rounded-full w-[90px] h-[90px] flex flex-col items-center justify-center shadow-lg shrink-0">
          <span className="text-gray-400 text-[11px] font-semibold text-center leading-tight">
            Total
            <br />
            kiosques
          </span>
          <span className="text-[#FF6600] text-[28px] font-black leading-none">
            {String(animatedTotal).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <KiosqueStatsBar
        actifs={stats.actifs}
        geles={stats.geles}
        total={stats.total}
      />

      {/* ── Erreur ──────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-600 text-sm mb-5 flex justify-between">
          <span>⚠️ {error}</span>
          <button onClick={load} className="font-bold underline">
            Réessayer
          </button>
        </div>
      )}

      {/* ── Grille des cards ─────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          ⏳ Chargement des kiosques…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kiosques.map((k) => (
            <KiosqueCard
              key={k.id}
              kiosque={k}
              onToggle={handleToggle}
              onEdit={(k) => setModal({ open: true, kiosque: k })}
            />
          ))}
          <AjouterKiosqueCard
            onClick={() => setModal({ open: true, kiosque: null })}
          />
        </div>
      )}

      {/* ── Modal ───────────────────────────────────────────────────── */}
      <KiosqueModal
        open={modal.open}
        kiosque={modal.kiosque}
        onClose={() => setModal({ open: false, kiosque: null })}
        onSave={handleSave}
      />
    </div>
  );
}
