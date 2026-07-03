import { useState, useEffect } from "react";
import { Printer, Download, FileText, Info, X } from "lucide-react";
import api from "../../lib/axios";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const fmt = (n) => Number(n ?? 0).toLocaleString("fr-FR").replace(/\s/g, "\u00A0");
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
}[char]));

const opLabel = (type) => ({
  "dépôt_cash": "Dépôt cash",
  "retrait_partiel": "Retrait partiel",
  "retrait_solde_compte": "Retrait total",
}[type] || type || "");

function BadgeOp({ type }) {
  const map = {
    "dépôt_cash":           { label: "Dépôt cash",      bg: "bg-green-100 text-green-700"   },
    "retrait_partiel":      { label: "Retrait partiel", bg: "bg-orange-100 text-orange-700" },
    "retrait_solde_compte": { label: "Retrait total",   bg: "bg-red-100 text-red-600"       },
  };
  const { label, bg } = map[type] ?? { label: type, bg: "bg-gray-100 text-gray-600" };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bg}`}>{label}</span>;
}

function ModalDetail({ row, onClose }) {
  if (!row) return null;
  
  const depot   = row.type_op === "dépôt_cash" ? row.montant : 0;
  const retrait = row.type_op !== "dépôt_cash" ? row.montant : 0;
  const penalite = row.penalite || 0;
  const calcul = depot - retrait - penalite;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#FF6600] px-6 py-4">
          <p className="text-white font-bold text-xl">Détails du Calcul</p>
          <p className="text-white/90 text-sm mt-1">
            {row.nom_client} - {row.id_carte}
          </p>
        </div>

        {/* Corps du modal */}
        <div className="p-5 space-y-3">
          {/* Dépôt Cash */}
          <div className="flex justify-between items-center bg-green-50 border-l-4 border-green-500 rounded-lg px-4 py-3">
            <span className="text-sm text-gray-700 font-medium">Dépôt Cash</span>
            <span className="font-bold text-green-600 text-lg">+{fmt(depot)} XAF</span>
          </div>

          {/* Retrait Cash */}
          <div className="flex justify-between items-center bg-red-50 border-l-4 border-red-400 rounded-lg px-4 py-3">
            <span className="text-sm text-gray-700 font-medium">Retrait Cash</span>
            <span className="font-bold text-red-500 text-lg">-{fmt(retrait)} XAF</span>
          </div>

          {/* Frais de Pénalité */}
          <div className="flex justify-between items-center bg-purple-50 border-l-4 border-purple-400 rounded-lg px-4 py-3">
            <span className="text-sm text-gray-700 font-medium">Frais de Pénalité</span>
            <span className="font-bold text-purple-600 text-lg">-{fmt(penalite)} XAF</span>
          </div>

          {/* Ligne pointillée */}
          <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

          {/* Solde de Compte - Orange */}
          <div className="bg-[#FF6600] rounded-xl px-5 py-4 flex justify-between items-center shadow-md">
            <span className="text-white font-bold text-base">Solde de Compte</span>
            <span className="text-white font-extrabold text-2xl">{fmt(row.solde_apres)} XAF</span>
          </div>

          {/* Détail du calcul */}
          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg px-4 py-3 mt-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Calcul:</span> {fmt(depot)} - {fmt(retrait)} - {fmt(penalite)} = {fmt(calcul)} XAF
            </p>
          </div>
        </div>

        {/* Bouton Fermer */}
        <div className="px-5 pb-5">
          <button 
            onClick={onClose}
            className="w-full bg-[#1e2a3a] text-white py-3 rounded-xl font-semibold hover:bg-[#1e2a3a]/90 transition shadow-md">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MouvementCaisse() {
  const [transactions, setTransactions] = useState([]);
  const [filterOp, setFilterOp]         = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [totaux, setTotaux]             = useState({});
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState(null);

  useEffect(() => {
    api.get("/api/admin/mouvements-caisse")
      .then(({ data }) => {
        setTransactions(data.transactions ?? []);
        setTotaux(data.totaux ?? {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // --- Sécurité : Vérification des données ---
  const hasData = (action) => {
    if (filteredTransactions.length === 0) {
      Swal.fire("Action impossible", `Il n'y a aucune donnée à ${action}.`, "warning");
      return false;
    }
    return true;
  };

  // --- ACTIONS ---

  const handlePrint = () => {
    if (!hasData("imprimer")) return;
    Swal.fire({
      title: "Imprimer le tableau ?",
      text: "Seul le tableau des transactions sera imprimé.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FF6600",
      confirmButtonText: "Oui, imprimer",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) window.print();
    });
  };

  const exportPDF = () => {
    if (!hasData("exporter")) return;
    Swal.fire({
      title: "Exporter en PDF ?",
      text: "Voulez-vous générer le fichier PDF ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FF6600",
      confirmButtonText: "Oui, exporter",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) {
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        doc.text("Mouvement de Solde - Rapport", 14, 15);
        
        const tableColumn = ["ID Carte", "ID Client", "Opération", "Montant", "Pénalité", "Solde"];
        const tableRows = filteredTransactions.map(t => [
          t.id_carte,
          t.id_client,
          opLabel(t.type_op),
          `${t.type_op === "dépôt_cash" ? "+" : "-"}${fmt(t.montant)} XAF`,
          `${fmt(t.penalite)} XAF`,
          `${fmt(t.solde_apres)} XAF`
        ]);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 22,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [30, 42, 58], textColor: 255 }
        });

        doc.save(`mouvements_caisse_${new Date().getTime()}.pdf`);
      }
    });
  };

  const exportExcel = () => {
    if (!hasData("exporter")) return;
    Swal.fire({
      title: "Exporter en Excel ?",
      text: "Voulez-vous générer le fichier Excel ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FF6600",
      confirmButtonText: "Oui, exporter",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) {
        const worksheet = XLSX.utils.json_to_sheet(filteredTransactions);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
        XLSX.writeFile(workbook, "mouvements_caisse.xlsx");
      }
    });
  };

  // --- Filtre et pagination ---
  const filteredTransactions = transactions.filter(t => {
    if (filterOp && t.type_op !== filterOp) return false;
    return true;
  });

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIdx, endIdx);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterOp]);

  useEffect(() => {
    setCurrentPage(page => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <div className="printable-area">
      {/* ── Titre ─────────────────────────────────────────────────── */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1e2a3a]">Mouvement de Solde</h1>
        <p className="text-gray-500 text-sm mt-1">Suivi des opérations et calcul des soldes de compte</p>
      </div>

      {/* ── Actions (Hidden on Print) ─────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between mb-5 shadow-sm no-print">
        {/* Filtre type d'opération */}
        <div className="flex items-center gap-2">
          <select
            value={filterOp}
            onChange={(e) => setFilterOp(e.target.value)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold outline-none transition-colors border-none cursor-pointer min-w-[200px]"
          >
            <option value="">Toutes les opérations</option>
            <option value="dépôt_cash">Dépôt cash</option>
            <option value="retrait_partiel">Retrait partiel</option>
            <option value="retrait_solde_compte">Retrait total</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 border border-[#1e2a3a] text-[#1e2a3a] px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 text-xs sm:text-sm font-medium">
            <Printer size={15} /> <span className="hidden sm:inline">Imprimer</span>
          </button>
          <button 
            type="button"
            onClick={exportPDF}
            className="flex items-center gap-2 border border-red-500 text-red-500 px-3 sm:px-4 py-2 rounded-lg hover:bg-red-50 text-xs sm:text-sm font-medium">
            <FileText size={15} /> <span className="hidden sm:inline">Exporter PDF</span><span className="sm:hidden">PDF</span>
          </button>
          <button 
            type="button"
            onClick={exportExcel}
            className="flex items-center gap-2 border border-green-600 text-green-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-green-50 text-xs sm:text-sm font-medium">
            <Download size={15} /> <span className="hidden sm:inline">Exporter Excel</span><span className="sm:hidden">Excel</span>
          </button>
        </div>
      </div>

      {/* ── Tableau ───────────────────────────────────────────────── */}
      {/* 👇 AJOUT DE L'ID print-table pour le CSS d'impression global */}
      <div id="print-table" className="print-table-wrapper bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-[#1e2a3a] text-white text-xs uppercase">
                <th className="px-4 py-4 text-left">ID Carte</th>
                <th className="px-4 py-4 text-left">ID Client</th>
                <th className="px-4 py-4 text-left">Opération</th>
                <th className="px-4 py-4 text-right">Montant</th>
                <th className="px-4 py-4 text-right hidden md:table-cell">Frais Garde</th>
                <th className="px-4 py-4 text-right hidden md:table-cell">Pénalité</th>
                <th className="px-4 py-4 text-right">Solde</th>
                <th className="px-4 py-4 text-center no-print">Info</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Chargement…</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Aucune transaction correspondante</td></tr>
              ) : paginatedTransactions.map((t, i) => {
                const isPositif = t.type_op === "dépôt_cash";
                return (
                  <tr key={t.id_trans} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-bold text-[#FF6600]">{t.id_carte}</td>
                    <td className="px-4 py-3 text-gray-600">{t.id_client}</td>
                    <td className="px-4 py-3"><BadgeOp type={t.type_op} /></td>
                    <td className={`px-4 py-3 text-right font-bold ${isPositif ? "text-green-600" : "text-red-500"}`}>
                      {isPositif ? "+" : "-"}{fmt(t.montant)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{fmt(t.frais_garde)}</td>
                    <td className="px-4 py-3 text-right text-red-500 font-medium hidden md:table-cell">
                      {t.penalite > 0 ? fmt(t.penalite) : "–"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full text-xs">
                        {fmt(t.solde_apres)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center no-print">
                      <button onClick={() => setSelected(t)}
                        className="border border-blue-400 text-blue-500 rounded-lg p-1.5 hover:bg-blue-50">
                        <Info size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > ITEMS_PER_PAGE && (
        <div className="bg-white rounded-2xl px-6 py-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-gray-100 no-print mb-5">

          {/* Info */}
          <p className="text-sm text-gray-500">
            Affichage{" "}
            <span className="font-semibold text-gray-800">{startIdx + 1}</span>
            {" "}&agrave;{" "}
            <span className="font-semibold text-gray-800">{Math.min(endIdx, filteredTransactions.length)}</span>
            {" "}sur{" "}
            <span className="font-semibold text-[#FF6600]">{filteredTransactions.length}</span>
            {" "}op&eacute;ration{filteredTransactions.length > 1 ? "s" : ""}
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

      {/* ── Totaux ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-[#1e2a3a] text-lg mb-4 border-b pb-3">Détails des montants</h2>
          <div className="grid grid-cols-1 gap-3">
            <div className="border-l-4 border-green-500 bg-green-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-xs text-gray-500 uppercase font-semibold">Total dépôt cash</span>
              <span className="font-extrabold text-green-600 text-lg">{fmt(totaux.total_depot)} XAF</span>
            </div>
            <div className="border-l-4 border-red-400 bg-red-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-xs text-gray-500 uppercase font-semibold">Total retrait</span>
              <span className="font-extrabold text-red-500 text-lg">{fmt(totaux.total_retrait)} XAF</span>
            </div>
            <div className="border-l-4 border-purple-400 bg-purple-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-xs text-gray-500 uppercase font-semibold">Total pénalité</span>
              <span className="font-bold text-purple-600">{fmt(totaux.total_penalite)} XAF</span>
            </div>
          </div>
        </div>

        <div className="bg-[#FF6600] rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm text-white">
          <p className="text-white/80 text-xs uppercase tracking-widest mb-2 text-center font-bold">Total Solde de Compte</p>
          <p className="font-extrabold text-3xl sm:text-4xl">{fmt(totaux.total_solde)}</p>
          <p className="mt-1 text-white/80 text-sm">XAF</p>
        </div>
      </div>

      <ModalDetail row={selected} onClose={() => setSelected(null)} />

      {/* ✅ Styles CSS pour l'impression — UNIQUEMENT LE TABLEAU */}
      <style>{`
        @media print {
          /* 1. Cacher tout par défaut */
          body { margin: 0; background: white; }
          body * { visibility: hidden; }
          
          /* 2. Afficher uniquement le tableau */
          .print-table-wrapper,
          .print-table-wrapper * { visibility: visible !important; }
          .print-table-wrapper {
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10px 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }

          /* 3. Masquer explicitement les éléments non désirés */
          .no-print,
          .printable-area > div:first-child,
          .printable-area > div:nth-child(2),
          .printable-area > div:last-child { display: none !important; }

          /* 4. Mise en forme du tableau pour l'impression */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10pt;
            page-break-inside: auto;
          }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; }
          th, td {
            border: 1px solid #333 !important;
            padding: 6px 8px !important;
            text-align: left;
          }
          th {
            background-color: #1e2a3a !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Afficher les colonnes masquées sur mobile */
          .hidden { display: table-cell !important; }
        }
      `}</style>
    </div>
  );
}
