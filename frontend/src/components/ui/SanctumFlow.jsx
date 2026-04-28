// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/components/ui/SanctumFlow.jsx
// Visualiseur du flux d'authentification Sanctum — 100% Tailwind CSS
// ─────────────────────────────────────────────────────────────────────────────


// ─── SOUS-COMPOSANT : FlowStep ────────────────────────────────────────────────
// UNE étape du flux avec cercle numéroté, label, et état visuel.
//
// Props :
//   num   {number} – numéro de l'étape (1, 2, 3)
//   label {string} – description de l'étape
//   state {string} – "idle" | "active" | "done"

export function FlowStep({ num, label, state }) {
  // Classes Tailwind du cercle selon l'état
  const circleClass = {
    idle  : "bg-gray-300",   // gris clair — étape non atteinte
    active: "bg-orange-500", // orange     — étape en cours
    done  : "bg-green-600",  // vert       — étape terminée
  }[state];

  // Classes Tailwind du texte selon l'état
  const textClass = {
    idle  : "text-gray-400",   // gris léger
    active: "text-orange-600", // orange foncé
    done  : "text-green-700",  // vert foncé
  }[state];

  return (
    /*
      flex items-center gap-2 → cercle + label côte à côte
      opacity-40              → estompé si "idle" (non atteint)
      transition-opacity      → transition fluide de l'opacité
    */
    <div className={`flex items-center gap-2 transition-opacity ${state === "idle" ? "opacity-40" : "opacity-100"}`}>

      {/* ── Cercle numéroté ──────────────────────────────────────────── */}
      {/*
        w-[18px] h-[18px] → taille fixe 18×18px
        rounded-full      → cercle parfait
        flex items-center justify-center → contenu centré
        text-white text-[9px] font-extrabold → numéro blanc minuscule
        shrink-0          → ne rétrécit pas en flex
        transition-colors → transition fluide du changement de couleur
      */}
      <div className={`
        w-[18px] h-[18px] rounded-full shrink-0
        flex items-center justify-center
        text-white text-[9px] font-extrabold
        transition-colors ${circleClass}
      `}>
        {/* Affiche ✓ si terminé, sinon le numéro */}
        {state === "done" ? "✓" : num}
      </div>

      {/* ── Label de l'étape ─────────────────────────────────────────── */}
      {/* font-mono → police à chasse fixe, idéale pour les chemins d'API */}
      <span className={`text-[11px] font-mono transition-colors ${textClass}`}>
        {label}
      </span>
    </div>
  );
}


// ─── COMPOSANT PRINCIPAL : SanctumFlow ───────────────────────────────────────
// Regroupe les 3 étapes dans un bloc stylisé.
//
// Props :
//   currentStep {number} – 0 = masqué, 1/2/3 = étape courante

export default function SanctumFlow({ currentStep }) {
  // Masqué tant qu'aucune étape n'est commencée
  if (currentStep === 0) return null;

  // Calcule l'état d'une étape n par rapport à currentStep
  const getState = (n) =>
    currentStep > n ? "done" : currentStep === n ? "active" : "idle";

  return (
    /*
      p-3 rounded-lg              → padding + coins arrondis
      bg-slate-50                 → fond légèrement bleuté
      border border-slate-200     → bordure subtile
    */
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">

      {/* ── Titre du bloc ────────────────────────────────────────────── */}
      {/* text-[9.5px] uppercase tracking-widest → style "label" discret */}
      <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        Flux Sanctum en direct
      </p>

      {/* ── Les 3 étapes ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-[5px]">
        <FlowStep num={1} label="GET /sanctum/csrf-cookie"    state={getState(1)} />
        <FlowStep num={2} label="POST /login → vérification"  state={getState(2)} />
        <FlowStep num={3} label="Session créée → redirection" state={getState(3)} />
      </div>
    </div>
  );
}