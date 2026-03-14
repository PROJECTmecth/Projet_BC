// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/pages/admin/ProfilAdminPage.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Shield, CheckCircle, Eye, EyeOff, Edit2, Save, X, LogOut, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "../../lib/axios";
import Toast from "../../components/ui/Toast";
import { Button } from "../../components/ui/button";

// ── Avatar initiales ──────────────────────────────────────────────────────────
function Avatar({ name, size = "lg" }) {
  const initiales = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const sizes = { lg: "w-24 h-24 text-3xl", md: "w-14 h-14 text-xl", sm: "w-10 h-10 text-sm" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}>
      {initiales}
    </div>
  );
}

// ── Champ éditable ────────────────────────────────────────────────────────────
function ChampEditable({ label, value, onSave, type = "text", icon: Icon, readOnly = false }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (val === value) { setEditing(false); return; }
    setLoading(true);
    await onSave(val);
    setLoading(false);
    setEditing(false);
  }

  return (
    <div className="group">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
        editing ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-gray-50"
      } ${readOnly ? "opacity-70" : ""}`}>
        <Icon size={18} className={editing ? "text-orange-500" : "text-gray-400"} />
        {editing ? (
          <input
            type={type}
            value={val}
            onChange={e => setVal(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-800 font-medium text-sm"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-gray-800 font-medium text-sm">{value || "—"}</span>
        )}
        {!readOnly && (
          editing ? (
            <div className="flex items-center gap-1">
              <button onClick={handleSave} disabled={loading}
                className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white transition-all">
                {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={13} />}
              </button>
              <button onClick={() => { setEditing(false); setVal(value); }}
                className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-all">
                <X size={13} />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)}
              className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 bg-gray-200 hover:bg-orange-100 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-all">
              <Edit2 size={13} />
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ── Champ mot de passe ────────────────────────────────────────────────────────
function ChampMotDePasse({ onSave }) {
  const [open, setOpen]       = useState(false);
  const [actuel, setActuel]   = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmer, setConf]  = useState("");
  const [showA, setShowA]     = useState(false);
  const [showN, setShowN]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur]   = useState("");

  async function handleSave() {
    if (!actuel || !nouveau || !confirmer) { setErreur("Tous les champs sont requis."); return; }
    if (nouveau !== confirmer) { setErreur("Les mots de passe ne correspondent pas."); return; }
    if (nouveau.length < 8) { setErreur("Minimum 8 caractères requis."); return; }
    setErreur("");
    setLoading(true);
    const ok = await onSave({ current_password: actuel, password: nouveau, password_confirmation: confirmer });
    setLoading(false);
    if (ok) { setOpen(false); setActuel(""); setNouveau(""); setConf(""); }
    else setErreur("Mot de passe actuel incorrect.");
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Mot de passe</label>
      {!open ? (
        <div onClick={() => setOpen(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all group">
          <Lock size={18} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
          <span className="flex-1 text-gray-400 text-sm">••••••••</span>
          <span className="text-xs font-semibold text-orange-500 opacity-0 group-hover:opacity-100 transition-all">Modifier →</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="border-2 border-orange-300 bg-orange-50 rounded-xl p-4 space-y-3">
          {[
            { label: "Mot de passe actuel", val: actuel, setVal: setActuel, show: showA, setShow: setShowA },
            { label: "Nouveau mot de passe", val: nouveau, setVal: setNouveau, show: showN, setShow: setShowN },
            { label: "Confirmer le nouveau", val: confirmer, setVal: setConf, show: showN, setShow: setShowN },
          ].map(({ label, val, setVal, show, setShow }, i) => (
            <div key={i}>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
                <Lock size={14} className="text-gray-400" />
                <input type={show ? "text" : "password"} value={val} onChange={e => setVal(e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-800" placeholder="••••••••" />
                <button onClick={() => setShow(!show)} className="text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          {erreur && <p className="text-xs text-red-500 font-medium">{erreur}</p>}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold h-9">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Enregistrer"}
            </Button>
            <Button onClick={() => { setOpen(false); setErreur(""); }} variant="outline"
              className="border-2 border-gray-300 text-gray-600 rounded-lg text-sm h-9">
              Annuler
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Modal confirmation déconnexion ────────────────────────────────────────────
function ConfirmLogoutModal({ isOpen, onConfirm, onCancel, userName }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white rounded-[24px] shadow-2xl p-8 max-w-sm w-full mx-4 z-10"
      >
        {/* Icône */}
        <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4">
          <LogOut className="h-8 w-8 text-orange-500" />
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
          À bientôt, {userName} !
        </h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          Vous êtes sur le point de vous déconnecter de <span className="font-bold text-orange-500">BOMBA CASH</span>. Toutes vos données sont sauvegardées.
        </p>

        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline"
            className="flex-1 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold">
            Rester connecté
          </Button>
          <Button onClick={onConfirm}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold">
            <LogOut size={16} className="mr-1" />
            Se déconnecter
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ProfilAdminPage() {
  const { user, login, logout } = useAuth();
  const navigate                = useNavigate();
  const [toast, setToast]       = useState({ msg: "", type: "success" });
  const [confirmLogout, setConfirmLogout] = useState(false);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "" }), 3500);
  }

  // ── Mettre à jour profil ──────────────────────────────────────────────────
  async function handleUpdate(champ, valeur) {
    try {
      const response = await axios.put("/api/admin/profil", { [champ]: valeur });
      if (response.data.success) {
        login({ ...user, [champ]: valeur });
        showToast("Profil mis à jour avec succès.");
      }
    } catch (err) {
      showToast("Erreur lors de la mise à jour.", "error");
    }
  }

  // ── Changer mot de passe ──────────────────────────────────────────────────
  async function handleChangePassword(data) {
    try {
      const response = await axios.put("/api/admin/profil/password", data);
      if (response.data.success) {
        showToast("Mot de passe modifié avec succès.");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // ── Déconnexion ───────────────────────────────────────────────────────────
  async function handleLogout() {
    try {
      await axios.post("/logout");
    } catch {}
    logout();
    navigate("/login");
  }

  const badgeRole   = user?.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";
  const badgeStatut = user?.statut === "actif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600";

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">

      <Toast msg={toast.msg} type={toast.type} />

      {/* Modal déconnexion */}
      <AnimatePresence>
        <ConfirmLogoutModal
          isOpen={confirmLogout}
          userName={user?.name || "Admin"}
          onConfirm={handleLogout}
          onCancel={() => setConfirmLogout(false)}
        />
      </AnimatePresence>

      {/* Titre */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
          <p className="text-gray-500 mt-1 text-sm">Gérez vos informations personnelles</p>
        </div>
        {/* Bouton déconnexion */}
        <button
          onClick={() => setConfirmLogout(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all font-semibold text-sm"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>

      {/* Carte identité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-[24px] shadow-xl overflow-hidden"
      >
        <div className="h-24 w-full" style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }} />
        <div className="px-8 pb-8">
          <div className="flex items-end gap-5 -mt-12 mb-6">
            <div className="ring-4 ring-white rounded-full shadow-lg">
              <Avatar name={user?.name} size="lg" />
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-gray-800">{user?.name || "—"}</h2>
              <p className="text-sm text-gray-500">{user?.email || "—"}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeRole}`}>
              <Shield size={11} className="inline mr-1" />
              {user?.role === "admin" ? "Administrateur" : "Agent"}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeStatut}`}>
              <CheckCircle size={11} className="inline mr-1" />
              {user?.statut === "actif" ? "Compte actif" : "Compte inactif"}
            </span>
          </div>

          {/* Champs éditables */}
          <div className="space-y-4">
            <ChampEditable label="Nom d'utilisateur" value={user?.name || ""} icon={User}
              onSave={val => handleUpdate("name", val)} />
            <ChampEditable label="Adresse email" value={user?.email || ""} icon={Mail} type="email"
              onSave={val => handleUpdate("email", val)} />
            <ChampMotDePasse onSave={handleChangePassword} />
          </div>
        </div>
      </motion.div>

      {/* Infos lecture seule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-white rounded-[24px] shadow-xl p-8"
      >
        <h3 className="text-base font-bold text-gray-700 mb-4">Informations du compte</h3>
        <div className="space-y-4">
          <ChampEditable label="Rôle" value={user?.role === "admin" ? "Administrateur" : "Agent"}
            icon={Shield} readOnly onSave={() => {}} />
          <ChampEditable label="Statut du compte" value={user?.statut === "actif" ? "Actif" : "Inactif"}
            icon={CheckCircle} readOnly onSave={() => {}} />
        </div>
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium">
            ℹ️ Le rôle et le statut sont gérés par l'administrateur principal. Contactez le support pour toute modification.
          </p>
        </div>
      </motion.div>

    </div>
  );
}