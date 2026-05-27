import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   BASE DE CONNAISSANCES — tout ce que l'agent
   a besoin de savoir pour utiliser l'interface
───────────────────────────────────────────── */
const HELP_TOPICS = [
  {
    id: "dashboard",
    icon: "🏠",
    color: "#F97316",
    title: "Tableau de bord",
    tags: ["accueil", "dashboard", "statistiques", "kiosques", "clients", "solde", "revenus"],
    sections: [
      {
        subtitle: "Vue d'ensemble",
        content:
          "Le tableau de bord est votre page d'accueil. Il affiche en temps réel vos indicateurs clés : nombre de clients, kiosques actifs, solde total géré et revenus encaissés.",
      },
      {
        subtitle: "Rapport du jour",
        content:
          "La section « Rapport du jour » liste toutes les opérations effectuées aujourd'hui (dépôts, retraits, pénalités) ainsi que les soldes de chaque client concerné.",
      },
      {
        subtitle: "Actions rapides",
        content:
          "Depuis le tableau de bord, vous pouvez accéder directement à : Scanner une carte, Voir mes clients, et Consulter l'historique.",
      },
    ],
    tips: [
      "Si le tableau de bord affiche une erreur, vérifiez votre connexion internet.",
      "Les statistiques sont recalculées à chaque chargement de la page.",
    ],
  },
  {
    id: "scanner",
    icon: "📷",
    color: "#8B5CF6",
    title: "Scanner une carte",
    tags: ["scanner", "scan", "qr", "carte", "client", "identifier"],
    sections: [
      {
        subtitle: "Comment scanner ?",
        content:
          "Cliquez sur « Scanner une carte » depuis le tableau de bord. La caméra s'active automatiquement. Placez le QR code de la carte du client dans le cadre de visée. La détection est automatique.",
      },
      {
        subtitle: "Résultats après le scan",
        content:
          "Une fois le QR code reconnu, vous voyez : le nom et prénom du client, son numéro de téléphone, la ville, le statut de la carte (actif/inactif), le solde disponible, la progression des paiements, et une alerte ⚠️ si le client est en retard.",
      },
      {
        subtitle: "Actions disponibles après le scan",
        content:
          "• « Ajouter une opération » : redirige vers le formulaire d'opération pour ce client.\n• « Voir le profil » : accède au profil complet du client avec tout son historique.",
      },
      {
        subtitle: "Problèmes fréquents",
        content:
          "Si la caméra ne démarre pas : autorisez l'accès à la caméra dans votre navigateur. Si le QR n'est pas reconnu : assurez-vous que la carte est bien éclairée et que le QR code n'est pas endommagé.",
      },
    ],
    tips: [
      "Maintenez la carte à 15–30 cm de la caméra pour une lecture optimale.",
      "Une carte avec statut 'inactif' ne permet pas d'ajouter des opérations.",
      "Le badge rouge ⚠️ En retard signifie que le client a dépassé sa date d'expiration sans atteindre 100% de progression.",
    ],
  },
  {
    id: "clients",
    icon: "👥",
    color: "#06B6D4",
    title: "Mes clients",
    tags: ["clients", "liste", "recherche", "filtrer", "client"],
    sections: [
      {
        subtitle: "Liste des clients",
        content:
          "La page « Mes clients » affiche tous les clients qui vous sont assignés. Chaque fiche client montre : le nom complet, la ville, le numéro de téléphone et le statut de la carte.",
      },
      {
        subtitle: "Rechercher un client",
        content:
          "Utilisez la barre de recherche pour trouver un client par son nom, prénom ou téléphone. La recherche est instantanée.",
      },
      {
        subtitle: "Accéder au profil",
        content:
          "Cliquez sur la fiche d'un client pour accéder à son profil complet : informations personnelles, carte associée, historique des opérations et état du compte.",
      },
    ],
    tips: [
      "Si la liste est vide, vérifiez que votre compte est bien actif auprès de l'administrateur.",
    ],
  },
  {
    id: "profil-client",
    icon: "👤",
    color: "#10B981",
    title: "Profil client",
    tags: ["profil", "client", "détails", "historique", "carte", "compte"],
    sections: [
      {
        subtitle: "Informations affichées",
        content:
          "Le profil client contient : les coordonnées complètes (nom, téléphone, ville, adresse), les informations sur la carte (numéro, statut, dates), et les données du compte (solde, total dépôts, total retraits, pénalités).",
      },
      {
        subtitle: "Historique des opérations",
        content:
          "La section historique liste toutes les transactions passées pour ce client : date, type d'opération, montant, et l'agent qui a effectué l'opération.",
      },
      {
        subtitle: "Ajouter une opération depuis le profil",
        content:
          "Cliquez sur « Ajouter une opération » en haut du profil pour accéder directement au formulaire d'opération pour ce client.",
      },
    ],
    tips: [
      "L'historique est affiché du plus récent au plus ancien.",
      "Les montants en rouge indiquent des retraits ou pénalités.",
    ],
  },
  {
    id: "operations",
    icon: "💳",
    color: "#F59E0B",
    title: "Ajouter une opération",
    tags: ["opération", "dépôt", "retrait", "transaction", "montant", "valider"],
    sections: [
      {
        subtitle: "Types d'opérations disponibles",
        content:
          "• Dépôt cash : le client dépose de l'argent sur son compte.\n• Retrait cash partiel : le client retire une partie de son solde.\n• Retrait de solde : le client retire la totalité ou une partie de son solde compte.",
      },
      {
        subtitle: "Comment effectuer une opération ?",
        content:
          "1. Choisissez le type d'opération dans la liste.\n2. Saisissez le montant (minimum 100 F).\n3. Cliquez sur « Valider ».\n4. Confirmez l'opération dans la fenêtre de confirmation.\n5. L'opération est enregistrée et vous êtes redirigé vers le profil du client.",
      },
      {
        subtitle: "Règles importantes",
        content:
          "• Le montant minimum est de 100 F.\n• Pour un retrait, le montant ne peut pas dépasser le solde disponible du client.\n• Une opération validée ne peut pas être annulée. Vérifiez bien avant de confirmer.",
      },
    ],
    tips: [
      "En cas de doute, cliquez sur « Annuler » pour revenir au profil sans enregistrer.",
      "Vérifiez toujours le solde affiché avant de valider un retrait.",
      "Chaque opération est tracée avec votre identifiant d'agent.",
    ],
  },
  {
    id: "historique",
    icon: "📋",
    color: "#6366F1",
    title: "Historique",
    tags: ["historique", "transactions", "opérations passées", "filtrer", "date"],
    sections: [
      {
        subtitle: "Consultation de l'historique",
        content:
          "L'historique affiche toutes les opérations que vous avez effectuées. Vous pouvez filtrer par date, par type d'opération, ou rechercher par nom de client.",
      },
      {
        subtitle: "Informations de chaque transaction",
        content:
          "Chaque ligne affiche : la date et l'heure, le nom du client, le type d'opération, le montant, et le solde après opération.",
      },
    ],
    tips: [
      "Utilisez les filtres de date pour retrouver rapidement une opération spécifique.",
      "En cas de litige, fournissez la date et le montant exact à votre administrateur.",
    ],
  },
  {
    id: "compte",
    icon: "🔒",
    color: "#EF4444",
    title: "Compte & Statuts",
    tags: ["compte", "gelé", "actif", "inactif", "désactivé", "connexion", "mot de passe"],
    sections: [
      {
        subtitle: "Statuts de compte",
        content:
          "• Actif : tout fonctionne normalement.\n• Gelé / Désactivé : votre compte a été temporairement suspendu. Vous ne pouvez pas effectuer d'opérations. Contactez votre administrateur.",
      },
      {
        subtitle: "Problème de connexion",
        content:
          "Si vous ne pouvez pas vous connecter : vérifiez votre email et mot de passe. Si le problème persiste, contactez votre administrateur pour réinitialiser votre accès.",
      },
      {
        subtitle: "Mon profil agent",
        content:
          "Cliquez sur l'icône de profil (👤) en haut à droite pour voir vos informations personnelles et vous déconnecter en toute sécurité.",
      },
    ],
    tips: [
      "Ne partagez jamais vos identifiants de connexion avec quelqu'un d'autre.",
      "Déconnectez-vous toujours à la fin de votre session, surtout sur un appareil partagé.",
    ],
  },
];

const FAQ = [
  {
    q: "Pourquoi le bouton 'Ajouter une opération' est grisé ?",
    a: "La carte du client est inactive ou suspendue. Seuls les clients avec une carte au statut 'actif' peuvent recevoir des opérations. Contactez l'administrateur si c'est une erreur.",
  },
  {
    q: "La caméra ne s'ouvre pas pour le scan, que faire ?",
    a: "Allez dans les paramètres de votre navigateur > Confidentialité > Autorisations de caméra, et autorisez ce site. Rechargez la page ensuite.",
  },
  {
    q: "J'ai validé une mauvaise opération, comment l'annuler ?",
    a: "Les opérations validées ne peuvent pas être annulées depuis l'interface agent. Contactez immédiatement votre administrateur avec le nom du client, le montant et la date.",
  },
  {
    q: "Le client dit qu'il a un retard, que veut dire le badge ⚠️ ?",
    a: "Le badge 'En retard' apparaît quand la date d'expiration de la carte est dépassée ET que la progression est inférieure à 100%. Référez le client à l'administrateur.",
  },
  {
    q: "Comment voir toutes les opérations d'un client ?",
    a: "Scannez sa carte ou trouvez-le dans 'Mes clients', puis accédez à son profil. La section historique liste toutes ses transactions.",
  },
  {
    q: "Mon tableau de bord affiche une erreur, que faire ?",
    a: "Vérifiez votre connexion internet. Si le problème persiste, votre compte est peut-être gelé. Contactez votre administrateur.",
  },
];

/* ─────────────────────────────────────────────
   COMPOSANT PRINCIPAL
───────────────────────────────────────────── */
export default function AgentHelpPanel({ onClose }) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("guide"); // "guide" | "faq"
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);

  // Focus search on open
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = query.trim()
    ? HELP_TOPICS.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.tags.some((tag) => tag.includes(query.toLowerCase())) ||
          t.sections.some(
            (s) =>
              s.subtitle.toLowerCase().includes(query.toLowerCase()) ||
              s.content.toLowerCase().includes(query.toLowerCase())
          )
      )
    : HELP_TOPICS;

  const filteredFaq = query.trim()
    ? FAQ.filter(
        (f) =>
          f.q.toLowerCase().includes(query.toLowerCase()) ||
          f.a.toLowerCase().includes(query.toLowerCase())
      )
    : FAQ;

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex", justifyContent: "flex-end",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        ref={panelRef}
        style={{
          width: "min(100vw, 420px)",
          height: "100dvh",
          background: "#FAFAFA",
          display: "flex", flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
          animation: "slideInRight 0.25s cubic-bezier(.22,1,.36,1)",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
          padding: "20px 20px 16px",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>💡</div>
              <div>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 17, margin: 0 }}>Centre d'aide</p>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}>Guide complet de l'interface agent</p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                border: "none", cursor: "pointer",
                color: "#fff", fontSize: 18, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.35)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            >×</button>
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              fontSize: 14, opacity: 0.7,
            }}>🔍</span>
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher (ex: dépôt, scan, retrait...)"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 12px 10px 36px",
                borderRadius: 12, border: "none",
                background: "rgba(255,255,255,0.95)",
                fontSize: 13, outline: "none",
                color: "#1F2937",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#9CA3AF", fontSize: 16,
                }}
              >×</button>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {[
              { id: "guide", label: "📖 Guide" },
              { id: "faq", label: "❓ FAQ" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
                  cursor: "pointer", fontWeight: 700, fontSize: 13,
                  background: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.2)",
                  color: activeTab === tab.id ? "#EA580C" : "rgba(255,255,255,0.9)",
                  transition: "all 0.2s",
                }}
              >{tab.label}</button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 24px" }}>

          {/* GUIDE TAB */}
          {activeTab === "guide" && (
            <>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
                  <p style={{ fontWeight: 600, margin: 0 }}>Aucun résultat</p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>Essayez un autre mot-clé</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filtered.map(topic => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      expanded={expandedTopic === topic.id}
                      onToggle={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                      query={query}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* FAQ TAB */}
          {activeTab === "faq" && (
            <>
              {filteredFaq.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
                  <p style={{ fontWeight: 600, margin: 0 }}>Aucun résultat</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: "4px 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Questions fréquentes
                  </p>
                  {filteredFaq.map((faq, i) => (
                    <FaqCard
                      key={i}
                      faq={faq}
                      expanded={expandedFaq === i}
                      onToggle={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid #E5E7EB",
          background: "#fff",
          flexShrink: 0,
        }}>
          <div style={{
            background: "linear-gradient(135deg, #FFF7ED, #FFEDD5)",
            borderRadius: 12, padding: "12px 14px",
            border: "1px solid #FED7AA",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>📞</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#C2410C" }}>Besoin d'aide supplémentaire ?</p>
              <p style={{ margin: 0, fontSize: 12, color: "#92400E" }}>Contactez votre administrateur directement.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </div>
  );
}

/* ── Topic Card ── */
function TopicCard({ topic, expanded, onToggle, query }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: "1px solid #E5E7EB",
      overflow: "hidden",
      transition: "box-shadow 0.2s",
      boxShadow: expanded ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
    }}>
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: 12, padding: "14px 16px",
          background: "none", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: topic.color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>{topic.icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#111827" }}>{topic.title}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#6B7280", marginTop: 1 }}>
            {topic.sections.length} section{topic.sections.length > 1 ? "s" : ""}
          </p>
        </div>
        <span style={{
          fontSize: 16, color: "#9CA3AF",
          transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          display: "block",
        }}>›</span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #F3F4F6" }}>
          {topic.sections.map((section, i) => (
            <div key={i} style={{ marginTop: 12 }}>
              <p style={{
                margin: "0 0 4px",
                fontWeight: 700, fontSize: 13,
                color: topic.color,
              }}>{section.subtitle}</p>
              <p style={{
                margin: 0, fontSize: 13, color: "#374151",
                lineHeight: 1.6, whiteSpace: "pre-line",
              }}>{section.content}</p>
            </div>
          ))}

          {topic.tips?.length > 0 && (
            <div style={{
              marginTop: 14, background: "#F0FDF4",
              borderRadius: 10, padding: "10px 12px",
              border: "1px solid #BBF7D0",
            }}>
              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 12, color: "#15803D" }}>
                💡 Conseils
              </p>
              {topic.tips.map((tip, i) => (
                <p key={i} style={{
                  margin: i === 0 ? 0 : "4px 0 0",
                  fontSize: 12, color: "#166534", lineHeight: 1.5,
                }}>• {tip}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── FAQ Card ── */
function FaqCard({ faq, expanded, onToggle }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #E5E7EB",
      overflow: "hidden",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "flex-start",
          gap: 10, padding: "14px 16px",
          background: "none", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "#FFF7ED", border: "1.5px solid #FED7AA",
          color: "#EA580C", fontWeight: 900, fontSize: 11,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 1,
        }}>?</span>
        <p style={{
          margin: 0, fontSize: 13, fontWeight: 600,
          color: "#1F2937", lineHeight: 1.5, flex: 1,
        }}>{faq.q}</p>
        <span style={{
          fontSize: 16, color: "#9CA3AF", flexShrink: 0,
          transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}>›</span>
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 14px 48px", borderTop: "1px solid #F3F4F6" }}>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{faq.a}</p>
        </div>
      )}
    </div>
  );
}
