// src/pages/admin/GestionClients.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ✅ PAS de Sidebar ni Topbar ici — déjà gérés par AdminLayout
// Ce composant est rendu dans le <Outlet /> de AdminLayout
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import ClientRow          from "../../components/admin/clients/ClientRow";
import ClientDetailModal  from "../../components/admin/clients/ClientDetailModal";

// ── API ───────────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const h   = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const clientApi = {
  getAll: (qs = "") =>
    fetch(`${API}/clients${qs}`, { headers: h() }).then(r => r.json()),
};

// ── Colonnes — identiques à la maquette ──────────────────────────────────────
const COLS = [
  "NO.", "GENRE", "NOM & PRÉNOM", "ADRESSE",
  "NATIONALITÉ", "PIÈCE ID", "NO. PIÈCE", "ACTIVITÉ", "TÉL.", "DÉTAILS",
];

export default function GestionClients() {
  const [clients, setClients] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [detail,  setDetail]  = useState(null);

  // ── Chargement ──────────────────────────────────────────────────────────────
  const load = useCallback(async (q = "") => {
    setLoading(true); setError(null);
    try {
      const qs  = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await clientApi.getAll(qs);
      setClients(res.data ?? []);
      setTotal(res.stats?.total ?? res.data?.length ?? 0);
    } catch {
      setError("Impossible de charger les clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Debounce recherche
  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search, load]);

  const handlePrint = () => window.print();
  const handlePDF   = () => alert("Export PDF — à brancher avec jsPDF");
  const handleExcel = () => alert("Export Excel — à brancher avec SheetJS");

  return (
    <div>

      {/* ── Bannière sombre ─────────────────────────────────────────── */}
      <div className="relative bg-[#1e2a3a] rounded-2xl px-8 py-7 flex items-center justify-between mb-7 overflow-hidden">
        <div className="absolute right-40 -top-6 w-28 h-28 rounded-full bg-white/[0.04]" />

        <div className="flex items-center gap-5 z-10">
          <div className="w-14 h-14 rounded-[14px] bg-white/10 flex items-center justify-center text-[28px]">
            👤
          </div>
          <div>
            <h1 className="text-white text-[26px] font-black tracking-tight leading-none">
              Gestion de clients
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Base de données complète des clients
            </p>
          </div>
        </div>

        <div className="z-10 bg-white rounded-full w-[90px] h-[90px] flex flex-col items-center justify-center shadow-lg shrink-0">
          <span className="text-gray-400 text-[11px] font-semibold text-center leading-tight">
            Total<br />clients
          </span>
          <span className="text-[#1e2a3a] text-[28px] font-black leading-none">
            {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── Barre recherche + exports ────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative max-w-[420px] flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Recherche du nom, téléphone ou compte..."
            className="w-full pl-10 pr-4 py-[10px] bg-gray-100 rounded-xl text-[13px] text-gray-700 outline-none border-2 border-transparent focus:border-[#1e2a3a] transition-colors placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <BtnExport label="Imprimer" icon="🖨️" color="border-blue-300 text-blue-600 hover:bg-blue-50"   onClick={handlePrint} />
          <BtnExport label="PDF"      icon="📄" color="border-red-300 text-red-500 hover:bg-red-50"     onClick={handlePDF} />
          <BtnExport label="Excel"    icon="📊" color="border-green-300 text-green-600 hover:bg-green-50" onClick={handleExcel} />
        </div>
      </div>

      {/* ── Erreur ──────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-600 text-sm mb-5 flex justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => load(search)} className="font-bold underline">Réessayer</button>
        </div>
      )}

      {/* ── Tableau ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1e2a3a]">
                {COLS.map(col => (
                  <th key={col} className="px-4 py-4 text-left text-[11px] font-bold text-white/70 uppercase tracking-[0.08em] whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={COLS.length} className="text-center py-16 text-gray-400 text-sm">⏳ Chargement…</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={COLS.length} className="text-center py-16 text-gray-400 text-sm">Aucun client trouvé</td></tr>
              ) : (
                clients.map((c, i) => (
                  <ClientRow key={c.id} index={i + 1} client={c} onDetail={setDetail} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal détail ────────────────────────────────────────────── */}
      <ClientDetailModal client={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function BtnExport({ label, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={["flex items-center gap-2 px-4 py-[9px] rounded-xl border-2 text-[13px] font-semibold transition-colors", color].join(" ")}
    >
      <span>{icon}</span><span>{label}</span>
    </button>
  );
}