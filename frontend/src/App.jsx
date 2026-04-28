// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/App.jsx
// NE PAS MÉLANGER LES SECTIONS — chaque dev travaille dans sa section
// ─────────────────────────────────────────────────────────────────────────────

import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";

// =============================================
// IMPORTS ADMIN PART 1 — Dev 2 mechack_rosca
// =============================================
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import GestionCartesPage from "./pages/admin/GestionCartesPage.jsx";
import ProfilAdminPage from "./pages/admin/ProfilAdminPage.jsx";
import JournalTransactionsPage from "./pages/admin/JournalTransactionsPage.jsx";
import MouvementCaisse from "./pages/admin/Mouvementcaisse.jsx";
import GestionClients from "./pages/admin/GestionClients.jsx";

// =============================================
// IMPORTS ADMIN PART 2 — Dev 3 Djenna — NE PAS TOUCHER
// =============================================
import GestionKiosques from "./pages/admin/GestionKiosques.jsx";
import KiosqueDetail from "./pages/admin/KiosqueDetail.jsx";
import GestionAgents from "./pages/admin/GestionAgents.jsx";

// =============================================
// IMPORTS AGENT — Dev 1 — NE PAS TOUCHER
// =============================================
import AgentLayout from "./layouts/AgentLayout.jsx";
import AgentDashboardPage from "./pages/agent/AgentDashboardPage.jsx";
import MesClientsPage from "./pages/agent/MesClientsPage.jsx";
import ProfilClientPage from "./pages/agent/ProfilClientPage.jsx";
import AjouterOperationPage from "./pages/agent/AjouterOperationPage.jsx";
import HistoriquePage from "./pages/agent/HistoriquePage.jsx";
import ScanCartePage from "./pages/agent/ScanCartePage.jsx";

export default function App() {
  return (
    <Routes>

      {/* Routes publiques */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* =============================================
          ZONE AGENT — Dev 1 — NE PAS TOUCHER
          ============================================= */}
      <Route path="/agent" element={
        <RequireAuth role="agent">
          <AgentLayout />
        </RequireAuth>
      }>
        <Route index element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="dashboard" element={<AgentDashboardPage />} />
        <Route path="clients" element={<MesClientsPage />} />
        <Route path="clients/:id" element={<ProfilClientPage />} />
        <Route path="clients/:id/operation" element={<AjouterOperationPage />} />
        <Route path="historique" element={<HistoriquePage />} />
        <Route path="scan" element={<ScanCartePage />} />  {/* ← AJOUTER CETTE LIGNE */}
      </Route>

      {/* =============================================
          ZONE ADMIN
          ============================================= */}
      <Route path="/admin" element={
        <RequireAuth role="admin">
          <AdminLayout />
        </RequireAuth>
      }>
        {/* ROUTES ADMIN PART 1 — Dev 2 mechack_rosca */}
        <Route index element={<AdminDashboardPage />} />
        <Route path="cartes" element={<GestionCartesPage />} />
        <Route path="profil" element={<ProfilAdminPage />} />
        <Route path="transactions" element={<JournalTransactionsPage />} />

        {/* ROUTES ADMIN PART 2 — Dev 3 Djenna — NE PAS TOUCHER */}
        <Route path="kiosques" element={<GestionKiosques />} />
        <Route path="kiosques/:id" element={<KiosqueDetail />} />

        <Route path="agents" element={<GestionAgents />} />
        <Route path="caisse" element={<MouvementCaisse />} />
        <Route path="clients" element={<GestionClients />} />



      </Route>

    </Routes>
  );
}