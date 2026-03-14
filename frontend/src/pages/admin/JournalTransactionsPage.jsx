// ─────────────────────────────────────────────────────────────────────────────
// fichier : src/pages/admin/JournalTransactionsPage.jsx
//
// ⚠️  DONNÉES — À brancher sur l'API quand le collègue (partie agent) sera prêt
//     Endpoint attendu : GET /api/admin/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD
//     Réponse attendue :
//     {
//       data: [
//         {
//           id:        "TRX001",
//           date:      "28/02/2026",
//           nom:       "MADOUGAMA Eric",
//           operation: "Dépôt" | "Retrait partiel" | "Retrait total",
//           montant:   50000,
//           heure:     "10:30",
//           telephone: "+242 06 111 2222",
//           kiosque:   "KMC 01 MGL",
//           agent:     "KALI Jean"         ← fourni par le collègue
//         },
//         ...
//       ]
//     }
//
//     Pour brancher : remplacer le TODO dans handleSearch() par l'appel axios réel
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Printer, Download, FileText, Calendar, Inbox } from "lucide-react";
import { Button } from "../../components/ui/button";
import Toast from "../../components/ui/Toast";
import axios from "../../lib/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

// ── Colonnes du tableau ────────────────────────────────────────────────────────
const COLONNES = [
  "DATE", "NOM & PRÉNOM", "OPÉRATION",
  "MONTANT (XAF)", "HEURE", "TÉLÉPHONE",
  "KIOSQUE", "NOM AGENT",
];

// ── Badge opération ────────────────────────────────────────────────────────────
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

// ── Formatage montant ──────────────────────────────────────────────────────────
function formatMontant(montant) {
  return montant.toLocaleString("fr-FR").replace(/\s/g, "\u00A0");
}

// ─────────────────────────────────────────────────────────────────────────────
export default function JournalTransactionsPage() {
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [transactions,  setTransactions]  = useState([]); // ← vide, prêt pour l'API
  const [isLoading,     setIsLoading]     = useState(false);
  const [hasSearched,   setHasSearched]   = useState(false);
  const [toast,         setToast]         = useState({ msg: "", type: "success" });

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "" }), 3500);
  }

  // ── Recherche par date ─────────────────────────────────────────────────────
  // ⚠️ TODO — brancher l'API quand le collègue (partie agent) est prêt
  async function handleSearch() {
    if (!dateFrom || !dateTo) {
      showToast("Veuillez sélectionner une plage de dates.", "error");
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      // ✅ DÉCOMMENTER quand l'API est prête :
      // const response = await axios.get(`/api/admin/transactions?from=${dateFrom}&to=${dateTo}`);
      // setTransactions(response.data.data);

      // 🔄 Simulation en attendant le collègue — à supprimer ensuite
      await new Promise(r => setTimeout(r, 800)); // simule un délai réseau
      setTransactions([]); // restera vide jusqu'à branchement API
      showToast("Aucune donnée disponible — API en attente.", "error");
    } catch (err) {
      showToast("Erreur lors de la recherche.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Impression ────────────────────────────────────────────────────────────
  function handlePrint() {
    if (transactions.length === 0) {
      showToast("Aucune donnée à imprimer.", "error");
      return;
    }
    const fenetre = window.open("", "_blank");
    const rows = transactions.map(tx => `
      <tr>
        <td>${tx.date}</td>
        <td><strong>${tx.nom}</strong></td>
        <td>${tx.operation}</td>
        <td style="text-align:right;color:${tx.operation === "Dépôt" ? "green" : "red"}">
          ${tx.operation === "Dépôt" ? "+" : "-"}${formatMontant(tx.montant)}
        </td>
        <td>${tx.heure}</td>
        <td>${tx.telephone}</td>
        <td>${tx.kiosque}</td>
        <td>${tx.agent}</td>
      </tr>
    `).join("");

    fenetre.document.write(`
      <!DOCTYPE html><html><head><title>Journal de Transaction</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        h1 { color: #F97316; }
        p  { color: #6B7280; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #4A4A4A; color: white; padding: 8px; text-align: left; font-size: 11px; }
        td { padding: 8px; border-bottom: 1px solid #E5E7EB; font-size: 11px; }
        @media print { body { margin: 0; } }
      </style></head>
      <body>
        <h1>🐟 BOMBA CASH — Journal de Transaction</h1>
        <p>Période : du ${dateFrom} au ${dateTo} &nbsp;|&nbsp; Généré le ${new Date().toLocaleDateString("fr-FR")}</p>
        <table>
          <thead><tr>
            <th>DATE</th><th>NOM & PRÉNOM</th><th>OPÉRATION</th>
            <th>MONTANT (XAF)</th><th>HEURE</th><th>TÉLÉPHONE</th>
            <th>KIOSQUE</th><th>NOM AGENT</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>
    `);
    fenetre.document.close();
    setTimeout(() => { fenetre.print(); fenetre.close(); }, 500);
    showToast("Impression lancée.");
  }

  // ── Export PDF ─────────────────────────────────────────────────────────────
  function handleExportPDF() {
    if (transactions.length === 0) {
      showToast("Aucune donnée à exporter.", "error");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // En-tête
    doc.setFontSize(18);
    doc.setTextColor(249, 115, 22); // orange BOMBA CASH
    doc.text("BOMBA CASH — Journal de Transaction", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Période : du ${dateFrom} au ${dateTo}   |   Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 23);

    doc.autoTable({
      startY: 30,
      head: [["DATE", "NOM & PRÉNOM", "OPÉRATION", "MONTANT (XAF)", "HEURE", "TÉLÉPHONE", "KIOSQUE", "NOM AGENT"]],
      body: transactions.map(tx => [
        tx.date,
        tx.nom,
        tx.operation,
        `${tx.operation === "Dépôt" ? "+" : "-"}${formatMontant(tx.montant)}`,
        tx.heure,
        tx.telephone,
        tx.kiosque,
        tx.agent,
      ]),
      headStyles:          { fillColor: [74, 74, 74], textColor: 255, fontSize: 9, fontStyle: "bold" },
      bodyStyles:          { fontSize: 9 },
      alternateRowStyles:  { fillColor: [249, 250, 251] },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
      },
    });

    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} / ${pageCount}   —   BOMBA CASH © 2026`, 14, doc.internal.pageSize.height - 8);
    }

    doc.save(`journal_transactions_${dateFrom}_${dateTo}.pdf`);
    showToast("PDF exporté avec succès.");
  }

  // ── Export Excel (CSV) ─────────────────────────────────────────────────────
  function handleExportExcel() {
    if (transactions.length === 0) {
      showToast("Aucune donnée à exporter.", "error");
      return;
    }
    const headers = ["DATE", "NOM & PRÉNOM", "OPÉRATION", "MONTANT (XAF)", "HEURE", "TÉLÉPHONE", "KIOSQUE", "NOM AGENT"];
    const rows = transactions.map(tx => [
      tx.date,
      tx.nom,
      tx.operation,
      `${tx.operation === "Dépôt" ? "+" : "-"}${tx.montant}`,
      tx.heure,
      tx.telephone,
      tx.kiosque,
      tx.agent,
    ]);
    const csv  = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `journal_transactions_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Export Excel lancé.");
  }

  // ── Calculs résumé ─────────────────────────────────────────────────────────
  const nbrDepot      = transactions.filter(tx => tx.operation === "Dépôt").length;
  const nbrRetraitP   = transactions.filter(tx => tx.operation === "Retrait partiel").length;
  const nbrRetraitT   = transactions.filter(tx => tx.operation === "Retrait total").length;
  const totalDepot    = transactions.filter(tx => tx.operation === "Dépôt").reduce((s, tx) => s + tx.montant, 0);
  const totalRetraitP = transactions.filter(tx => tx.operation === "Retrait partiel").reduce((s, tx) => s + tx.montant, 0);
  const totalRetraitT = transactions.filter(tx => tx.operation === "Retrait total").reduce((s, tx) => s + tx.montant, 0);
  const totalCumule   = totalDepot + totalRetraitP + totalRetraitT;

  return (
    <div className="space-y-6 pb-6">

      <Toast msg={toast.msg} type={toast.type} />

      {/* Titre */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Journal de Transaction</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Sélectionnez une plage de dates pour afficher les transactions
        </p>
      </div>

      {/* ── Filtres + Actions ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[20px] shadow-xl p-5"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-end justify-between">

          {/* Dates */}
          <div className="flex flex-col md:flex-row gap-4 items-end flex-1">
            <div className="flex-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                <Calendar size={15} /> Du
              </label>
              <input
                type="date" value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full h-11 px-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                <Calendar size={15} /> Au
              </label>
              <input
                type="date" value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full h-11 px-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white h-11 px-6 rounded-xl font-semibold flex items-center gap-2"
            >
              {isLoading
                ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Chargement…</>
                : <><Search size={16} /> Rechercher</>
              }
            </Button>
          </div>

          {/* Boutons export */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handlePrint}
              variant="outline"
              title={transactions.length === 0 ? "Lancez une recherche d'abord" : "Imprimer"}
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold"
            >
              <Printer size={15} className="mr-1" /> Imprimer
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              title={transactions.length === 0 ? "Lancez une recherche d'abord" : "Exporter en PDF"}
              className="border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-xl font-semibold"
            >
              <FileText size={15} className="mr-1" /> PDF
            </Button>
            <Button
              onClick={handleExportExcel}
              variant="outline"
              title={transactions.length === 0 ? "Lancez une recherche d'abord" : "Exporter en Excel"}
              className="border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl font-semibold"
            >
              <Download size={15} className="mr-1" /> Excel
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Tableau ───────────────────────────────────────────────────────── */}
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
                {COLONNES.map(col => (
                  <th key={col} className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                /* ── Skeleton chargement ── */
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {COLONNES.map((_, j) => (
                      <td key={j} className="px-6 py-4 border-b border-gray-100">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                /* ── État vide ── */
                <tr>
                  <td colSpan={COLONNES.length} className="px-6 py-20 text-center">
                    <Inbox size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-400 font-semibold text-base">
                      {hasSearched
                        ? "Aucune transaction trouvée pour cette période"
                        : "Sélectionnez une plage de dates et cliquez sur Rechercher"}
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      {hasSearched
                        ? "Les données seront disponibles quand l'API sera branchée"
                        : "Les données s'afficheront ici"}
                    </p>
                  </td>
                </tr>
              ) : (
                /* ── Données réelles ── */
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 border-b border-gray-100 whitespace-nowrap">
                      {tx.nom}
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-100">
                      <BadgeOperation operation={tx.operation} />
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-right border-b border-gray-100 whitespace-nowrap">
                      <span className={tx.operation === "Dépôt" ? "text-green-600" : "text-red-600"}>
                        {tx.operation === "Dépôt" ? "+" : "-"}{formatMontant(tx.montant)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-mono text-center border-b border-gray-100">
                      {tx.heure}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-mono text-center border-b border-gray-100 whitespace-nowrap">
                      {tx.telephone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center border-b border-gray-100 whitespace-nowrap">
                      {tx.kiosque}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-700 border-b border-gray-100 whitespace-nowrap">
                      {tx.agent}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Résumé ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-[20px] shadow-xl p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Nombre des opérations */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">
              Nombre des opérations
            </h3>
            <div className="space-y-3">
              {[
                { label: "Nbr dépôt cash",      value: nbrDepot,    color: "bg-green-500",  text: "text-green-600" },
                { label: "Nbr retrait partiel",  value: nbrRetraitP, color: "bg-orange-500", text: "text-orange-600" },
                { label: "Nbr retrait total",    value: nbrRetraitT, color: "bg-red-500",    text: "text-red-600" },
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

          {/* Montant total cumulé */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">
              Montant total cumulé (XAF)
            </h3>
            <div className="space-y-3">
              {[
                { label: "Total dépôt cash",      value: totalDepot,    border: "border-green-500",  text: "text-green-600" },
                { label: "Total retrait partiel",  value: totalRetraitP, border: "border-orange-500", text: "text-orange-600" },
                { label: "Total retrait total",    value: totalRetraitT, border: "border-red-500",    text: "text-red-600" },
              ].map(({ label, value, border, text }) => (
                <div key={label} className={`flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border-l-4 ${border}`}>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className={`text-xl font-bold font-mono ${text}`}>{formatMontant(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grand total */}
        <div
          className="mt-6 p-5 rounded-xl shadow-xl flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}
        >
          <span className="text-lg font-semibold text-white tracking-wide">MONTANT TOTAL CUMULÉ</span>
          <span className="text-3xl font-bold text-white font-mono">
            {formatMontant(totalCumule)} XAF
          </span>
        </div>
      </motion.div>

    </div>
  );
}