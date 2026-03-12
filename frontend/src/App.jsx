import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage          from "./pages/auth/LoginPage.jsx";
import Dashboard          from "./pages/Dashboard.jsx";
import AdminLayout        from "./layouts/AdminLayout.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import RequireAuth        from "./components/RequireAuth.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard agent — protégé */}
      <Route path="/dashboard" element={
        <RequireAuth role="agent">
          <Dashboard />
        </RequireAuth>
      } />

      {/* Zone admin — protégée, role admin obligatoire */}
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