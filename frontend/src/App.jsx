import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage             from "./pages/auth/LoginPage.jsx";
import AdminLayout           from "./layouts/AdminLayout.jsx";
import AdminDashboardPage    from "./pages/admin/AdminDashboardPage.jsx";
import RequireAuth           from "./components/RequireAuth.jsx";

// =============================================
// ROUTES AGENT — Dev 1 — NE PAS TOUCHER
// =============================================
import AgentLayout           from "./layouts/AgentLayout.jsx";
import AgentDashboardPage    from "./pages/agent/AgentDashboardPage.jsx";
import MesClientsPage        from "./pages/agent/MesClientsPage.jsx";
import ProfilClientPage      from "./pages/agent/ProfilClientPage.jsx";
import AjouterOperationPage  from "./pages/agent/AjouterOperationPage.jsx";
import HistoriquePage        from "./pages/agent/HistoriquePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* =============================================
          ZONE AGENT — protégée, role agent obligatoire
          ============================================= */}
      <Route path="/agent" element={
        <RequireAuth role="agent">
          <AgentLayout />
        </RequireAuth>
      }>
        <Route index element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="dashboard"               element={<AgentDashboardPage />} />
        <Route path="clients"                 element={<MesClientsPage />} />
        <Route path="clients/:id"             element={<ProfilClientPage />} />
        <Route path="clients/:id/operation"   element={<AjouterOperationPage />} />
        <Route path="historique"              element={<HistoriquePage />} />
      </Route>

      {/* =============================================
          ZONE ADMIN — protégée, role admin obligatoire
          ============================================= */}
      <Route path="/admin" element={
        <RequireAuth role="admin">
          <AdminLayout />
        </RequireAuth>
      }>
        <Route index element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  );
}