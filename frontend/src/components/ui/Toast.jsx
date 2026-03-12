// fichier : src/components/ui/Toast.jsx — Tailwind CDN
export default function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 whitespace-nowrap px-7 py-3 rounded-xl font-bold text-sm text-white shadow-[0_8px_30px_rgba(0,0,0,0.28)] transition-all ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      {msg}
    </div>
  );
}