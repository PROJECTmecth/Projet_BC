// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/admin/OperationsTable.jsx
//
// Tableau des opérations récentes — fidèle au Figma
// En-tête dégradé orange, lignes zébrées au hover
//
// NOTE BACKEND (équipe) :
//   Les données viennent de GET /api/admin/operations
//   Format attendu : [{ id, carte, client, type, montant, date, agent }]
//   type : "Dépôt" | "Retrait"
// ─────────────────────────────────────────────────────────────────────────────

// Props :
//   operations : array — données des opérations
//   loading    : bool  — affiche un skeleton si true
export default function OperationsTable({ operations = [], loading = false }) {

  const HEADERS = ["ID CARTE", "NOM ET PRENOM", "OPERATION", "MONTANT", "DATE", "AGENT"];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#FF6600] to-orange-400 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Opérations récentes</h3>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">

      {/* En-tête dégradé orange — Figma exact */}
      <div className="bg-gradient-to-r from-[#FF6600] to-orange-400 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">Opérations récentes</h3>
      </div>

      {/* Tableau scrollable horizontalement sur petits écrans */}
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* En-têtes colonnes */}
          <thead className="bg-orange-50">
            <tr>
              {HEADERS.map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody className="divide-y divide-gray-100">
            {operations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                  Aucune opération récente
                </td>
              </tr>
            ) : (
              operations.map((op) => (
                <tr key={op.id} className="hover:bg-orange-50/50 transition-colors">

                  {/* ID Carte */}
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{op.carte}</td>

                  {/* Nom client */}
                  <td className="px-6 py-4 text-sm text-gray-700">{op.client}</td>

                  {/* Badge Opération — vert Dépôt / orange Retrait (Figma) */}
                  <td className="px-6 py-4">
                    <span className={[
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      op.type === "Dépôt"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-orange-100 text-orange-700 border border-orange-200",
                    ].join(" ")}>
                      {op.type}
                    </span>
                  </td>

                  {/* Montant */}
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {op.montant} F
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-gray-500">{op.date}</td>

                  {/* Agent */}
                  <td className="px-6 py-4 text-sm text-gray-700">{op.agent}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}