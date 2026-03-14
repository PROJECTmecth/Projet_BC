// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/layouts/AdminLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { Outlet } from "react-router-dom";
import Sidebar    from "../components/admin/Sidebar";
import Topbar     from "../components/admin/Topbar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F0E8]">

      {/* ── Sidebar fixe — ne scroll pas ─────────────────────────────── */}
      <div className="h-screen sticky top-0 shrink-0">
        <Sidebar />
      </div>

      {/* ── Zone principale — scroll uniquement ici ───────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Topbar sticky en haut */}
        <Topbar />

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}