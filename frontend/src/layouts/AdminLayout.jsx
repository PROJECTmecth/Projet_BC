// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/layouts/AdminLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Outlet }              from "react-router-dom";
import Sidebar                 from "../components/admin/Sidebar";
import Topbar                  from "../components/admin/Topbar";

export default function AdminLayout() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) { setCollapsed(true); setMobileOpen(false); }
      else         { setCollapsed(false); setMobileOpen(false); }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = () => {
    if (isMobile) return;
    setCollapsed(prev => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F0E8]">

      {/* Overlay sombre derrière le drawer mobile */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar desktop — sticky */}
      {!isMobile && (
        <div
          className="h-screen sticky top-0 shrink-0 transition-all duration-300"
          style={{ width: collapsed ? 70 : 280 }}
        >
          <Sidebar
            collapsed={collapsed}
            onToggle={handleToggle}
            isMobile={false}
            onClose={() => {}}
          />
        </div>
      )}

      {/* Sidebar mobile — drawer overlay */}
      {isMobile && (
        <div
          className="fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out"
          style={{ width: 280, transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}
        >
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            isMobile={true}
            onClose={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Zone principale */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar isMobile={isMobile} onMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
