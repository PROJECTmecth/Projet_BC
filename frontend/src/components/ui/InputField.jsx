// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/ui/InputField.jsx
// Champ de texte générique — 100% Tailwind CSS, zéro style inline
// ─────────────────────────────────────────────────────────────────────────────

// Props :
//   id           {string}   – identifiant HTML (lie <label> au <input>)
//   label        {string}   – texte affiché au-dessus du champ
//   type         {string}   – "text" | "email" | "number" (défaut: "text")
//   value        {string}   – valeur contrôlée (état React du parent)
//   onChange     {function} – callback appelé à chaque frappe
//   disabled     {boolean}  – désactive le champ pendant le chargement
//   error        {string}   – message d'erreur (chaîne vide = pas d'erreur)
//   autoComplete {string}   – ex: "username", "email", "off"
//   placeholder  {string}   – texte indicatif dans le champ vide

export default function InputField({
  id,
  label,
  type         = "text",
  value,
  onChange,
  disabled     = false,
  error        = "",
  autoComplete = "off",
  placeholder  = "",
}) {
  return (
    // Conteneur vertical avec espacement entre label, input et erreur
    <div className="flex flex-col gap-2">

      {/* ── Label ────────────────────────────────────────────────────── */}
      {/* text-sm     → 14px  |  font-medium → 500  |  text-gray-700 → #374151 */}
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* ── Champ de saisie ────────────────────────────────────────── */}
      {/*
        w-full              → largeur 100%
        h-12                → hauteur 48px (3rem)
        px-4                → padding horizontal 16px
        rounded-lg          → border-radius 8px
        bg-white            → fond blanc
        text-[15px]         → taille police 15px (valeur Tailwind arbitraire)
        text-gray-900       → texte quasi-noir #111827
        border-2            → épaisseur de bordure 2px
        border-red-500      → rouge si erreur  (conditionnel)
        border-gray-300     → gris par défaut  (conditionnel)
        transition-all      → transitions fluides sur toutes propriétés CSS
        disabled:opacity-60         → opacité 60% quand disabled=true
        disabled:cursor-not-allowed → curseur "interdit" quand disabled=true
        bc-input            → classe custom index.css : focus ring orange
      */}
      <input
        id           ={id}
        type         ={type}
        value        ={value}
        onChange     ={onChange}
        disabled     ={disabled}
        autoComplete ={autoComplete}
        placeholder  ={placeholder}
        className={[
          "bc-input",
          "w-full h-12 px-4",
          "rounded-lg bg-white",
          "text-[15px] text-gray-900",
          "border-2 transition-all",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          // Bordure rouge si erreur, grise sinon
          error ? "border-red-500" : "border-gray-300",
        ].join(" ")}
      />

      {/* ── Message d'erreur (affiché seulement si error est non vide) ── */}
      {/* text-xs → 12px  |  font-semibold → 600  |  text-red-600 → #DC2626 */}
      {error && (
        <p className="text-xs font-semibold text-red-600">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}