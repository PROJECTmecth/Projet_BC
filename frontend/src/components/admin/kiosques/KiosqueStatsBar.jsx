// src/components/admin/kiosques/KiosqueStatsBar.jsx
export default function KiosqueStatsBar({ actifs, geles, total }) {
  const taux = total > 0 ? Math.round((actifs / total) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">

      {/* Kiosques Actifs */}
      <div className="bg-green-50 rounded-2xl px-6 py-5 flex items-center justify-between border border-green-100">
        <div>
          <p className="text-[13px] font-semibold text-gray-700 mb-1">Kiosques Actifs</p>
          <p className="text-[28px] font-black text-gray-900 leading-none">{actifs}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <div className="w-[22px] h-[22px] rounded-full bg-green-500 ring-[5px] ring-green-200" />
        </div>
      </div>

      {/* Kiosques Gelés */}
      <div className="bg-red-50 rounded-2xl px-6 py-5 flex items-center justify-between border border-red-100">
        <div>
          <p className="text-[13px] font-semibold text-gray-700 mb-1">Kiosques Gelés</p>
          <p className="text-[28px] font-black text-gray-900 leading-none">{geles}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <div className="w-[22px] h-[22px] rounded-full bg-red-500 ring-[5px] ring-red-200" />
        </div>
      </div>

      {/* Taux d'activité */}
      <div className="bg-blue-50 rounded-2xl px-6 py-5 flex items-center justify-between border border-blue-100">
        <div>
          <p className="text-[13px] font-semibold text-gray-700 mb-1">Taux d'activité</p>
          <p className="text-[28px] font-black text-blue-600 leading-none">{taux}%</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
          📊
        </div>
      </div>

    </div>
  );
}