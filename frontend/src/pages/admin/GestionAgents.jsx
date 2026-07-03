// src/pages/admin/GestionAgents.jsx

import { useState, useEffect, useCallback } from "react";
import api from "../../lib/axios";
import Swal from "sweetalert2";
import {
  UserCheck,
  Trash2,
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Store,
  Wifi,
  WifiOff,
  UserPlus,
  Pencil,
  Search,
} from "lucide-react";

const BASE = "/api/admin/agents";
const BASE_KIOSQUE = "/api/admin/kiosques";

export default function GestionAgents() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [kiosques, setKiosques] = useState([]);
  const [stats, setStats] = useState({ total: 0, en_ligne: 0, hors_ligne: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedTotal, setAnimatedTotal] = useState(0);// pour animation du total agents
  const [animatedEnLigne, setAnimatedEnLigne] = useState(0);   // pour animation du total en ligne
const [animatedHorsLigne, setAnimatedHorsLigne] = useState(0); // pour animation du total hors ligne
  const [modal, setModal] = useState(false);
  const [editAgent, setEditAgent] = useState(null); // agent à modifier

  const load = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const [{ data: a }, { data: k }] = await Promise.all([
      api.get(BASE),
      api.get(BASE_KIOSQUE),
    ]);
    setAgents(a.data ?? []);
    setStats(a.stats ?? { total: 0, en_ligne: 0, hors_ligne: 0 });
    
    // 🎯 FONCTION D'ANIMATION RÉUTILISABLE
    const animateCounter = (setValue, target, delay = 0) => {
      let start = 0;
      const duration = 1500;
      const increment = target / (duration / 16);
      
      const animate = () => {
        start += increment;
        if (start < target) {
          setValue(Math.ceil(start));
          requestAnimationFrame(animate);
        } else {
          setValue(target);
        }
      };
      // Délai optionnel pour un effet en cascade
      setTimeout(() => requestAnimationFrame(animate), delay);
    };

    // 🚀 Lancer les 3 animations (avec léger décalage pour l'effet cascade)
    animateCounter(setAnimatedTotal, a.stats?.total ?? 0, 0);
    animateCounter(setAnimatedEnLigne, a.stats?.en_ligne ?? 0, 200);   // +200ms
    animateCounter(setAnimatedHorsLigne, a.stats?.hors_ligne ?? 0, 400); // +400ms
    
    setKiosques(k.data ?? []);
  } catch {
    setError("Impossible de charger les agents.");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ── Supprimer ───────────────────────────────────────────────────────────────
  const handleDelete = async (agent) => {
    const result = await Swal.fire({
      title: "Supprimer cet agent ?",
      html: `<strong>${agent.nom}</strong> et son compte seront définitivement supprimés.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`${BASE}/${agent.id}`);
      load();
      Swal.fire({
        icon: "success",
        title: "Agent supprimé !",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Erreur", "Impossible de supprimer cet agent.", "error");
    }
  };

  // ── Créer ───────────────────────────────────────────────────────────────────
  const handleCreate = async (form) => {
    try {
      await api.post(BASE, form);
      setModal(false);
      load();
      Swal.fire({
        icon: "success",
        title: "Agent créé !",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors).flat().join("\n")
        : (err.response?.data?.message ?? "Erreur lors de la création.");
      Swal.fire("Erreur", msg, "error");
    }
  };

  // ── Modifier ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    try {
      await api.put(`${BASE}/${form.id}`, form);
      setEditAgent(null);
      load();
      Swal.fire({
        icon: "success",
        title: "Agent modifié !",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors).flat().join("\n")
        : (err.response?.data?.message ?? "Erreur lors de la modification.");
      Swal.fire("Erreur", msg, "error");
    }
  };

  // ── Filtrage et Pagination ────────────────────────────────────────────────
  const filteredAgents = agents.filter(a =>
    `${a.nom} ${a.email} ${a.telephone} ${a.adresse} ${a.kiosque?.nom_kiosque ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedAgents = filteredAgents.slice(startIdx, endIdx);

  useEffect(() => {
    setCurrentPage(page => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <div>
      {/* ── Bannière ────────────────────────────────────────────────────── */}
      <div className="relative bg-[#1e2a3a] rounded-2xl px-5 sm:px-8 py-5 sm:py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-7 overflow-hidden gap-4">
        <div className="absolute right-40 -top-6 w-28 h-28 rounded-full bg-white/[0.04]" />
        <div className="flex items-center gap-4 z-10 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] bg-white/10 flex items-center justify-center text-white shrink-0">
            <UserCheck size={26} />
          </div>
          <div className="min-w-0">
            <h1 className="text-white text-[20px] sm:text-[26px] font-black tracking-tight leading-none truncate">
              Gestion des agents
            </h1>
            <p className="text-white/50 text-xs sm:text-sm mt-1">
              Gérer les agents rattachés aux kiosques
            </p>
          </div>
        </div>
        {/* Dans la bannière circulaire */}
        <div className="z-10 bg-white rounded-full w-[72px] h-[72px] sm:w-[90px] sm:h-[90px] flex flex-col items-center justify-center shadow-lg shrink-0">
          <span className="text-gray-400 text-[10px] sm:text-[11px] font-semibold text-center leading-tight">
            Total<br />agents
          </span>
          <span className="text-[#1e2a3a] text-[22px] sm:text-[28px] font-black leading-none">
            {String(animatedTotal).padStart(2, "0")} {/* ← CHANGEMENT ICI */}
          </span>
        </div>
      </div>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 items-stretch">
        <StatCard label="Total agents" value={animatedTotal} color="text-[#1e2a3a]" bg="bg-white" />
        <StatCard
          label="En ligne"
          value={animatedEnLigne}  // ← CHANGEMENT : stats.en_ligne → animatedEnLigne
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          label="Hors ligne"
          value={animatedHorsLigne}  // ← CHANGEMENT : stats.hors_ligne → animatedHorsLigne
          color="text-red-500"
          bg="bg-red-50"
        />
      </div>

      {/* ── Barre actions ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <h2 className="text-[16px] font-bold text-gray-700 shrink-0">
            Liste des agents
          </h2>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-xs outline-none border border-transparent focus:border-[#FF6600] focus:bg-white transition-colors"
            />
          </div>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-5 py-[10px] bg-[#FF6600] hover:bg-orange-700 text-white rounded-xl font-bold text-[13px] transition-colors w-full sm:w-auto justify-center sm:justify-start"
        >
          <UserPlus size={16} /> Ajouter un agent
        </button>
      </div>

      {/* ── Erreur ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-600 text-sm mb-5 flex justify-between">
          <span>⚠️ {error}</span>
          <button onClick={load} className="font-bold underline">
            Réessayer
          </button>
        </div>
      )}

      {/* ── Tableau ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1e2a3a]">
                {[
                  "NO.",
                  "NOM",
                  "EMAIL",
                  "TÉLÉPHONE",
                  "ADRESSE",
                  "KIOSQUE",
                  "STATUT",
                  "ACTIONS",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-4 text-left text-[11px] font-bold text-white/70 uppercase tracking-[0.08em] whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-16 text-gray-400 text-sm"
                  >
                    ⏳ Chargement…
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-16 text-gray-400 text-sm"
                  >
                    Aucun agent trouvé
                  </td>
                </tr>
              ) : paginatedAgents.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-16 text-gray-400 text-sm"
                  >
                    Aucun agent ne correspond à votre recherche
                  </td>
                </tr>
              ) : (
                paginatedAgents.map((a, i) => (
                  <tr
                    key={a.id}
                    className={[
                      "border-t border-gray-100 hover:bg-gray-50 transition-colors",
                      i % 2 === 0 ? "" : "bg-gray-50/50",
                    ].join(" ")}
                  >
                    <td className="px-4 py-4 text-[13px] font-bold text-gray-400">
                      {startIdx + i + 1}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-[13px] text-gray-900">
                        {a.nom}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-gray-500">
                      {a.email}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-gray-500">
                      {a.telephone}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-gray-500">{a.adresse}</td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 bg-orange-100 text-[#FF6600] rounded-full text-[11px] font-bold">
                        {a.kiosque?.nom_kiosque ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={[
                          "flex items-center gap-1 w-fit px-3 py-1 rounded-full text-[11px] font-bold",
                          a.est_en_ligne
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-500",
                        ].join(" ")}
                      >
                        {a.est_en_ligne ? (
                          <Wifi size={11} />
                        ) : (
                          <WifiOff size={11} />
                        )}
                        {a.est_en_ligne ? "En ligne" : "Hors ligne"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {/* ✅ Bouton Modifier */}
                        <button
                          onClick={() => setEditAgent(a)}
                          className="w-8 h-8 rounded-full border-2 border-blue-300 text-blue-400 hover:bg-blue-50 flex items-center justify-center transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        {/* Bouton Supprimer */}
                        <button
                          onClick={() => handleDelete(a)}
                          className="w-8 h-8 rounded-full border-2 border-red-300 text-red-400 hover:bg-red-50 flex items-center justify-center transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredAgents.length > ITEMS_PER_PAGE && (
        <div className="bg-white rounded-2xl px-6 py-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-gray-100">

          {/* Info */}
          <p className="text-sm text-gray-500">
            Affichage{" "}
            <span className="font-semibold text-gray-800">{startIdx + 1}</span>
            {" "}&agrave;{" "}
            <span className="font-semibold text-gray-800">{Math.min(endIdx, filteredAgents.length)}</span>
            {" "}sur{" "}
            <span className="font-semibold text-[#FF6600]">{filteredAgents.length}</span>
            {" "}agent{filteredAgents.length > 1 ? "s" : ""}
          </p>

          {/* Boutons */}
          <div className="flex items-center gap-1">

            {/* Précédent */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="hidden sm:inline">Pr&eacute;c&eacute;dent</span>
            </button>

            {/* Numéros de pages avec ellipsis */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const delta = 1;
                const left  = currentPage - delta;
                const right = currentPage + delta;

                let prev = null;
                for (let p = 1; p <= totalPages; p++) {
                  if (p === 1 || p === totalPages || (p >= left && p <= right)) {
                    if (prev !== null && p - prev > 1) {
                      pages.push("...");
                    }
                    pages.push(p);
                    prev = p;
                  }
                }

                return pages.map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm select-none">
                      &hellip;
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                        currentPage === p
                          ? "bg-[#FF6600] text-white shadow-md shadow-orange-200 scale-105"
                          : "text-gray-600 border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-200 hover:text-[#FF6600]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                );
              })()}
            </div>

            {/* Suivant */}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span className="hidden sm:inline">Suivant</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

          </div>
        </div>
      )}

      {/* ── Modal création ──────────────────────────────────────────────── */}
      {modal && (
        <AgentModal
          kiosques={kiosques}
          onClose={() => setModal(false)}
          onSave={handleCreate}
        />
      )}

      {/* ── Modal modification ──────────────────────────────────────────── */}
      {editAgent && (
        <AgentEditModal
          agent={editAgent}
          kiosques={kiosques}
          onClose={() => setEditAgent(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}

// ── Modal création ────────────────────────────────────────────────────────────
function AgentModal({ kiosques, onClose, onSave }) {
  const VIDE = {
    nom: "",
    email: "",
    password: "",
    telephone: "+242 ",
    adresse: "",
    id_kiosque: "",
    statut: "actif",
  };
  const [form, setForm] = useState(VIDE);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (
      !form.nom ||
      !form.email ||
      !form.password ||
      !form.telephone ||
      !form.adresse ||
      !form.id_kiosque
    ) {
      Swal.fire(
        "Champs manquants",
        "Veuillez remplir tous les champs.",
        "warning",
      );
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <ModalWrapper
      onClose={onClose}
      title="Ajouter un agent"
      subtitle="Créer un compte agent et l'attacher à un kiosque"
    >
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        <Field icon={<User size={18} />} label="Nom complet">
          {" "}
          <input
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            placeholder="Ex: Agent MABALA"
            className={inputCls}
          />
        </Field>
        <Field icon={<Mail size={18} />} label="Email">
          {" "}
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="Ex: mabala@bomba.cg"
            className={inputCls}
          />
        </Field>
        <Field icon={<Lock size={18} />} label="Mot de passe">
          {" "}
          <input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Min. 6 caractères"
            className={inputCls}
          />
        </Field>
        <Field icon={<Phone size={18} />} label="Téléphone">
          {" "}
          <input
            value={form.telephone}
            onChange={(e) => set("telephone", e.target.value)}
            placeholder="+242 XX XXX XXXX"
            className={inputCls}
          />
        </Field>
        <Field icon={<MapPin size={18} />} label="Adresse">
          {" "}
          <input
            value={form.adresse}
            onChange={(e) => set("adresse", e.target.value)}
            placeholder="Ex: Marché Total, Pointe-Noire"
            className={inputCls}
          />
        </Field>
        <Field icon={<Store size={18} />} label="Kiosque">
          <select
            value={form.id_kiosque}
            onChange={(e) => set("id_kiosque", e.target.value)}
            className={inputCls}
          >
            <option value="">— Sélectionner un kiosque —</option>
            {kiosques.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nom_kiosque} — {k.ville}
              </option>
            ))}
          </select>
        </Field>
        <Field icon={<UserCheck size={18} />} label="Statut du compte">
          <div className="flex gap-3 mt-1">
            {[
              { val: "actif", label: "Actif", cls: "bg-green-500 text-white" },
              {
                val: "inactif",
                label: "Inactif",
                cls: "bg-red-400 text-white",
              },
            ].map((s) => (
              <button
                key={s.val}
                type="button"
                onClick={() => set("statut", s.val)}
                className={[
                  "flex-1 py-[10px] rounded-xl text-[13px] font-bold transition-all",
                  form.statut === s.val
                    ? s.cls
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200",
                ].join(" ")}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <ModalFooter
        onClose={onClose}
        onSave={handleSave}
        saving={saving}
        saveLabel="Créer l'agent"
        savingLabel="Création..."
      />
    </ModalWrapper>
  );
}

// ── Modal modification ────────────────────────────────────────────────────────
function AgentEditModal({ agent, kiosques, onClose, onSave }) {
  const [form, setForm] = useState({
    id: agent.id,
    nom: agent.nom,
    email: agent.email,
    password: "",
    telephone: agent.telephone,
    adresse: agent.adresse,
    id_kiosque: agent.kiosque?.id ?? "",
    statut: agent.statut ?? "actif",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (
      !form.nom ||
      !form.email ||
      !form.telephone ||
      !form.adresse ||
      !form.id_kiosque
    ) {
      Swal.fire(
        "Champs manquants",
        "Veuillez remplir tous les champs.",
        "warning",
      );
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <ModalWrapper
      onClose={onClose}
      title="Modifier l'agent"
      subtitle={`Modification de ${agent.nom}`}
    >
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        <Field icon={<User size={18} />} label="Nom complet">
          {" "}
          <input
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            placeholder="Nom complet"
            className={inputCls}
          />
        </Field>
        <Field icon={<Mail size={18} />} label="Email">
          {" "}
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="Email"
            className={inputCls}
          />
        </Field>
        <Field icon={<Lock size={18} />} label="Mot de passe (optionnel)">
          {" "}
          <input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Laisser vide pour ne pas changer"
            className={inputCls}
          />
        </Field>
        <Field icon={<Phone size={18} />} label="Téléphone">
          {" "}
          <input
            value={form.telephone}
            onChange={(e) => set("telephone", e.target.value)}
            placeholder="+242 XX XXX XXXX"
            className={inputCls}
          />
        </Field>
        <Field icon={<MapPin size={18} />} label="Adresse">
          {" "}
          <input
            value={form.adresse}
            onChange={(e) => set("adresse", e.target.value)}
            placeholder="Adresse"
            className={inputCls}
          />
        </Field>
        <Field icon={<Store size={18} />} label="Kiosque">
          <select
            value={form.id_kiosque}
            onChange={(e) => set("id_kiosque", e.target.value)}
            className={inputCls}
          >
            <option value="">— Sélectionner un kiosque —</option>
            {kiosques.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nom_kiosque} — {k.ville}
              </option>
            ))}
          </select>
        </Field>
        <Field icon={<UserCheck size={18} />} label="Statut du compte">
          <div className="flex gap-3 mt-1">
            {[
              { val: "actif", label: "Actif", cls: "bg-green-500 text-white" },
              {
                val: "inactif",
                label: "Inactif",
                cls: "bg-red-400 text-white",
              },
            ].map((s) => (
              <button
                key={s.val}
                type="button"
                onClick={() => set("statut", s.val)}
                className={[
                  "flex-1 py-[10px] rounded-xl text-[13px] font-bold transition-all",
                  form.statut === s.val
                    ? s.cls
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200",
                ].join(" ")}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <ModalFooter
        onClose={onClose}
        onSave={handleSave}
        saving={saving}
        saveLabel="Enregistrer"
        savingLabel="Enregistrement..."
      />
    </ModalWrapper>
  );
}

// ── Composants partagés ───────────────────────────────────────────────────────
function ModalWrapper({ onClose, title, subtitle, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-[480px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="bg-[#1e2a3a] px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-white font-black text-[17px] leading-none">
                {title}
              </h2>
              <p className="text-white/50 text-[12px] mt-[2px]">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onClose, onSave, saving, saveLabel, savingLabel }) {
  return (
    <div className="px-6 py-5 flex gap-3 border-t border-gray-100 shrink-0">
      <button
        onClick={onClose}
        className="flex-1 py-[14px] rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-[15px] hover:bg-gray-50 transition-colors"
      >
        Annuler
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className={[
          "flex-[2] py-[14px] rounded-2xl text-white font-bold text-[15px] transition-colors",
          saving
            ? "bg-gray-400 cursor-wait"
            : "bg-[#FF6600] hover:bg-orange-700",
        ].join(" ")}
      >
        {saving ? savingLabel : saveLabel}
      </button>
    </div>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div
      className={["h-full rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between", bg].join(
        " ",
      )}
    >
      <p className="text-[12px] text-gray-400 font-medium mb-2">{label}</p>
      <p className={["text-[26px] sm:text-[28px] font-black leading-none", color].join(" ")}>
        {String(value).padStart(2, "0")}
      </p>
    </div>
  );
}

function Field({ icon, label, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-[7px]">
        <span className="text-gray-500">{icon}</span>
        <label className="text-[14px] font-semibold text-gray-800">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-[13px] rounded-xl text-[14px] bg-gray-100 border-2 border-transparent focus:border-[#FF6600] focus:bg-white outline-none transition-colors";
