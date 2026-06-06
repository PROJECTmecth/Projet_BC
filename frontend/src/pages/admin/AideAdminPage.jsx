// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/pages/admin/AideAdminPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from "react";

// ── Composants locaux ──────────────────────────────────────────────────────────
const Badge = ({ children, color = "orange" }) => {
  const colors = {
    orange: "bg-orange-100 text-orange-700",
    green:  "bg-green-100 text-green-700",
    blue:   "bg-blue-100 text-blue-700",
    red:    "bg-red-100 text-red-700",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>{children}</span>;
};

const Note = ({ type = "info", children }) => {
  const styles = {
    info:    { bg: "bg-blue-50 border-blue-400",   icon: "ℹ️" },
    warning: { bg: "bg-orange-50 border-orange-400", icon: "⚠️" },
    success: { bg: "bg-green-50 border-green-400",  icon: "✅" },
  };
  const s = styles[type];
  return (
    <div className={`flex gap-3 p-4 rounded-xl border-l-4 ${s.bg} my-3`}>
      <span className="text-lg shrink-0">{s.icon}</span>
      <p className="text-sm text-gray-700">{children}</p>
    </div>
  );
};

const Step = ({ n, children }) => (
  <div className="flex gap-3 items-start my-2">
    <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{n}</div>
    <p className="text-sm text-gray-700 pt-1">{children}</p>
  </div>
);

const Accordion = ({ question, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-orange-50 transition-colors">
        <span className="font-semibold text-gray-800 text-sm">{question}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div className="px-5 pb-4 text-sm text-gray-600 space-y-2 border-t border-gray-100">{children}</div>}
    </div>
  );
};

const SectionCard = ({ id, title, gradient, children }) => (
  <div id={id} className="bg-white rounded-2xl shadow-xl overflow-hidden scroll-mt-24">
    <div className={`bg-gradient-to-r ${gradient} px-6 py-5`}>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

// ── Sections de navigation rapide ─────────────────────────────────────────────
const QUICK_LINKS = [
  { id: "dashboard",     label: "Dashboard",           icon: "📊" },
  { id: "kiosques",      label: "Kiosques",             icon: "🏪" },
  { id: "agents",        label: "Agents",               icon: "👤" },
  { id: "clients",       label: "Clients",              icon: "👥" },
  { id: "cartes",        label: "Cartes QR",            icon: "🎫" },
  { id: "journal",       label: "Journal",              icon: "📋" },
  { id: "caisse",        label: "Mouvement Caisse",     icon: "💰" },
  { id: "profil",        label: "Profil & Sécurité",    icon: "🔒" },
  { id: "faq",           label: "FAQ",                  icon: "❓" },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function AideAdminPage() {
  const [search, setSearch] = useState("");
  const filtered = QUICK_LINKS.filter(l => l.label.toLowerCase().includes(search.toLowerCase()));

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6 pb-10">

      {/* ── Hero ── */}
      <div className="rounded-2xl overflow-hidden shadow-xl"
        style={{ background: "linear-gradient(135deg, #FF6600 0%, #EA580C 50%, #C2410C 100%)" }}>
        <div className="px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xl font-black text-white">?</span>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-white">Centre d'aide Admin</h1>
            <p className="text-orange-100 mt-1">Guide complet de la plateforme BOMBA CASH — espace administrateur</p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="px-8 pb-8">
          <div className="relative max-w-xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Rechercher une section…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 text-gray-800 placeholder-gray-400 font-medium text-sm focus:outline-none focus:bg-white transition-colors" />
          </div>
        </div>
      </div>

      {/* ── Navigation rapide ── */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="font-bold text-gray-800 mb-4 text-lg">Navigation rapide</h2>
        <div className="flex flex-wrap gap-2">
          {filtered.map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-sm font-semibold transition-colors border border-orange-200">
              <span>{link.icon}</span> {link.label}
            </button>
          ))}
          {filtered.length === 0 && <p className="text-gray-400 text-sm">Aucune section trouvée.</p>}
        </div>
      </div>

      {/* ── Section Dashboard ── */}
      <SectionCard id="dashboard" title="📊 Tableau de bord" gradient="from-orange-500 to-orange-600">
        <p className="text-gray-600 text-sm">La page d'accueil vous donne une vue d'ensemble de toute l'activité du système en temps réel.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { t: "Nombre total clients", d: "Survol pour voir la répartition hommes/femmes." },
            { t: "Nombre total kiosques", d: "Survol pour voir actifs vs inactifs avec animation." },
            { t: "Solde de tout compte", d: "Total des soldes de tous les comptes actifs." },
            { t: "Revenus encaissés", d: "Survol pour voir le détail frais de garde + pénalités." },
          ].map(c => (
            <div key={c.t} className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="font-semibold text-gray-800 text-sm">{c.t}</p>
              <p className="text-gray-500 text-xs mt-1">{c.d}</p>
            </div>
          ))}
        </div>
        <Note type="info">Le tableau des opérations récentes s'actualise automatiquement toutes les 30 secondes. Vous pouvez aussi cliquer sur "Actualiser" manuellement.</Note>
      </SectionCard>

      {/* ── Section Kiosques ── */}
      <SectionCard id="kiosques" title="🏪 Gestion des kiosques" gradient="from-blue-500 to-blue-600">
        <p className="text-gray-600 text-sm">Gérez tous les points de vente du réseau BOMBA CASH.</p>
        <h3 className="font-bold text-gray-800">Créer un kiosque</h3>
        <Step n={1}>Cliquez sur le bouton <Badge>+ Ajouter un kiosque</Badge> en haut de la liste.</Step>
        <Step n={2}>Remplissez le nom, la localisation et les informations de contact.</Step>
        <Step n={3}>Validez — le kiosque apparaît immédiatement dans la liste.</Step>
        <h3 className="font-bold text-gray-800 mt-4">Activer / Désactiver</h3>
        <p className="text-sm text-gray-600">Utilisez le toggle <Badge color="green">Actif</Badge> / <Badge color="red">Inactif</Badge> sur chaque carte kiosque pour changer son statut instantanément.</p>
        <Note type="warning">Un kiosque inactif empêche ses agents de réaliser des opérations.</Note>
      </SectionCard>

      {/* ── Section Agents ── */}
      <SectionCard id="agents" title="👤 Gestion des agents" gradient="from-purple-500 to-purple-600">
        <p className="text-gray-600 text-sm">Administrez les comptes des agents affectés aux kiosques.</p>
        <h3 className="font-bold text-gray-800">Créer un agent</h3>
        <Step n={1}>Cliquez sur <Badge>+ Ajouter un agent</Badge>.</Step>
        <Step n={2}>Saisissez nom, prénom, email, téléphone et assignez un kiosque.</Step>
        <Step n={3}>Un mot de passe temporaire est généré automatiquement.</Step>
        <h3 className="font-bold text-gray-800 mt-4">Modifier ou supprimer</h3>
        <p className="text-sm text-gray-600">Cliquez sur la ligne d'un agent pour accéder à ses détails, le modifier ou le supprimer.</p>
        <Note type="warning">La suppression d'un agent est définitive. Préférez le désactiver si c'est temporaire.</Note>
      </SectionCard>

      {/* ── Section Clients ── */}
      <SectionCard id="clients" title="👥 Gestion des clients" gradient="from-cyan-500 to-cyan-600">
        <p className="text-gray-600 text-sm">Consultez et gérez la liste de tous les clients enregistrés dans le système.</p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Recherche par nom, prénom ou téléphone</li>
          <li>Filtrage par kiosque ou par agent</li>
          <li>Export <Badge color="green">Excel</Badge> ou <Badge color="red">PDF</Badge> de la liste complète</li>
          <li>Cliquez sur un client pour voir son historique de transactions</li>
        </ul>
        <Note type="info">Les clients sont créés par les agents depuis leur interface. L'admin peut uniquement les consulter et les exporter.</Note>
      </SectionCard>

      {/* ── Section Cartes QR ── */}
      <SectionCard id="cartes" title="🎫 Gestion des cartes QR" gradient="from-emerald-500 to-emerald-600">
        <p className="text-gray-600 text-sm">Générez et gérez les lots de cartes QR pour les clients.</p>
        <h3 className="font-bold text-gray-800">Générer un lot</h3>
        <Step n={1}>Choisissez la quantité de cartes à générer.</Step>
        <Step n={2}>Cliquez sur <Badge color="green">Générer</Badge> — les QR codes sont créés instantanément.</Step>
        <Step n={3}>Téléchargez le lot pour l'imprimer ou le distribuer aux agents.</Step>
        <h3 className="font-bold text-gray-800 mt-4">Annuler un lot</h3>
        <p className="text-sm text-gray-600">Sélectionnez un lot dans la liste et cliquez sur <Badge color="red">Annuler</Badge>. Les cartes annulées ne peuvent plus être utilisées.</p>
        <Note type="warning">L'annulation d'un lot est irréversible.</Note>
      </SectionCard>

      {/* ── Section Journal ── */}
      <SectionCard id="journal" title="📋 Journal des transactions" gradient="from-slate-500 to-slate-600">
        <p className="text-gray-600 text-sm">Consultez l'historique complet de toutes les opérations effectuées sur la plateforme.</p>
        <Step n={1}>Sélectionnez une plage de dates <Badge>Du</Badge> → <Badge>Au</Badge>.</Step>
        <Step n={2}>Cliquez sur <Badge color="blue">Rechercher</Badge>.</Step>
        <Step n={3}>Les résultats s'affichent avec pagination (15 par page). Les totaux restent calculés sur toute la période.</Step>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge color="blue">Imprimer</Badge>
          <Badge color="red">Export PDF</Badge>
          <Badge color="green">Export Excel</Badge>
        </div>
        <Note type="info">Les exports incluent toutes les transactions de la période, pas seulement la page visible.</Note>
      </SectionCard>

      {/* ── Section Caisse ── */}
      <SectionCard id="caisse" title="💰 Mouvement de caisse" gradient="from-yellow-500 to-yellow-600">
        <p className="text-gray-600 text-sm">Suivi des flux financiers globaux : dépôts, retraits et soldes des comptes.</p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Total dépôts et retraits sur toutes périodes</li>
          <li>Solde net de l'ensemble des comptes actifs</li>
          <li>Détail par transaction avec modal d'information</li>
          <li>Export <Badge color="red">PDF</Badge>, <Badge color="green">Excel</Badge> et impression directe</li>
        </ul>
        <Note type="success">Les revenus (frais de garde + pénalités) sont visibles en survol de la carte "Revenus encaissés" sur le Dashboard.</Note>
      </SectionCard>

      {/* ── Section Profil ── */}
      <SectionCard id="profil" title="🔒 Profil & Sécurité" gradient="from-gray-600 to-gray-700">
        <p className="text-gray-600 text-sm">Gérez votre compte administrateur et votre mot de passe.</p>
        <h3 className="font-bold text-gray-800">Modifier vos informations</h3>
        <Step n={1}>Cliquez sur votre avatar en haut à droite ou allez dans <Badge>Profil</Badge>.</Step>
        <Step n={2}>Modifiez votre nom et email, puis cliquez sur <Badge color="green">Enregistrer</Badge>.</Step>
        <h3 className="font-bold text-gray-800 mt-4">Changer le mot de passe</h3>
        <Step n={1}>Dans la section Sécurité, saisissez l'ancien mot de passe.</Step>
        <Step n={2}>Entrez le nouveau mot de passe deux fois pour confirmer.</Step>
        <Note type="warning">Choisissez un mot de passe d'au moins 8 caractères avec des chiffres et des lettres.</Note>
      </SectionCard>

      {/* ── FAQ ── */}
      <SectionCard id="faq" title="❓ Questions fréquentes" gradient="from-rose-500 to-rose-600">
        <div className="space-y-3">
          <Accordion question="Pourquoi les revenus affichent 0 sur le dashboard ?">
            <p>Les revenus sont calculés sur la totalité des données (frais de garde des cartes actives + pénalités de retrait). Si aucune carte n'est active ou aucun retrait n'a été effectué, le montant sera 0.</p>
          </Accordion>
          <Accordion question="Comment ajouter un nouvel administrateur ?">
            <p>Actuellement, les comptes admin sont créés directement en base de données via le Seeder Laravel. Contactez l'équipe technique pour créer un nouveau compte admin.</p>
          </Accordion>
          <Accordion question="Le tableau des opérations ne se met pas à jour ?">
            <p>Le tableau s'actualise automatiquement toutes les 30 secondes. Si vous ne voyez pas les nouvelles opérations, cliquez sur le bouton <strong>Actualiser</strong> en haut du tableau.</p>
          </Accordion>
          <Accordion question="Comment exporter les données en Excel ?">
            <p>Sur chaque page (Journal, Clients, Caisse), cliquez sur le bouton <Badge color="green">Excel</Badge>. Un fichier CSV compatible Excel sera téléchargé. Ouvrez-le dans Excel et choisissez l'encodage UTF-8 si les accents sont mal affichés.</p>
          </Accordion>
          <Accordion question="Que faire si un agent ne peut pas se connecter ?">
            <p>Vérifiez que le compte agent est actif dans <strong>Gestion des agents</strong>. Si le compte est actif, l'agent doit réinitialiser son mot de passe. Vérifiez aussi que le kiosque associé est actif.</p>
          </Accordion>
          <Accordion question="Comment désactiver temporairement un kiosque ?">
            <p>Dans <strong>Gestion des kiosques</strong>, cliquez sur le toggle du kiosque concerné pour passer de <Badge color="green">Actif</Badge> à <Badge color="red">Inactif</Badge>. Les agents de ce kiosque ne pourront plus effectuer d'opérations.</p>
          </Accordion>
          <Accordion question="Les cartes QR générées sont-elles sécurisées ?">
            <p>Oui. Les routes de gestion des cartes QR sont protégées par authentification Sanctum + middleware admin. Seul un administrateur connecté peut générer, consulter ou annuler des lots.</p>
          </Accordion>
          <Accordion question="Comment consulter les transactions d'un client spécifique ?">
            <p>Allez dans <strong>Gestion des clients</strong>, recherchez le client, cliquez sur sa ligne pour ouvrir le détail. Son historique de transactions y est affiché.</p>
          </Accordion>
          <Accordion question="Pourquoi certaines colonnes du journal affichent un tiret (-) ?">
            <p>Un tiret signifie que la donnée n'est pas renseignée dans la base (ex: agent non rattaché, kiosque supprimé). Ce n'est pas une erreur — c'est une valeur manquante dans les données source.</p>
          </Accordion>
        </div>
      </SectionCard>

      {/* ── Footer contact ── */}
      <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
        <p className="text-gray-500 text-sm">Besoin d'aide supplémentaire ?</p>
        <p className="font-bold text-gray-800 mt-1">Contactez l'équipe technique Johann Finance SA</p>
        <p className="text-orange-600 text-sm font-semibold mt-1">support@johannfinance.com</p>
      </div>

    </div>
  );
}
