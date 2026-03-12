// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/layouts/AdminLayout.jsx
//
// Layout conteneur de toutes les pages Admin.
// Sidebar fixe à gauche + Topbar en haut + contenu via <Outlet />
//
// ── INTÉGRATION dans App.jsx ─────────────────────────────────────────────────
//
//   import AdminLayout          from "./layouts/AdminLayout";
//   import AdminDashboardPage   from "./pages/admin/AdminDashboardPage";
//   // pages collègues :
//   // import GestionClientsPage   from "./pages/admin/GestionClientsPage";
//   // import GestionKiosquesPage  from "./pages/admin/GestionKiosquesPage";
//
//   <Route path="/admin" element={<AdminLayout />}>
//     <Route index            element={<AdminDashboardPage />} />
//     <Route path="clients"   element={<GestionClientsPage />} />
//     <Route path="kiosques"  element={<GestionKiosquesPage />} />
//     <Route path="cartes"    element={<GestionCartesPage />} />
//     <Route path="transactions" element={<JournalTransactionsPage />} />
//     <Route path="caisse"    element={<MouvementCaissePage />} />
//   </Route>
//
// ── PROTECTION DE ROUTE (à ajouter avec l'équipe) ───────────────────────────
//   Entourer <AdminLayout /> d'un composant <RequireAuth role="admin" />
//   qui redirige vers /login si l'utilisateur n'est pas connecté ou pas admin.
// ─────────────────────────────────────────────────────────────────────────────

import { Outlet } from "react-router-dom";
import Sidebar    from "../components/admin/Sidebar";
import Topbar     from "../components/admin/Topbar";

export default function AdminLayout() {
  return (
    // flex min-h-screen → occupe toute la hauteur de la fenêtre
    // bg-[#F5F0E8]       → fond crème chaud (cohérent avec le Figma)
    <div className="flex min-h-screen bg-[#F5F0E8]">

      {/* Sidebar fixe à gauche — largeur 280px */}
      <Sidebar />

      {/* Zone principale : Topbar + contenu */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Topbar sticky en haut */}
        {/* NOTE BACKEND : passer user.name en prop quand useAuth() est prêt */}
        <Topbar userName="Agent MBOUANDI" />

        {/* Contenu de la page (rendu par React Router <Outlet />) */}
        {/* overflow-y-auto → scroll vertical si le contenu dépasse */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}