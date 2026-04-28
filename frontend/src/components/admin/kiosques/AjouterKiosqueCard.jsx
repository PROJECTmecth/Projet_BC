// src/components/admin/kiosques/AjouterKiosqueCard.jsx
export default function AjouterKiosqueCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "bg-[#FFFBF5] rounded-2xl p-6 min-h-[260px] w-full",
        "border-2 border-dashed border-orange-300",
        "flex flex-col items-center justify-center gap-4",
        "hover:bg-orange-50 transition-colors duration-200 group",
      ].join(" ")}
    >
      <div className="w-[68px] h-[68px] rounded-full bg-orange-200 flex items-center justify-center text-[30px] text-[#FF6600] group-hover:scale-110 transition-transform duration-200">
        +
      </div>
      <div className="text-center">
        <p className="font-extrabold text-[16px] text-gray-900 mb-1">Ajouter un kiosque</p>
        <p className="text-[13px] text-gray-400">Cliquez pour créer un nouveau point de vente</p>
      </div>
    </button>
  );
}