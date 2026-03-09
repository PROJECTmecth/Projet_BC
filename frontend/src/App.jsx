import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LoginPage } from './pages/auth/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/admin"    element={<AdminDashboard />} />
        <Route path="/dashboard" element={<AgentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}