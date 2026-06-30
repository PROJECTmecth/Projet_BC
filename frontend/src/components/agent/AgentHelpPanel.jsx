import { useState, useEffect, useRef } from "react";

/* ─── SVG Icons ─────────────────────────────── */
const Icons = {
  dashboard: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  scanner: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  ),
  clients: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  profile: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      <circle cx="12" cy="8" r="1.5" fill={c} stroke="none"/>
    </svg>
  ),
  operation: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
      <line x1="7" y1="15" x2="10" y2="15"/>
    </svg>
  ),
  history: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12 8 12 12 14 14"/>
      <path d="M3.05 11a9 9 0 1 0 .5-4.5"/>
      <polyline points="3 3 3 7 7 7"/>
    </svg>
  ),
  account: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  search: (c = "#9CA3AF") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  chevron: (c = "#9CA3AF") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  close: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  tip: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3"/>
    </svg>
  ),
  phone: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  help: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3"/>
    </svg>
  ),
  book: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  faq: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
};

const TOPICS = [
  {
    id: "dashboard", icon: Icons.dashboard, color: "#F97316", bg: "#FFF7ED",
    title: "Tableau de bord",
    sections: [
      { subtitle: "Vue d'ensemble", content: "Le tableau de bord est votre page d'accueil. Il affiche en temps réel vos indicateurs clés : nombre de clients, kiosques actifs, solde total géré et revenus encaissés." },
      { subtitle: "Rapport du jour", content: "La section « Rapport du jour » liste toutes les opérations effectuées aujourd'hui (dépôts, retraits, pénalités) ainsi que les soldes de chaque client concerné." },
      { subtitle: "Actions rapides", content: "Depuis le tableau de bord, accédez directement à : Scanner une carte, Voir mes clients, et Consulter l'historique." },
    ],
    tips: ["Si le tableau de bord affiche une erreur, vérifiez votre connexion internet.", "Les statistiques sont recalculées à chaque chargement de la page."],
    tags: ["accueil", "dashboard", "statistiques", "kiosques", "clients", "solde", "revenus"],
  },
  {
    id: "scanner", icon: Icons.scanner, color: "#8B5CF6", bg: "#F5F3FF",
    title: "Scanner une carte",
    sections: [
      { subtitle: "Comment scanner ?", content: "Cliquez sur « Scanner une carte » depuis le tableau de bord. La caméra s'active automatiquement. Placez le QR code de la carte du client dans le cadre de visée. La détection est automatique." },
      { subtitle: "Résultats après le scan", content: "Une fois le QR code reconnu, vous voyez : le nom du client, son téléphone, la ville, le statut de la carte, le solde disponible, la progression des paiements, et une alerte ⚠️ si en retard." },
      { subtitle: "Actions disponibles", content: "• « Ajouter une opération » : redirige vers le formulaire d'opération.\n• « Voir le profil » : accède au profil complet du client." },
      { subtitle: "Problèmes fréquents", content: "Si la caméra ne démarre pas : autorisez l'accès dans les paramètres du navigateur. Si le QR n'est pas reconnu : assurez-vous que la carte est bien éclairée et non endommagée." },
    ],
    tips: ["Maintenez la carte à 15–30 cm de la caméra.", "Une carte 'inactif' ne permet pas d'ajouter des opérations.", "Le badge rouge ⚠️ signifie que le client a dépassé sa date d'expiration sans atteindre 100%."],
    tags: ["scanner", "scan", "qr", "carte", "client", "identifier"],
  },
  {
    id: "clients", icon: Icons.clients, color: "#06B6D4", bg: "#ECFEFF",
    title: "Mes clients",
    sections: [
      { subtitle: "Liste des clients", content: "La page affiche tous les clients qui vous sont assignés. Chaque fiche montre : le nom complet, la ville, le numéro de téléphone et le statut de la carte." },
      { subtitle: "Rechercher un client", content: "Utilisez la barre de recherche pour trouver un client par son nom, prénom ou téléphone. La recherche est instantanée." },
      { subtitle: "Accéder au profil", content: "Cliquez sur la fiche d'un client pour accéder à son profil complet avec l'historique des opérations et l'état du compte." },
    ],
    tips: ["Si la liste est vide, vérifiez que votre compte est bien actif auprès de l'administrateur."],
    tags: ["clients", "liste", "recherche", "filtrer"],
  },
  {
    id: "profil-client", icon: Icons.profile, color: "#10B981", bg: "#ECFDF5",
    title: "Profil client",
    sections: [
      { subtitle: "Informations affichées", content: "Le profil contient : coordonnées complètes (nom, téléphone, ville, adresse), informations sur la carte (numéro, statut, dates), et données du compte (solde, dépôts, retraits, pénalités)." },
      { subtitle: "Historique des opérations", content: "Liste toutes les transactions passées : date, type d'opération, montant, et l'agent qui a effectué l'opération." },
      { subtitle: "Ajouter une opération", content: "Cliquez sur « Ajouter une opération » en haut du profil pour accéder directement au formulaire pour ce client." },
    ],
    tips: ["L'historique est affiché du plus récent au plus ancien.", "Les montants en rouge indiquent des retraits ou pénalités."],
    tags: ["profil", "client", "détails", "historique", "carte", "compte"],
  },
  {
    id: "operations", icon: Icons.operation, color: "#F59E0B", bg: "#FFFBEB",
    title: "Ajouter une opération",
    sections: [
      { subtitle: "Types d'opérations", content: "• Dépôt cash : le client dépose de l'argent.\n• Retrait cash partiel : le client retire une partie de son solde.\n• Retrait de solde : retrait total ou partiel du solde compte." },
      { subtitle: "Comment procéder ?", content: "1. Choisissez le type d'opération.\n2. Saisissez le montant (minimum 100 F).\n3. Cliquez sur « Valider ».\n4. Confirmez dans la fenêtre de confirmation.\n5. L'opération est enregistrée et vous êtes redirigé vers le profil." },
      { subtitle: "Règles importantes", content: "• Montant minimum : 100 F.\n• Pour un retrait, le montant ne peut pas dépasser le solde disponible.\n• Une opération validée ne peut pas être annulée." },
    ],
    tips: ["En cas de doute, cliquez « Annuler » pour revenir sans enregistrer.", "Vérifiez toujours le solde avant de valider un retrait.", "Chaque opération est tracée avec votre identifiant d'agent."],
    tags: ["opération", "dépôt", "retrait", "transaction", "montant", "valider"],
  },
  {
    id: "historique", icon: Icons.history, color: "#6366F1", bg: "#EEF2FF",
    title: "Historique",
    sections: [
      { subtitle: "Consultation", content: "L'historique affiche toutes les opérations que vous avez effectuées. Filtrez par date, type d'opération, ou recherchez par nom de client." },
      { subtitle: "Informations de chaque transaction", content: "Chaque ligne affiche : la date et l'heure, le nom du client, le type d'opération, le montant, et le solde après opération." },
    ],
    tips: ["Utilisez les filtres de date pour retrouver rapidement une opération.", "En cas de litige, fournissez la date et le montant exact à votre administrateur."],
    tags: ["historique", "transactions", "opérations passées", "filtrer", "date"],
  },
  {
    id: "compte", icon: Icons.account, color: "#EF4444", bg: "#FEF2F2",
    title: "Compte & Sécurité",
    sections: [
      { subtitle: "Statuts de compte", content: "• Actif : tout fonctionne normalement.\n• Gelé / Désactivé : votre compte a été suspendu. Vous ne pouvez pas effectuer d'opérations. Contactez votre administrateur." },
      { subtitle: "Problème de connexion", content: "Vérifiez votre email et mot de passe. Si le problème persiste, contactez votre administrateur pour réinitialiser votre accès." },
      { subtitle: "Mon profil agent", content: "Cliquez sur l'icône de profil (👤) en haut à droite pour voir vos informations personnelles et vous déconnecter en sécurité." },
    ],
    tips: ["Ne partagez jamais vos identifiants de connexion.", "Déconnectez-vous toujours à la fin de votre session."],
    tags: ["compte", "gelé", "actif", "inactif", "désactivé", "connexion"],
  },
];

const FAQ = [
  { q: "Pourquoi le bouton 'Ajouter une opération' est grisé ?", a: "La carte du client est inactive ou suspendue. Seuls les clients avec une carte au statut 'actif' peuvent recevoir des opérations. Contactez l'administrateur si c'est une erreur." },
  { q: "La caméra ne s'ouvre pas pour le scan, que faire ?", a: "Allez dans Paramètres du navigateur > Confidentialité > Autorisations de caméra, et autorisez ce site. Rechargez la page ensuite." },
  { q: "J'ai validé une mauvaise opération, comment l'annuler ?", a: "Les opérations validées ne peuvent pas être annulées depuis l'interface. Contactez immédiatement votre administrateur avec le nom du client, le montant et la date." },
  { q: "Que signifie le badge ⚠️ 'En retard' ?", a: "Il apparaît quand la date d'expiration de la carte est dépassée ET que la progression est inférieure à 100%. Référez le client à l'administrateur." },
  { q: "Comment voir toutes les opérations d'un client ?", a: "Scannez sa carte ou trouvez-le dans 'Mes clients', puis accédez à son profil. La section historique liste toutes ses transactions." },
  { q: "Mon tableau de bord affiche une erreur, que faire ?", a: "Vérifiez votre connexion internet. Si le problème persiste, votre compte est peut-être gelé. Contactez votre administrateur." },
];

/* ── Main Component ── */
export default function AgentHelpPanel({ onClose }) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("guide");
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? TOPICS.filter(t => t.title.toLowerCase().includes(q) || t.tags.some(g => g.includes(q)) || t.sections.some(s => s.subtitle.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)))
    : TOPICS;
  const filteredFaq = q
    ? FAQ.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
    : FAQ;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,15,25,0.55)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "flex-end", animation: "hp-fade .2s ease" }}
    >
      <div style={{ width: "min(100vw, 400px)", height: "100dvh", background: "#F8FAFC", display: "flex", flexDirection: "column", boxShadow: "-12px 0 60px rgba(0,0,0,0.22)", animation: "hp-slide .28s cubic-bezier(.22,1,.36,1)", overflow: "hidden" }}>

        {/* ── Header ── */}
        <div style={{ background: "linear-gradient(145deg, #1E293B 0%, #0F172A 100%)", padding: "22px 20px 0", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(249,115,22,0.15)" }} />
          <div style={{ position: "absolute", top: 10, right: 20, width: 60, height: 60, borderRadius: "50%", background: "rgba(249,115,22,0.1)" }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #F97316, #EA580C)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(249,115,22,0.4)" }}>
                {Icons.help()}
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 17, margin: 0, letterSpacing: "-0.3px" }}>Centre d'aide</p>
                <p style={{ color: "#64748B", fontSize: 12, margin: "2px 0 0" }}>Guide complet · Interface agent</p>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#94A3B8"; }}>
              {Icons.close()}
            </button>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>{Icons.search()}</div>
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher (dépôt, scan, retrait...)"
              style={{ width: "100%", boxSizing: "border-box", padding: "11px 36px 11px 40px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)", fontSize: 13, outline: "none", color: "#E2E8F0", backdropFilter: "blur(8px)" }}
            />
            {query && (
              <button onClick={() => setQuery("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", color: "#94A3B8", width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>×</button>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 4 }}>
            {[{ id: "guide", label: "Guide", icon: Icons.book }, { id: "faq", label: "FAQ", icon: Icons.faq }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: activeTab === tab.id ? "#fff" : "transparent", color: activeTab === tab.id ? "#0F172A" : "#64748B", transition: "all .2s", boxShadow: activeTab === tab.id ? "0 2px 8px rgba(0,0,0,0.15)" : "none" }}>
                <span style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon()}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ height: 16 }} />
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 20px" }}>

          {activeTab === "guide" && (
            filtered.length === 0
              ? <EmptyState />
              : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filtered.map(topic => (
                    <TopicCard key={topic.id} topic={topic} expanded={expandedTopic === topic.id} onToggle={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)} />
                  ))}
                </div>
          )}

          {activeTab === "faq" && (
            filteredFaq.length === 0
              ? <EmptyState />
              : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 4px 2px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Questions fréquentes</p>
                  {filteredFaq.map((faq, i) => (
                    <FaqCard key={i} faq={faq} index={i} expanded={expandedFaq === i} onToggle={() => setExpandedFaq(expandedFaq === i ? null : i)} />
                  ))}
                </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: "12px 14px 14px", borderTop: "1px solid #E2E8F0", background: "#fff", flexShrink: 0 }}>
          <div style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)", borderRadius: 14, padding: "14px 16px", border: "1px solid #FED7AA", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #FED7AA, #FDBA74)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {Icons.phone()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "#9A3412" }}>Besoin d'aide supplémentaire ?</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#C2410C" }}>Contactez votre administrateur directement.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hp-fade { from { opacity:0 } to { opacity:1 } }
        @keyframes hp-slide { from { transform:translateX(100%) } to { transform:translateX(0) } }
        div[style*="overflowY: auto"]::-webkit-scrollbar { width: 4px }
        div[style*="overflowY: auto"]::-webkit-scrollbar-track { background: transparent }
        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px }
        input::placeholder { color: #64748B }
      `}</style>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: "#94A3B8" }}>
      <div style={{ width: 56, height: 56, borderRadius: 18, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
        {Icons.search("#CBD5E1")}
      </div>
      <p style={{ fontWeight: 700, margin: 0, color: "#475569" }}>Aucun résultat</p>
      <p style={{ fontSize: 13, marginTop: 4 }}>Essayez un autre mot-clé</p>
    </div>
  );
}

/* ── Topic Card ── */
function TopicCard({ topic, expanded, onToggle }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid", borderColor: expanded ? topic.color + "40" : "#E2E8F0", overflow: "hidden", transition: "all .2s", boxShadow: expanded ? `0 4px 20px ${topic.color}18` : "0 1px 3px rgba(0,0,0,0.04)" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: topic.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "transform .2s", transform: expanded ? "scale(1.05)" : "scale(1)" }}>
          {topic.icon(topic.color)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{topic.title}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>
            {topic.sections.length} section{topic.sections.length > 1 ? "s" : ""}
            {topic.tips?.length > 0 && ` · ${topic.tips.length} conseil${topic.tips.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <div style={{ color: topic.color, transform: expanded ? "rotate(90deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0 }}>
          {Icons.chevron(expanded ? topic.color : "#CBD5E1")}
        </div>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ height: 1, background: `linear-gradient(to right, ${topic.color}30, transparent)`, marginBottom: 14 }} />
          {topic.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: i < topic.sections.length - 1 ? 14 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <div style={{ width: 4, height: 16, borderRadius: 2, background: topic.color }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: topic.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.subtitle}</p>
              </div>
              <p style={{ margin: "0 0 0 10px", fontSize: 13, color: "#374151", lineHeight: 1.65, whiteSpace: "pre-line" }}>{s.content}</p>
            </div>
          ))}

          {topic.tips?.length > 0 && (
            <div style={{ marginTop: 14, background: "#F0FDF4", borderRadius: 12, padding: "12px 14px", border: "1px solid #BBF7D0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                {Icons.tip()}
                <p style={{ margin: 0, fontWeight: 700, fontSize: 11, color: "#15803D", textTransform: "uppercase", letterSpacing: "0.05em" }}>Conseils</p>
              </div>
              {topic.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginTop: i > 0 ? 6 : 0 }}>
                  <span style={{ color: "#4ADE80", fontWeight: 900, flexShrink: 0, fontSize: 14, lineHeight: 1.4 }}>›</span>
                  <p style={{ margin: 0, fontSize: 12, color: "#166534", lineHeight: 1.55 }}>{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── FAQ Card ── */
function FaqCard({ faq, index, expanded, onToggle }) {
  const colors = ["#F97316", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];
  const color = colors[index % colors.length];
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid", borderColor: expanded ? color + "35" : "#E2E8F0", overflow: "hidden", transition: "all .2s", boxShadow: expanded ? `0 4px 16px ${color}12` : "0 1px 3px rgba(0,0,0,0.04)" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <div style={{ width: 28, height: 28, borderRadius: 9, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontWeight: 900, fontSize: 12, color }}>Q</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1E293B", lineHeight: 1.45, flex: 1 }}>{faq.q}</p>
        <div style={{ color: expanded ? color : "#CBD5E1", transform: expanded ? "rotate(90deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0 }}>
          {Icons.chevron(expanded ? color : "#CBD5E1")}
        </div>
      </button>
      {expanded && (
        <div style={{ padding: "0 14px 14px 54px" }}>
          <div style={{ height: 1, background: `linear-gradient(to right, ${color}25, transparent)`, marginBottom: 10 }} />
          <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.65 }}>{faq.a}</p>
        </div>
      )}
    </div>
  );
}
