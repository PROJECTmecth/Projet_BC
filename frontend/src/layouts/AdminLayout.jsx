// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/layouts/AdminLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Outlet }              from "react-router-dom";
import Sidebar                 from "../components/admin/Sidebar";
import Topbar                  from "../components/admin/Topbar";

export default function AdminLayout() {
  // ── collapsed = true  → sidebar icônes seules (70px)
  // ── collapsed = false → sidebar complète (280px)
  const [collapsed, setCollapsed] = useState(false);

  // Petit écran → auto-collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize(); // appel initial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F0E8]">

      {/* ── Sidebar — largeur animée ── */}
      <div
        className="h-screen sticky top-0 shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 70 : 280 }}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(prev => !prev)}
        />
      </div>

      {/* ── Zone principale ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}