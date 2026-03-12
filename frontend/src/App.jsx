import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage        from "./pages/auth/LoginPage.jsx";
import Dashboard        from "./pages/Dashboard.jsx";
import AdminLayout      from "./layouts/AdminLayout.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard agent */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Zone admin — AdminLayout contient Sidebar + Topbar */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        {/* Les pages collègues seront ajoutées ici */}
        {/* <Route path="clients"      element={<GestionClientsPage />} /> */}
        {/* <Route path="kiosques"     element={<GestionKiosquesPage />} /> */}
        {/* <Route path="cartes"       element={<GestionCartesPage />} /> */}
        {/* <Route path="transactions" element={<JournalTransactionsPage />} /> */}
        {/* <Route path="caisse"       element={<MouvementCaissePage />} /> */}
      </Route>
    </Routes>
  );
}