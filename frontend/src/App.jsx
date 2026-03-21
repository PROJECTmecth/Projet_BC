// src/App.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage          from "./pages/auth/LoginPage.jsx";
import Dashboard          from "./pages/Dashboard.jsx";
import AdminLayout        from "./layouts/AdminLayout.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import RequireAuth        from "./components/RequireAuth.jsx";

//---routes dev3 Djenna à ne pas toucher
import GestionKiosques from "./pages/admin/GestionKiosques.jsx";
import KiosqueDetail   from "./pages/admin/KiosqueDetail.jsx"; 
import GestionAgents from "./pages/admin/GestionAgents.jsx"; // ✅ import ajouté
//---fin routes dev3 Djenna

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={
        <RequireAuth role="agent">
          <Dashboard />
        </RequireAuth>
      } />

      <Route path="/admin" element={
        <RequireAuth role="admin">
          <AdminLayout />
        </RequireAuth>
      }>
        <Route index                element={<AdminDashboardPage />} />
        <Route path="kiosques"      element={<GestionKiosques />} />
        <Route path="kiosques/:id"  element={<KiosqueDetail />} />  {/* ✅ à l'intérieur */}
        <Route path="agents"        element={<GestionAgents />} />   {/* ✅ nouvelle route */}
      </Route>

    </Routes>
  );
}