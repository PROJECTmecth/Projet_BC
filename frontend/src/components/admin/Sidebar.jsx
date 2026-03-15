// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/Sidebar.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink, useLocation } from "react-router-dom";

// ── Icônes SVG ────────────────────────────────────────────────────────────────
const IcoDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IcoKiosque = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IcoClients = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IcoCartes = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IcoJournal = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IcoCaisse = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);

// ── Icône toggle (chevron gauche / droit) ─────────────────────────────────────
const IcoChevron = ({ collapsed }) => (
  <svg
    width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    style={{
      transition: "transform 0.3s",
      transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
    }}
  >
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

// ── Items de navigation ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Accueil",                  path: "/admin",              icon: IcoDashboard, exact: true },
  { label: "Gestion des kiosques",     path: "/admin/kiosques",     icon: IcoKiosque               },
  { label: "Gestion des clients",      path: "/admin/clients",      icon: IcoClients               },
  { label: "Gestion des cartes",       path: "/admin/cartes",       icon: IcoCartes                },
  { label: "Journal des transactions", path: "/admin/transactions", icon: IcoJournal               },
  { label: "Mouvement de caisse",      path: "/admin/caisse",       icon: IcoCaisse                },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed = false, onToggle }) {
  const { pathname } = useLocation();

  const isActive = (item) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path);

  return (
    <aside
      className="h-full bg-[#FF6600] flex flex-col shadow-2xl overflow-hidden"
      style={{ width: collapsed ? 70 : 280, transition: "width 0.3s ease" }}
    >

      {/* ── Logo + bouton toggle ───────────────────────────────────────────── */}
      <div
        className="flex items-center px-4 pt-7 pb-3 cursor-pointer select-none"
        style={{ justifyContent: collapsed ? "center" : "space-between" }}
        onClick={onToggle}
        title={collapsed ? "Agrandir la sidebar" : "Réduire la sidebar"}
      >
        {/* Icône poisson — toujours visible */}
        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg shrink-0">
          <span className="text-2xl">🐟</span>
        </div>

        {/* Texte BOMBA CASH — masqué si collapsed */}
        {!collapsed && (
          <span className="font-black text-[19px] leading-tight flex-1 ml-3">
            <span className="text-white">BOMBA </span>
            <span className="text-green-300">CASH</span>
          </span>
        )}

        {/* Chevron toggle — masqué si collapsed */}
        {!collapsed && (
          <span className="text-white/80 shrink-0">
            <IcoChevron collapsed={collapsed} />
          </span>
        )}
      </div>

      {/* ── Label MANAGE — masqué si collapsed ────────────────────────────── */}
      {!collapsed && (
        <p className="text-[11px] font-bold text-orange-200 uppercase tracking-[0.18em] px-5 mb-2">
          MANAGE
        </p>
      )}

      {/* ── Séparateur ────────────────────────────────────────────────────── */}
      <div className="mx-4 border-t border-white/25 mb-2" />

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-1 flex flex-col gap-[3px] overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon   = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              title={collapsed ? item.label : ""}  // tooltip si collapsed
              className={[
                "flex items-center rounded-xl",
                "text-[13.5px] font-semibold transition-all duration-150 select-none",
                collapsed ? "justify-center px-0 py-[11px]" : "gap-3 px-4 py-[11px]",
                active
                  ? "bg-white text-[#FF6600] shadow-md"
                  : "text-white hover:bg-white/20",
              ].join(" ")}
            >
              {/* Icône — toujours visible */}
              <span className={`shrink-0 ${active ? "text-[#FF6600]" : "text-white/90"}`}>
                <Icon />
              </span>

              {/* Label — masqué si collapsed */}
              {!collapsed && (
                <span className="flex-1">{item.label}</span>
              )}

              {/* Chevron actif — masqué si collapsed */}
              {!collapsed && active && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="text-[#FF6600] shrink-0">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="px-4 pb-6 mt-auto">
        <div className="border-t border-white/20 mb-4" />
        {collapsed ? (
          /* Petit point si collapsed */
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-orange-200/50" />
          </div>
        ) : (
          <p className="text-[11px] text-orange-200/60 text-center">
            Johann Finance SA © 2026
          </p>
        )}
      </div>

    </aside>
  );
}