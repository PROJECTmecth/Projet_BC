// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/App.jsx
// NE PAS MÉLANGER LES SECTIONS — chaque dev travaille dans sa section
// ─────────────────────────────────────────────────────────────────────────────

import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage          from "./pages/auth/LoginPage.jsx";
import AdminLayout        from "./layouts/AdminLayout.jsx";
import RequireAuth        from "./components/RequireAuth.jsx";

// =============================================
// IMPORTS ADMIN PART 1 — Dev 1 mechack_rosca
// =============================================
import AdminDashboardPage      from "./pages/admin/AdminDashboardPage.jsx";
import GestionCartesPage       from "./pages/admin/GestionCartesPage.jsx";
import ProfilAdminPage         from "./pages/admin/ProfilAdminPage.jsx";
import JournalTransactionsPage from "./pages/admin/JournalTransactionsPage.jsx";

// =============================================
// IMPORTS ADMIN PART 2 — Dev 3 Djenna — NE PAS TOUCHER
// =============================================
import GestionKiosques from "./pages/admin/GestionKiosques.jsx";
import KiosqueDetail   from "./pages/admin/KiosqueDetail.jsx";
import GestionAgents   from "./pages/admin/GestionAgents.jsx";

// =============================================
// IMPORTS AGENT — Dev 3 ethane — NE PAS TOUCHER
// =============================================
import AgentLayout        from "./layouts/AgentLayout.jsx";
import AgentDashboardPage from "./pages/agent/AgentDashboardPage.jsx";

export default function App() {
  return (
    <Routes>

      {/* Routes publiques */}
      <Route path="/"      element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* =============================================
          ZONE AGENT — Dev 3 ethane — NE PAS TOUCHER
          ============================================= */}
      <Route path="/agent" element={
        <RequireAuth role="agent">
          <AgentLayout />
        </RequireAuth>
      }>
        <Route index element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="dashboard" element={<AgentDashboardPage />} />
      </Route>

      {/* =============================================
          ZONE ADMIN
          ============================================= */}
      <Route path="/admin" element={
        <RequireAuth role="admin">
          <AdminLayout />
        </RequireAuth>
      }>
        {/* ROUTES ADMIN PART 1 — Dev 1 mechack_rosca */}
        <Route index               element={<AdminDashboardPage />} />
        <Route path="cartes"       element={<GestionCartesPage />} />
        <Route path="profil"       element={<ProfilAdminPage />} />
        <Route path="transactions" element={<JournalTransactionsPage />} />

        {/* ROUTES ADMIN PART 2 — Dev 3 Djenna — NE PAS TOUCHER */}
        <Route path="kiosques"     element={<GestionKiosques />} />
        <Route path="kiosques/:id" element={<KiosqueDetail />} />
        <Route path="agents"       element={<GestionAgents />} />
      </Route>

    </Routes>
  );
}