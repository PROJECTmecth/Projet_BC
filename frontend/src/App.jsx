import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage  from "./pages/auth/LoginPage.jsx";
import Dashboard  from "./pages/Dashboard.jsx";
import Admin      from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Navigate to="/login" replace />} />
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin"     element={<Admin />} />
    </Routes>
  );
}
