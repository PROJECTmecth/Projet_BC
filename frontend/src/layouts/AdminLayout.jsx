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
  const [isMobile, setIsMobile] = useState(false);

  // Petit écran → auto-collapse et verrouillage
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // Seuil de 1024px
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize(); // appel initial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fonction pour basculer l'état (verrouillée sur mobile)
  const handleToggle = () => {
    if (isMobile) return; // Ne fait rien si on est sur mobile
    setCollapsed(prev => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F0E8]">

      {/* ── Sidebar — largeur animée ── */}
      <div
        className="h-screen sticky top-0 shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 70 : 280 }}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={handleToggle}
          isMobile={isMobile}
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