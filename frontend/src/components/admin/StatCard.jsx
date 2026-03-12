// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/StatCard.jsx
//
// Carte statistique réutilisable pour le tableau de bord.
// Supporte : gradient de couleur, icône, valeur, sous-titre, onClick
//
// Usage :
//   <StatCard
//     title="Nombre total clients"
//     value="248"
//     subtitle="+12% ce mois"
//     gradient="from-blue-500 to-cyan-500"
//     icon={<IconUsers />}
//     onClick={() => navigate('/admin/clients')}
//   />
// ─────────────────────────────────────────────────────────────────────────────

export default function StatCard({
  title,
  value,
  subtitle,
  subtitleExtra,
  gradient = "from-blue-500 to-cyan-500",
  textColor = "text-blue-100",
  icon,
  onClick,
  children,
}) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={[
        `bg-gradient-to-br ${gradient} text-white p-6 rounded-xl shadow-xl`,
        isClickable ? "cursor-pointer hover:scale-[1.02] active:scale-100 transition-transform duration-150" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Titre */}
          <p className={`${textColor} text-sm font-medium`}>{title}</p>

          {/* Valeur principale */}
          <h3 className="text-3xl font-bold mt-2">{value}</h3>

          {/* Sous-titre */}
          {subtitle && (
            <div className={`flex items-center gap-1 mt-2 ${textColor} text-xs`}>
              {subtitle}
            </div>
          )}

          {/* Sous-titre secondaire */}
          {subtitleExtra && (
            <p className={`${textColor} text-xs mt-1 opacity-80`}>{subtitleExtra}</p>
          )}

          {/* Contenu additionnel (ex: "Cliquez pour voir les détails") */}
          {children}
        </div>

        {/* Icône à droite */}
        {icon && (
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm shrink-0 ml-3">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}