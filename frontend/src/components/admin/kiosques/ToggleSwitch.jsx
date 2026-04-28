// src/components/admin/kiosques/ToggleSwitch.jsx
export default function ToggleSwitch({ checked, onChange, loading }) {
  return (
    <button
      type="button"
      onClick={() => !loading && onChange(!checked)}
      disabled={loading}
      className={[
        "relative inline-flex items-center rounded-full transition-colors duration-200",
        "w-[52px] h-[28px] focus:outline-none",
        loading ? "opacity-50 cursor-wait" : "cursor-pointer",
        checked  ? "bg-green-500"          : "bg-red-400",
      ].join(" ")}
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
    >
      <span className={[
        "inline-block w-[22px] h-[22px] bg-white rounded-full shadow-md",
        "transition-transform duration-200",
        checked ? "translate-x-[26px]" : "translate-x-[3px]",
      ].join(" ")} />
    </button>
  );
}