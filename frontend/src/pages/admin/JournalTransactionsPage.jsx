// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/pages/admin/JournalTransactionsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Printer, Download, FileText, Calendar, Inbox, RotateCw, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import Toast from "../../components/ui/Toast";
import { useTransactionJournal } from "../../hooks/useTransactionJournal";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";

const COLONNES = [
  "DATE", "NOM & PRÉNOM", "OPÉRATION",
  "MONTANT (XAF)", "HEURE", "TÉLÉPHONE",
  "KIOSQUE", "NOM AGENT",
];

function BadgeOperation({ operation }) {
  const styles = {
    "Dépôt":           "bg-green-100 text-green-700",
    "Retrait partiel": "bg-orange-100 text-orange-700",
    "Retrait total":   "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${styles[operation] || "bg-gray-100 text-gray-600"}`}>
      {operation}
    </span>
  );
}

function formatMontant(montant) {
  if (montant === undefined || montant === null) return "0";
  return montant.toLocaleString("fr-FR").replace(/\s/g, "\u00A0");
}

const PAGE_SIZE = 15;

export default function JournalTransactionsPage() {

  // 📊 Hook pour le journal - ENTIÈREMENT DYNAMIQUE
  const {
    transactions,
    pagination,
    stats,
    filters,
    sortBy,
    sortOrder,
    loading,
    error,
    handlePageChange,
    handleLimitChange,
    handleSort,
    handleFilterChange,
    handleResetFilters,
    handleRefresh,
  } = useTransactionJournal(true, 30000); // true = enable polling, 30000ms = 30 secondes

  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [localFilters, setLocalFilters] = useState({
    date_from: null,
    date_to: null,
    type: null,
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "" }), 3500);
  };

  const handleApplyFilters = () => {
    handleFilterChange({
      date_from: localFilters.date_from || null,
      date_to: localFilters.date_to || null,
      type: localFilters.type || null,
      search: searchInput || null,
    });
    showToast("Filtres appliqués");
  };

  const handleRefreshPage = async () => {
    setIsRefreshing(true);
    await handleRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
    showToast("Données actualisées");
  };

  const handlePrint = () => {
    if (transactions.length === 0) { showToast("Aucune donnée à imprimer.", "error"); return; }
    const fenetre = window.open("", "_blank");
    const rows = transactions.map(tx => `
      <tr>
        <td>${tx.date}</td><td><strong>${tx.nom}</strong></td><td>${tx.operation}</td>
        <td style="text-align:right;color:${tx.operation.toLowerCase().includes('dépôt') ? "green" : "red"}">
          ${tx.operation.toLowerCase().includes('dépôt') ? "+" : "-"}${formatMontant(tx.montant)}
        </td>
        <td>${tx.heure}</td><td>${tx.telephone}</td><td>${tx.kiosque}</td><td>${tx.agent}</td>
      </tr>`).join("");
    fenetre.document.write(`<!DOCTYPE html><html><head><title>Journal</title>
      <style>body{font-family:Arial;font-size:12px}h1{color:#F97316}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th{background:#4A4A4A;color:white;padding:8px;text-align:left;font-size:11px}
      td{padding:8px;border-bottom:1px solid #E5E7EB;font-size:11px}
      @media print{body{margin:0}}</style></head><body>
      <h1>BOMBA CASH — Journal de Transaction</h1>
      <p>Période : du ${localFilters.date_from || "..."} au ${localFilters.date_to || "..."} | Généré le ${new Date().toLocaleDateString("fr-FR")}</p>
      <table><thead><tr>
        <th>DATE</th><th>NOM & PRÉNOM</th><th>OPÉRATION</th><th>MONTANT (XAF)</th>
        <th>HEURE</th><th>TÉLÉPHONE</th><th>KIOSQUE</th><th>NOM AGENT</th>
      </tr></thead><tbody>${rows}</tbody></table></body></html>`);
    fenetre.document.close();
    setTimeout(() => { fenetre.print(); fenetre.close(); }, 500);
    showToast("Impression lancée.");
  };

  const handleExportPDF = async () => {
    if (transactions.length === 0) {
      showToast("Aucune donnée à exporter.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Exporter en PDF ?",
      text: "Voulez-vous générer le rapport PDF du journal de transactions ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#F97316",
      confirmButtonText: "Oui, exporter",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const dateLabel = `${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    const totalTransactions = transactions.length;
    const totalDepots = transactions.filter((tx) => tx.operation?.toLowerCase().includes("dépôt")).length;
    const totalRetraits = totalTransactions - totalDepots;

    doc.setFillColor(249, 115, 22);
    doc.roundedRect(10, 8, pageWidth - 20, 22, 2.5, 2.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("BOMBA CASH — Journal de Transaction", 14, 19);

    doc.setTextColor(70, 70, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Période : ${localFilters.date_from || "..."} au ${localFilters.date_to || "..."}`, 14, 35);
    doc.text(`Généré le ${dateLabel}`, pageWidth - 14, 35, { align: "right" });
    doc.text(`Transactions : ${totalTransactions}  •  Dépôts : ${totalDepots}  •  Retraits : ${totalRetraits}`, 14, 41);

    doc.autoTable({
      startY: 48,
      head: [["DATE", "NOM & PRÉNOM", "OPÉRATION", "MONTANT (XAF)", "HEURE", "TÉLÉPHONE", "KIOSQUE", "NOM AGENT"]],
      body: transactions.map((tx) => [
        tx.date,
        tx.nom,
        tx.operation,
        `${tx.operation?.toLowerCase().includes("dépôt") ? "+" : "-"}${formatMontant(tx.montant)}`,
        tx.heure,
        tx.telephone,
        tx.kiosque,
        tx.agent,
      ]),
      theme: "grid",
      headStyles: { fillColor: [74, 74, 74], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: [60, 60, 60] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { cellPadding: 1.8, overflow: "linebreak" },
      margin: { left: 10, right: 10 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i += 1) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Page ${i} / ${pageCount}   —   BOMBA CASH © 2026`, 14, pageHeight - 8);
    }

    doc.save(`journal_transactions_${localFilters.date_from || "all"}_${localFilters.date_to || "all"}.pdf`);
    showToast("PDF exporté avec succès.");
  };

  const handleExportExcel = () => {
    if (transactions.length === 0) { showToast("Aucune donnée à exporter.", "error"); return; }
    const headers = ["DATE","NOM & PRÉNOM","OPÉRATION","MONTANT (XAF)","HEURE","TÉLÉPHONE","KIOSQUE","NOM AGENT"];
    const rows = transactions.map(tx => [
      tx.date, tx.nom, tx.operation,
      `${tx.operation.toLowerCase().includes('dépôt') ? "+" : "-"}${tx.montant}`,
      tx.heure, tx.telephone, tx.kiosque, tx.agent,
    ]);
    const csv  = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `journal_transactions_${localFilters.date_from || 'all'}_${localFilters.date_to || 'all'}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast("Export Excel lancé.");
  };

  return (
    <div className="space-y-6 pb-6">

      <Toast msg={toast.msg} type={toast.type} />

      {/* Titre */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Journal de Transaction</h1>
        <p className="text-gray-500 mt-1 text-sm">Les données se mettent à jour automatiquement toutes les 30 secondes</p>
      </div>

      {/* ── Filtres + Actions ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[20px] shadow-xl p-6"
      >
        {/* Ligne 1: Dates + Type */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end flex-1">
            {/* Du */}
            <div className="w-full sm:flex-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                <Calendar size={15} /> Du
              </label>
              <input
                type="date" 
                value={localFilters.date_from || ''}
                onChange={e => setLocalFilters(prev => ({ ...prev, date_from: e.target.value || null }))}
                className="w-full h-11 px-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>

            {/* Au */}
            <div className="w-full sm:flex-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                <Calendar size={15} /> Au
              </label>
              <input
                type="date" 
                value={localFilters.date_to || ''}
                onChange={e => setLocalFilters(prev => ({ ...prev, date_to: e.target.value || null }))}
                className="w-full h-11 px-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>

            {/* Type filtre */}
            <select
              value={localFilters.type || ''}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, type: e.target.value || null }))}
              className="h-11 px-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
            >
              <option value="">Tous types</option>
              <option value="dépôt_cash">Dépôt</option>
              <option value="retrait_partiel">Retrait partiel</option>
              <option value="retrait_solde_compte">Retrait solde</option>
            </select>

            {/* Rechercher */}
            <Button
              onClick={handleApplyFilters}
              disabled={loading}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white h-11 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 shrink-0"
            >
              {loading
                ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Chargement…</>
                : <><Search size={16} /> Rechercher</>
              }
            </Button>
          </div>

          {/* Bouton Refresh */}
          <button
            onClick={handleRefreshPage}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors disabled:opacity-50 shrink-0"
          >
            <RotateCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span className="text-xs font-semibold">Rafraîchir</span>
          </button>
        </div>

        {/* Ligne 2: Recherche et boutons export */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-end">
          {/* Recherche */}
          <div className="flex-1 min-w-[200px]">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
              <Search size={15} /> Rechercher
            </label>
            <input
              type="text"
              placeholder="Par nom client ou n° carte..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-11 px-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>

          {/* Boutons export */}
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => handleApplyFilters()} variant="outline"
              className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-xl font-semibold">
              <Search size={15} className="mr-1" /> Appliquer
            </Button>
            <Button onClick={() => {
              setLocalFilters({ date_from: null, date_to: null, type: null });
              setSearchInput("");
              handleResetFilters();
            }} variant="outline"
              className="border-2 border-gray-400 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold">
              Réinitialiser
            </Button>
            <Button onClick={handlePrint} variant="outline"
              title={transactions.length === 0 ? "Lancez une recherche d'abord" : "Imprimer"}
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold">
              <Printer size={15} className="mr-1" /> Imprimer
            </Button>
            <Button onClick={handleExportPDF} variant="outline"
              title={transactions.length === 0 ? "Lancez une recherche d'abord" : "Exporter en PDF"}
              className="border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-xl font-semibold">
              <FileText size={15} className="mr-1" /> PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline"
              title={transactions.length === 0 ? "Lancez une recherche d'abord" : "Exporter en Excel"}
              className="border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl font-semibold">
              <Download size={15} className="mr-1" /> Excel
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Tableau avec Pagination ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[20px] shadow-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead style={{ background: "#4A4A4A" }}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => handleSort('date_heure')}>
                  <div className="flex items-center gap-2">
                    DATE {sortBy === 'date_heure' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">NOM & PRÉNOM</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => handleSort('type_op')}>
                  <div className="flex items-center gap-2">
                    OPÉRATION {sortBy === 'type_op' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => handleSort('montant')}>
                  <div className="flex items-center gap-2">
                    MONTANT (XAF) {sortBy === 'montant' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">HEURE</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">TÉLÉPHONE</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">KIOSQUE</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">NOM AGENT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((_, j) => (
                      <td key={j} className="px-6 py-4 border-b border-gray-100">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <Inbox size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-400 font-semibold text-base">
                      Aucune transaction trouvée
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      Appliquez des filtres pour afficher les données
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id_trans} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap">{tx.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 border-b border-gray-100 whitespace-nowrap">{tx.nom}</td>
                    <td className="px-6 py-4 text-center border-b border-gray-100"><BadgeOperation operation={tx.operation} /></td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-right border-b border-gray-100 whitespace-nowrap">
                      <span className={tx.operation.toLowerCase().includes('dépôt') ? "text-green-600" : "text-red-600"}>
                        {tx.operation.toLowerCase().includes('dépôt') ? "+" : "-"}{formatMontant(tx.montant)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-mono text-center border-b border-gray-100">{tx.heure}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-mono text-center border-b border-gray-100 whitespace-nowrap">{tx.telephone}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center border-b border-gray-100 whitespace-nowrap">{tx.kiosque}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-700 border-b border-gray-100 whitespace-nowrap">{tx.agent}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {transactions.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between flex-wrap gap-4">
            {/* Infos */}
            <div className="text-sm text-gray-600">
              Affichage de <span className="font-semibold">{(pagination.current_page - 1) * pagination.limit + 1}</span> à{" "}
              <span className="font-semibold">
                {Math.min(pagination.current_page * pagination.limit, pagination.total)}
              </span> sur <span className="font-semibold">{pagination.total}</span> résultats
            </div>

            {/* Contrôles */}
            <div className="flex items-center gap-3">
              {/* Items par page */}
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value={10}>10 par page</option>
                <option value={15}>15 par page</option>
                <option value={25}>25 par page</option>
                <option value={50}>50 par page</option>
              </select>

              {/* Navigation */}
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>

              {/* Numéros */}
              <div className="flex gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.total_pages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.total_pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.current_page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.current_page >= pagination.total_pages - 2) {
                      pageNum = pagination.total_pages - 4 + i;
                    } else {
                      pageNum = pagination.current_page - 2 + i;
                    }
                    return pageNum;
                  }
                ).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={[
                      "px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                      pageNum === pagination.current_page
                        ? "bg-orange-600 text-white"
                        : "border border-gray-300 hover:bg-orange-50",
                    ].join(" ")}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.total_pages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </motion.div>



      {/* ── Résumé ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-[20px] shadow-xl p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">Nombre des opérations</h3>
            <div className="space-y-3">
              {[
                { label: "Nbr dépôt cash",     value: stats.total_depots,    color: "bg-green-500",  text: "text-green-600"  },
                { label: "Nbr retrait partiel", value: stats.total_retraits_partiels, color: "bg-orange-500", text: "text-orange-600" },
                { label: "Nbr retrait total",   value: stats.total_retraits_solde, color: "bg-red-500",    text: "text-red-600"    },
              ].map(({ label, value, color, text }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  <span className={`text-2xl font-bold font-mono ${text}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">Montant total cumulé (XAF)</h3>
            <div className="space-y-3">
              {[
                { label: "Total dépôt cash",     value: stats.montant_total_depots,    border: "border-green-500",  text: "text-green-600"  },
                { label: "Total retrait partiel", value: stats.montant_total_retraits, border: "border-orange-500", text: "text-orange-600" },
                { label: "Total retrait total",   value: stats.montant_total_retraits, border: "border-red-500",    text: "text-red-600"    },
              ].map(({ label, value, border, text }) => (
                <div key={label} className={`flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border-l-4 ${border}`}>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className={`text-xl font-bold font-mono ${text}`}>{formatMontant(value)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-6 p-5 rounded-xl shadow-xl flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}>
          <span className="text-lg font-semibold text-white tracking-wide">MONTANT TOTAL CUMULÉ</span>
          <span className="text-3xl font-bold text-white font-mono">{formatMontant(stats.montant_total_depots + stats.montant_total_retraits)} XAF</span>
        </div>

      </motion.div>
    </div>
  );
}