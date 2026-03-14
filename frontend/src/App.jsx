// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage          from "./pages/auth/LoginPage.jsx";
import Dashboard          from "./pages/Dashboard.jsx";
import AdminLayout        from "./layouts/AdminLayout.jsx";
import RequireAuth        from "./components/RequireAuth.jsx";

// =============================================
// IMPORTS ADMIN PART 1 — Dev 1 mechack_rosca
// =============================================
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import GestionCartesPage  from "./pages/admin/GestionCartesPage.jsx";
import ProfilAdminPage    from "./pages/admin/ProfilAdminPage.jsx";
// import JournalTransactionsPage from "./pages/admin/JournalTransactionsPage.jsx";

// =============================================
// IMPORTS ADMIN PART 2 — Dev 2 — NE PAS TOUCHER
// =============================================
// import GestionAgentsPage   from "./pages/admin/GestionAgentsPage.jsx";
// import GestionKiosquesPage from "./pages/admin/GestionKiosquesPage.jsx";
// import RapportsPage        from "./pages/admin/RapportsPage.jsx";

// =============================================
// IMPORTS AGENT + CLIENT — Dev 3 — NE PAS TOUCHER
// =============================================
// import AgentDashboardPage  from "./pages/agent/AgentDashboardPage.jsx";
// import ScannerCartePage    from "./pages/agent/ScannerCartePage.jsx";

export default function App() {
  return (
    <Routes>

      {/* Routes publiques */}
      <Route path="/"      element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard agent */}
      <Route path="/dashboard" element={
        <RequireAuth role="agent">
          <Dashboard />
        </RequireAuth>
      } />

      {/* Zone admin */}
      <Route path="/admin" element={
        <RequireAuth role="admin">
          <AdminLayout />
        </RequireAuth>
      }>

        {/* =============================================
            ROUTES ADMIN PART 1 — Dev 1 mechack_rosca
            ============================================= */}
        <Route index               element={<AdminDashboardPage />} />
        <Route path="cartes"       element={<GestionCartesPage />} />
        <Route path="profil"       element={<ProfilAdminPage />} />
        {/* <Route path="transactions" element={<JournalTransactionsPage />} /> */}

        {/* =============================================
            ROUTES ADMIN PART 2 — Dev 2 — NE PAS TOUCHER
            ============================================= */}
        {/* <Route path="agents"   element={<GestionAgentsPage />} /> */}
        {/* <Route path="kiosques" element={<GestionKiosquesPage />} /> */}

        {/* =============================================
            ROUTES AGENT + CLIENT — Dev 3 — NE PAS TOUCHER
            ============================================= */}
        {/* <Route path="agent/dashboard" element={<AgentDashboardPage />} /> */}

      </Route>
    </Routes>
  );
}