// src/pages/admin/KiosqueDetail.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  Printer, Download, ArrowLeft, Store, MapPin,
  Phone, Users, Info, Trash2, Wifi, WifiOff,
} from "lucide-react";

export default function KiosqueDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [kiosque,  setKiosque]  = useState(null);
  const [agents,   setAgents]   = useState([]);
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: k }, { data: a }] = await Promise.all([
          api.get(`/api/admin/kiosques/${id}`),
          api.get(`/api/admin/kiosques/${id}/agents`),
        ]);
        setKiosque(k.data);
        setAgents(a.data ?? []);
        if (a.data?.length > 0) {
          const { data: c } = await api.get(`/api/admin/clients?id_kiosque=${id}`);
          setClients(c.data ?? []);
        }
      } catch {
        Swal.fire("Erreur", "Impossible de charger les données.", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Toggle statut ───────────────────────────────────────────────────────────
  const handleToggle = async () => {
    const isActif   = kiosque.statut_service === "actif";
    const newStatut = isActif ? "inactif" : "actif";

    const result = await Swal.fire({
      title: isActif ? "Geler ce kiosque ?" : "Activer ce kiosque ?",
      html: isActif
        ? `Êtes-vous sûr de vouloir geler <strong>${kiosque.nom_kiosque}</strong> ?`
        : `Êtes-vous sûr de vouloir activer <strong>${kiosque.nom_kiosque}</strong> ?`,
      icon: isActif ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: "Confirmer",
      cancelButtonText: "Annuler",
      confirmButtonColor: isActif ? "#ef4444" : "#22c55e",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;
    setToggling(true);
    try {
      const { data: res } = await api.patch(`/api/admin/kiosques/${id}/statut`, { statut_service: newStatut });
      setKiosque(res.data);
      Swal.fire({ icon: "success", title: newStatut === "actif" ? "Kiosque activé !" : "Kiosque gelé !", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire("Erreur", "Impossible de modifier le statut.", "error");
    } finally {
      setToggling(false);
    }
  };

  // ── Supprimer client ────────────────────────────────────────────────────────
  const handleDeleteClient = async (client) => {
    const result = await Swal.fire({
      title: "Supprimer ce client ?",
      html: `<strong>${client.prenom} ${client.nom}</strong> sera définitivement supprimé.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/api/admin/clients/${client.id}`);
      setClients(prev => prev.filter(c => c.id !== client.id));
      Swal.fire({ icon: "success", title: "Client supprimé !", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire("Erreur", "Impossible de supprimer ce client.", "error");
    }
  };

  // ── Export Excel ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const data = clients.map((c, i) => ({
      "No."        : i + 1,
      "Nom"        : c.nom,
      "Prénom"     : c.prenom,
      "Adresse"    : c.adresse,
      "Ville"      : c.ville,
      "Téléphone"  : c.telephone,
      "Nationalité": c.nationalite,
      "Type pièce" : c.type_piece,
      "N° pièce"   : c.num_piece,
      "Activité"   : c.activite,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, `clients_${kiosque.nom_kiosque}.xlsx`);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-gray-400 text-sm">⏳ Chargement...</div>;
  }

  if (!kiosque) return null;

  const isActif   = kiosque.statut_service === "actif";
  const agent     = agents[0] ?? null;
  const nbClients = clients.length;

  return (
    <div>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/kiosques")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-[13px] hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} /> Retour
        </button>
        <div>
          <h1 className="text-[22px] font-black text-gray-900 leading-none">Profil du Kiosque</h1>
          <p className="text-gray-400 text-sm mt-[2px]">Détails et gestion des clients</p>
        </div>
      </div>

      {/* ── Bannière kiosque ─────────────────────────────────────────────── */}
      <div className="bg-[#FF6600] rounded-2xl px-8 py-6 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white">
            <Store size={32} />
          </div>
          <div>
            <h2 className="text-white text-[22px] font-black leading-none">{kiosque.nom_kiosque}</h2>
            <p className="text-white/70 text-sm mt-1">Code : {kiosque.code_kiosque}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={["flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[13px]", isActif ? "bg-white text-green-600" : "bg-white text-red-500"].join(" ")}>
            {isActif ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isActif ? "En ligne" : "Hors ligne"}
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={["relative w-14 h-8 rounded-full transition-colors duration-200", isActif ? "bg-green-500" : "bg-gray-400", toggling ? "opacity-50 cursor-wait" : "cursor-pointer"].join(" ")}
          >
            <span className={["absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all duration-200", isActif ? "left-7" : "left-1"].join(" ")} />
          </button>
        </div>
      </div>

      {/* ── Détails agent ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-[16px] font-black text-gray-800 mb-4">Détails de l'agent</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailCard icon={<Users size={18} />} label="Agent responsable"   value={agent ? agent.nom : "—"}              sub={agent?.telephone} />
          <DetailCard icon={<MapPin size={18} />} label="Adresse du kiosque" value={kiosque.adresse}                      sub={kiosque.ville} />
          <DetailCard icon={<Phone size={18} />}  label="Téléphone"          value={kiosque.telephone ?? "Non renseigné"} />
          <DetailCard icon={<Store size={18} />}  label="Clients enregistrés" value={`${nbClients} client${nbClients > 1 ? "s" : ""}`} />
        </div>
      </div>

      {/* ── Tableau clients ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" id="print-table">
        <div className="bg-[#FF6600] px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-black text-[16px]">Cartes Clients</h3>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border-2 border-white text-white rounded-xl text-[13px] font-bold hover:bg-white/20 transition-colors"
            >
              <Printer size={15} /> Imprimer
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border-2 border-white text-white rounded-xl text-[13px] font-bold hover:bg-white/20 transition-colors"
            >
              <Download size={15} /> Exporter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-orange-50">
                {["No.", "NOM ET PRÉNOM", "ADRESSE", "TÉLÉPHONE", "STATUT", "ACTIONS"].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-[11px] font-bold text-[#FF6600] uppercase tracking-wide">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Aucun client enregistré pour ce kiosque</td>
                </tr>
              ) : (
                clients.map((c, i) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-[13px] font-bold text-gray-500">{i + 1}</td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-[13px] text-gray-900">{c.nom} {c.prenom}</p>
                      <p className="text-[11px] text-gray-400">{c.num_piece}</p>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-gray-600">{c.adresse}, {c.ville}</td>
                    <td className="px-4 py-4 text-[13px] text-gray-600">{c.telephone}</td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[11px] font-bold">Active</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => Swal.fire({
                            title: `${c.prenom} ${c.nom}`,
                            html: `<div style="text-align:left;font-size:14px;line-height:2">
                              <b>Genre :</b> ${c.genre}<br/>
                              <b>Nationalité :</b> ${c.nationalite}<br/>
                              <b>Pièce :</b> ${c.type_piece} — ${c.num_piece}<br/>
                              <b>Activité :</b> ${c.activite}<br/>
                              <b>Téléphone :</b> ${c.telephone}<br/>
                              <b>Adresse :</b> ${c.adresse}, ${c.ville}
                            </div>`,
                            confirmButtonColor: "#FF6600",
                          })}
                          className="w-8 h-8 rounded-full border-2 border-blue-300 text-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors"
                        >
                          <Info size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(c)}
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

    </div>
  );
}

function DetailCard({ icon, label, value, sub }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
      <span className="text-[#FF6600] mt-[2px]">{icon}</span>
      <div>
        <p className="text-[12px] text-gray-400 font-medium">{label}</p>
        <p className="text-[15px] font-bold text-gray-900 mt-[2px]">{value}</p>
        {sub && <p className="text-[12px] text-gray-400 mt-[1px]">{sub}</p>}
      </div>
    </div>
  );
}