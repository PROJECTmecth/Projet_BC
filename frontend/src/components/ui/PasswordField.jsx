// fichier : src/components/ui/PasswordField.jsx — Tailwind CDN
import { useState } from "react";

export default function PasswordField({ id, label = "mot de passe", value, onChange, disabled = false, error = "", autoComplete = "current-password" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`bc-input w-full h-12 pl-4 pr-12 rounded-lg bg-white text-sm text-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed border-[1.5px] ${error ? "border-red-500" : "border-[#CBD5E1]"}`}
        />
        <button
          type="button"
          onClick={() => setShow(p => !p)}
          tabIndex={-1}
          aria-label={show ? "Masquer" : "Afficher"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer flex items-center p-0 transition-colors"
        >
          {/* show=false → password masqué   → œil OUVERT  (cliquer pour voir)   */}
          {/* show=true  → password visible  → œil BARRÉ   (cliquer pour masquer) */}
          {show
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          }
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs font-semibold text-red-600">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}