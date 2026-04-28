// src/components/admin/clients/ClientRow.jsx

export default function ClientRow({ index, client, onDetail }) {
  return (
    <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
      <td className="px-4 py-4 text-gray-500">{index}</td>
      <td className="px-4 py-4">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
          client.genre === "Homme" ? "bg-blue-400" : "bg-pink-400"
        }`}>
          {client.genre === "Homme" ? "M" : "F"}
        </span>
      </td>
      <td className="px-4 py-4">
        <p className="font-bold text-[#1e2a3a]">{client.nom} {client.prenom}</p>
        <p className="text-xs text-[#FF6600]">{client.numero_carte ?? "—"}</p>
      </td>
      <td className="px-4 py-4 text-gray-600">{client.adresse}</td>
      <td className="px-4 py-4 text-gray-600">{client.nationalite}</td>
      <td className="px-4 py-4 text-gray-600">{client.type_piece}</td>
      <td className="px-4 py-4 text-gray-600">{client.num_piece}</td>
      <td className="px-4 py-4 text-gray-600">{client.activite}</td>
      <td className="px-4 py-4 text-gray-600">{client.telephone}</td>
      <td className="px-4 py-4 text-center">
        <button
          onClick={() => onDetail(client)}
          className="border border-blue-400 text-blue-500 rounded-lg p-1.5 hover:bg-blue-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </button>
      </td>
    </tr>
  );
}