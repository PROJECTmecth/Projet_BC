// src/pages/admin/GestionClients.jsx
import { useState, useEffect, useMemo } from "react";
import { Search, Printer, Download, FileText, User, X, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import api from "../../lib/axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Formatage des nombres
const fmt = (n) => Number(n ?? 0).toLocaleString("fr-FR").replace(/\s/g, "\u00A0");
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
}[char]));

const getPhotoUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const base = apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

// ── Composant : Progression circulaire ─────────────────────────────────────
function CircleProgress({ pct = 0 }) {
  const r = 54, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  const color = pct === 0 ? "#e5e7eb"
    : pct <= 25  ? "#ef4444"
    : pct <= 50  ? "#FF6600"
    : pct <= 75  ? "#eab308"
    : "#16a34a";
  const textColor = pct === 0 ? "#9ca3af" : color;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      {pct > 0 && (
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 70 70)" />
      )}
      <text x="70" y="70" textAnchor="middle" dominantBaseline="central"
        fill={textColor} fontSize="22" fontWeight="bold">{pct}%</text>
    </svg>
  );
}

// ── Composant : Modal détail client ────────────────────────────────────────
function ModalClient({ clientId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    api.get(`/api/admin/clients/${clientId}`)
      .then(({ data: res }) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Chargement…</div>
        ) : !data ? (
          <div className="p-6 text-red-500">Erreur de chargement.</div>
        ) : (
          <>
            <div className="relative bg-[#FF6600] px-6 pt-5 pb-8 text-white rounded-t-2xl">
              <button onClick={onClose}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 rounded-full p-1 z-10">
                <X size={18} />
              </button>
              <div className="flex items-center gap-4 pr-10">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <User size={28} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold truncate">{data.infos.nom} {data.infos.prenom}</h2>
                  <p className="mt-1 text-white/90 text-sm"><span className="font-semibold">Activité :</span> {data.infos.activite}</p>
                  <p className="text-white/90 text-sm"><span className="font-semibold">Adresse :</span> {data.infos.adresse}</p>
                  <p className="text-white/90 text-sm"><span className="font-semibold">Téléphone :</span> {data.infos.telephone}</p>
                  <p className="text-white/90 text-sm"><span className="font-semibold">Résident :</span> {data.infos.nationalite === "Résident" ? "OUI" : "NON"}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              {/* --- Section Photos d'identité --- */}
              {((data.infos.photo_pieces_urls && data.infos.photo_pieces_urls.length > 0) || data.infos.photo_piece_url) && (
                <div className="mb-6">
                  <h3 className="font-bold text-[#1e2a3a] text-lg mb-3">Pièces d'identité</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {((data.infos.photo_pieces_urls && data.infos.photo_pieces_urls.length > 0) ? data.infos.photo_pieces_urls : [data.infos.photo_piece_url]).map((url, idx) => (
                      <a key={idx} href={getPhotoUrl(url)} target="_blank" rel="noreferrer" className="flex-shrink-0 block border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <img src={getPhotoUrl(url)} alt={`Pièce ${idx + 1}`} className="w-48 h-32 object-cover bg-gray-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="font-bold text-[#1e2a3a] text-lg mb-4">Tableau de bord de la Carte</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                <div className="shrink-0">
                  <CircleProgress pct={data.carte.progression ?? 0} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="bg-orange-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500">No. Carte</p>
                    <p className="text-[#FF6600] font-bold text-lg">{data.carte.numero_carte}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500">Activation</p>
                      <p className="font-semibold text-sm">{data.carte.date_activation}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500">Expiration</p>
                      <p className="font-semibold text-sm">{data.carte.date_expiration}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500">Montant actuel</p>
                    <p className="text-green-600 font-bold text-xl">{fmt(data.carte.montant_actuel)} FCFA</p>
                    <p className="text-[10px] text-green-700/80 mt-1 leading-tight">Ce montant correspond au solde net disponible sur la carte, déduction faite des frais de garde éventuels.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#1e2a3a] text-lg">Journal des Opérations</h3>
                </div>
                <div className="bg-orange-50 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="bg-orange-100 text-[#1e2a3a] text-xs">
                          <th className="px-3 py-3 text-left">No.</th>
                          <th className="px-3 py-3 text-left">Date</th>
                          <th className="px-3 py-3 text-left">Heure</th>
                          <th className="px-3 py-3 text-left">Opération</th>
                          <th className="px-3 py-3 text-right">Montant</th>
                          <th className="px-3 py-3 text-left">Kiosque</th>
                          <th className="px-3 py-3 text-left">Agent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.length === 0 ? (
                          <tr><td colSpan={7} className="text-center py-6 text-gray-400 text-xs">Aucune opération</td></tr>
                        ) : data.transactions.map((t, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-orange-50/50"}>
                            <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                            <td className="px-3 py-3">{t.date}</td>
                            <td className="px-3 py-3 text-gray-500">{t.heure}</td>
                            <td className="px-3 py-3 font-semibold">{t.operation}</td>
                            <td className={`px-3 py-3 text-right font-bold ${t.type_op === "dépôt_cash" ? "text-green-600" : "text-red-500"}`}>
                              {t.type_op === "dépôt_cash" ? "+" : "-"}{fmt(t.montant)} FCFA
                            </td>
                            <td className="px-3 py-3 text-gray-600">{t.kiosque}</td>
                            <td className="px-3 py-3 text-gray-600">{t.agent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

export default function GestionClients() {
  const [clients, setClients]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterActivite, setFilterActivite] = useState("");
  const [filterGenre, setFilterGenre]       = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Notifications toast ────────────────────────────────────────────────────
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: "", text: "", onConfirm: null, btnColor: "#FF6600" });

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast(s => ({ ...s, show: false })), 3500);
    return () => clearTimeout(t);
  }, [toast.show]);

  const showToast = (message, type = "success") => setToast({ show: true, message, type });
  const askConfirm = (title, text, onConfirm, btnColor = "#1e2a3a") =>
    setConfirmModal({ show: true, title, text, onConfirm, btnColor });

  useEffect(() => {
    api.get("/api/admin/clients")
      .then(({ data }) => { setClients(data.data ?? []); setTotal(data.total ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      // 1. Recherche par texte
      const matchesSearch = `${c.nom} ${c.prenom} ${c.telephone} ${c.numero_carte}`
        .toLowerCase().includes(search.toLowerCase());

      // 2. Filtre Activité
      let matchesActivite = true;
      if (filterActivite) {
        const act = (c.activite ?? "").toLowerCase();
        if (filterActivite === "commercant") {
          matchesActivite = ['commerçant', 'commerçante', 'commercant', 'commercante'].includes(act);
        } else if (filterActivite === "menagere") {
          matchesActivite = ['ménagère', 'menagere'].includes(act);
        } else if (filterActivite === "travailleurs") {
          matchesActivite = ['travailleur', 'travailleurs'].includes(act);
        } else if (filterActivite === "etudiants") {
          matchesActivite = ['étudiant', 'étudiants', 'étudiante', 'etudiant', 'etudiants', 'etudiante'].includes(act);
        }
      }

      // 3. Filtre Genre
      let matchesGenre = true;
      if (filterGenre) {
        matchesGenre = c.genre === filterGenre;
      }

      return matchesSearch && matchesActivite && matchesGenre;
    });
  }, [clients, search, filterActivite, filterGenre]);

  useEffect(() => { setCurrentPage(1); }, [search, filterActivite, filterGenre]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIdx   = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx     = startIdx + ITEMS_PER_PAGE;
  const paginated  = filtered.slice(startIdx, endIdx);

  useEffect(() => {
    setCurrentPage(page => Math.min(page, totalPages));
  }, [totalPages]);

  // --- UTILITAIRES ---
  const hasData = (label) => {
    if (filtered.length === 0) {
      showToast(`Aucune donnée à ${label}.`, "warning");
      return false;
    }
    return true;
  };

  // ── IMPRIMER (window.print) ─────────────────────────────────────────────
  const handlePrint = () => {
    if (!hasData("imprimer")) return;
    askConfirm(
      "Imprimer la liste ?",
      "Voulez-vous imprimer la liste filtrée des clients ?",
      () => {
        const rows = filtered.map((c, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${c.genre === "Homme" ? "M" : "F"}</td>
            <td><strong>${escapeHtml(c.nom)} ${escapeHtml(c.prenom)}</strong></td>
            <td>${escapeHtml(c.numero_carte)}</td>
            <td>${escapeHtml(c.adresse)}</td>
            <td>${escapeHtml(c.nationalite)}</td>
            <td>${escapeHtml(c.type_piece)}</td>
            <td>${escapeHtml(c.num_piece)}</td>
            <td>${escapeHtml(c.activite)}</td>
            <td>${escapeHtml(c.telephone)}</td>
          </tr>
        `).join("");

        const printWindow = window.open("", "_blank", "width=1200,height=800");
        if (!printWindow) {
          showToast("Impossible d'ouvrir la fenêtre d'impression.", "error");
          return;
        }

        printWindow.document.write(`<!doctype html>
          <html lang="fr">
            <head>
              <meta charset="utf-8" />
              <title>BOMBA CASH - Liste des Clients</title>
              <style>
                @page { size: landscape; margin: 8mm; }
                * { box-sizing: border-box; }
                body { margin: 0; color: #111827; font-family: Arial, Helvetica, sans-serif; font-size: 10px; background: #fff; }
                .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #ff6600; padding-bottom: 8px; margin-bottom: 10px; }
                .brand { font-size: 20px; font-weight: 800; color: #1e2a3a; }
                .meta { text-align: right; color: #4b5563; font-size: 10px; line-height: 1.5; }
                table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                th, td { border: 1px solid #333; padding: 5px 6px; text-align: left; vertical-align: top; color: #111827; word-wrap: break-word; overflow-wrap: anywhere; }
                th { background: #1e2a3a; color: #fff; font-size: 9px; text-transform: uppercase; }
                tbody tr:nth-child(even) td { background: #f8fafc; }
                th:nth-child(1), td:nth-child(1) { width: 5%; text-align: center; }
                th:nth-child(2), td:nth-child(2) { width: 5%; text-align: center; }
                th:nth-child(3), td:nth-child(3) { width: 18%; }
                th:nth-child(4), td:nth-child(4) { width: 12%; }
                th:nth-child(5), td:nth-child(5) { width: 19%; }
                th:nth-child(6), td:nth-child(6) { width: 9%; }
                th:nth-child(7), td:nth-child(7) { width: 9%; }
                th:nth-child(8), td:nth-child(8) { width: 10%; }
                th:nth-child(9), td:nth-child(9) { width: 8%; }
                th:nth-child(10), td:nth-child(10) { width: 10%; }
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <div class="brand">BOMBA CASH - Liste des Clients</div>
                  <div>Total : ${filtered.length} client${filtered.length > 1 ? "s" : ""}</div>
                </div>
                <div class="meta">
                  Généré le ${new Date().toLocaleDateString("fr-FR")}<br />
                  Liste filtrée
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Genre</th>
                    <th>Nom & Prénom</th>
                    <th>No. Carte</th>
                    <th>Adresse</th>
                    <th>Nationalité</th>
                    <th>Pièce</th>
                    <th>No. Pièce</th>
                    <th>Activité</th>
                    <th>Tél.</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </body>
          </html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      },
      "#1e2a3a"
    );
  };

  // ── EXPORT PDF (jsPDF + autoTable) ──────────────────────────────────────
  const exportPDF = () => {
    if (!hasData("exporter")) return;

    askConfirm(
      "Export PDF",
      "Générer le fichier PDF avec la liste filtrée ?",
      () => {
        try {
          const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
          const W = doc.internal.pageSize.getWidth();
          const H = doc.internal.pageSize.getHeight();

          // ── Bannière orange ────────────────────────────────────────────
          doc.setFillColor(255, 102, 0);
          doc.rect(0, 0, W, 24, "F");

          // Logo cercle blanc
          doc.setFillColor(255, 255, 255);
          doc.circle(17, 12, 7, "F");
          doc.setTextColor(255, 102, 0);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text("BC", 17, 13.5, { align: "center" });

          // Nom de l'application
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(17);
          doc.setFont("helvetica", "bold");
          doc.text("BOMBA CASH", 28, 11);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text("Systeme de gestion d'epargne communautaire", 28, 17);

          // Titre du document + date (droite)
          doc.setFontSize(13);
          doc.setFont("helvetica", "bold");
          doc.text("LISTE DES CLIENTS", W - 14, 10, { align: "right" });
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(`Genere le : ${new Date().toLocaleDateString("fr-FR")}`, W - 14, 17, { align: "right" });

          // ── Barre sombre avec stats ────────────────────────────────────
          doc.setFillColor(30, 42, 58);
          doc.rect(0, 24, W, 8, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "normal");
          doc.text(`Total : ${filtered.length} client${filtered.length > 1 ? "s" : ""}`, 14, 29);
          doc.text("Tous statuts confondus", W / 2, 29, { align: "center" });

          // ── Tableau ────────────────────────────────────────────────────
          const head = [["No.", "Genre", "Nom & Prenom", "No. Carte", "Adresse", "Nationalite", "Tel.", "Activite"]];
          const body = filtered.map((c, i) => [
            i + 1,
            c.genre === "Homme" ? "M" : "F",
            `${c.nom} ${c.prenom}`,
            c.numero_carte,
            c.adresse,
            c.nationalite,
            c.telephone,
            c.activite,
          ]);
          const tableWidth = 226;
          const tableMarginLeft = (W - tableWidth) / 2;

          autoTable(doc, {
            head,
            body,
            startY: 34,
            theme: "grid",
            tableWidth,
            margin: { left: tableMarginLeft, right: tableMarginLeft },
            styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
            headStyles: {
              fillColor: [30, 42, 58],
              textColor: 255,
              fontSize: 8.5,
              fontStyle: "bold",
              halign: "center",
            },
            alternateRowStyles: { fillColor: [255, 248, 242] },
            columnStyles: {
              0: { cellWidth: 10, halign: "center" },
              1: { cellWidth: 14, halign: "center" },
              2: { cellWidth: 44 },
              3: { cellWidth: 30, halign: "center" },
              4: { cellWidth: 48 },
              5: { cellWidth: 24, halign: "center" },
              6: { cellWidth: 26, halign: "center" },
              7: { cellWidth: 30 },
            },
            tableLineWidth: 0.2,
            tableLineColor: [220, 220, 220],
          });

          // ── Pied de page ───────────────────────────────────────────────
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setDrawColor(255, 102, 0);
            doc.setLineWidth(0.4);
            doc.line(14, H - 12, W - 14, H - 12);
            doc.setFontSize(7);
            doc.setTextColor(130);
            doc.setFont("helvetica", "normal");
            doc.text("BOMBA CASH - Document confidentiel", 14, H - 7);
            doc.text(`Page ${i} / ${pageCount}`, W / 2, H - 7, { align: "center" });
            doc.text(new Date().toLocaleDateString("fr-FR"), W - 14, H - 7, { align: "right" });
          }

          doc.save(`clients_bomba_cash_${new Date().toISOString().slice(0, 10)}.pdf`);
          showToast("PDF généré avec succès !", "success");

        } catch (err) {
          console.error("Erreur PDF:", err);
          showToast("Impossible de générer le PDF.", "error");
        }
      },
      "#ef4444"
    );
  };

  // ── EXPORT EXCEL (xlsx) ─────────────────────────────────────────────────
  const exportExcel = () => {
    if (!hasData("exporter")) return;

    askConfirm(
      "Export Excel",
      "Générer le fichier Excel avec la liste filtrée ?",
      () => {
        try {
          const data = filtered.map((c, i) => ({
            "No."         : i + 1,
            "Genre"       : c.genre === "Homme" ? "Masculin" : "Féminin",
            "Nom"         : c.nom,
            "Prénom"      : c.prenom,
            "Carte"       : c.numero_carte,
            "Adresse"     : c.adresse,
            "Nationalité" : c.nationalite,
            "Type pièce"  : c.type_piece,
            "No. pièce"   : c.num_piece,
            "Activité"    : c.activite,
            "Téléphone"   : c.telephone,
          }));

          const ws = XLSX.utils.json_to_sheet(data);
          ws["!cols"] = [
            { wch: 5 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
            { wch: 18 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
            { wch: 20 }, { wch: 18 }, { wch: 15 },
          ];

          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Clients");
          XLSX.writeFile(wb, `clients_bomba_cash_${new Date().toISOString().slice(0, 10)}.xlsx`);
          showToast("Excel généré avec succès !", "success");

        } catch (err) {
          console.error("Erreur Excel:", err);
          showToast("Impossible de générer le fichier Excel.", "error");
        }
      },
      "#16a34a"
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="printable-area">
      
      {/* ══ Bannière ═════════════════════════════════════════════════════ */}
      <div className="relative bg-[#1e2a3a] rounded-2xl px-5 sm:px-8 py-5 sm:py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-7 overflow-hidden gap-4 no-print">
        <div className="absolute right-40 -top-6 w-28 h-28 rounded-full bg-white/[0.04]" />
        <div className="flex items-center gap-4 z-10 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] bg-white/10 flex items-center justify-center text-white shrink-0">
            <User size={26} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate">Gestion de clients</h1>
            <p className="text-white/60 text-xs sm:text-sm mt-0.5">Base de données complète des clients</p>
          </div>
        </div>
        <div className="z-10 bg-white rounded-2xl px-4 sm:px-6 py-2 sm:py-3 text-center shadow shrink-0">
          <p className="text-xs text-gray-500">Total clients</p>
          <p className="text-2xl sm:text-3xl font-black text-[#1e2a3a]">{String(total).padStart(2, "0")}</p>
        </div>
      </div>

      {/* ══ Recherche + Actions ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3 mb-6 shadow-sm no-print">
        <div className="flex-1 relative min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Recherche du nom, téléphone ou compte..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none" />
        </div>

        {/* Filtre Activité */}
        <select
          value={filterActivite}
          onChange={e => setFilterActivite(e.target.value)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-750 px-3 py-2.5 rounded-xl text-sm font-semibold outline-none transition-colors border-none cursor-pointer min-w-[150px]"
        >
          <option value="">Toutes activités</option>
          <option value="commercant">Commerçant</option>
          <option value="menagere">Ménagère</option>
          <option value="travailleurs">Travailleurs</option>
          <option value="etudiants">Étudiants</option>
        </select>

        {/* Filtre Genre */}
        <select
          value={filterGenre}
          onChange={e => setFilterGenre(e.target.value)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-755 px-3 py-2.5 rounded-xl text-sm font-semibold outline-none transition-colors border-none cursor-pointer min-w-[120px]"
        >
          <option value="">Tous genres</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>
        <button onClick={handlePrint} 
          className="flex items-center gap-1.5 border border-[#1e2a3a] text-[#1e2a3a] px-3 py-2 rounded-lg text-sm hover:bg-gray-50" 
          title="Imprimer">
          <Printer size={15} /><span className="hidden sm:inline">Imprimer</span>
        </button>
        <button onClick={exportPDF} 
          className="flex items-center gap-1.5 border border-red-500 text-red-500 px-3 py-2 rounded-lg text-sm hover:bg-red-50" 
          title="Exporter en PDF">
          <FileText size={15} /><span className="hidden sm:inline">PDF</span>
        </button>
        <button onClick={exportExcel} 
          className="flex items-center gap-1.5 border border-green-600 text-green-600 px-3 py-2 rounded-lg text-sm hover:bg-green-50" 
          title="Exporter en Excel">
          <Download size={15} /><span className="hidden sm:inline">Excel</span>
        </button>
      </div>

      {/* ══ Tableau des clients ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]" id="clients-table">
            <thead>
              <tr className="bg-[#1e2a3a] text-white text-xs uppercase">
                <th className="px-4 py-4 text-left">No.</th>
                <th className="px-4 py-4 text-left">Genre</th>
                <th className="px-4 py-4 text-left">Nom & Prénom</th>
                <th className="px-4 py-4 text-left">Adresse</th>
                <th className="px-4 py-4 text-left">Nationalité</th>
                <th className="px-4 py-4 text-left">Pièce</th>
                <th className="px-4 py-4 text-left">No. Pièce</th>
                <th className="px-4 py-4 text-left">Activité</th>
                <th className="px-4 py-4 text-left">Tél.</th>
                <th className="px-4 py-4 text-center no-print">Détail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-10 text-gray-400">Chargement…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-gray-400">Aucun client trouvé</td></tr>
              ) : paginated.map((c, i) => (
                <tr key={c.id_client} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-4 text-gray-500">{startIdx + i + 1}</td>
                  <td className="px-4 py-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${c.genre === "Homme" ? "bg-blue-400" : "bg-pink-400"}`}>
                      {c.genre === "Homme" ? "M" : "F"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-[#1e2a3a]">{c.nom} {c.prenom}</p>
                    <p className="text-xs text-[#FF6600]">{c.numero_carte}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{c.adresse}</td>
                  <td className="px-4 py-4 text-gray-600">{c.nationalite}</td>
                  <td className="px-4 py-4 text-gray-600">{c.type_piece}</td>
                  <td className="px-4 py-4 text-gray-600">{c.num_piece}</td>
                  <td className="px-4 py-4 text-gray-600">{c.activite}</td>
                  <td className="px-4 py-4 text-gray-600">{c.telephone}</td>
                  <td className="px-4 py-4 text-center no-print">
                    <button onClick={() => setSelectedId(c.id_client)}
                      className="border border-blue-400 text-blue-500 rounded-lg p-1.5 hover:bg-blue-50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="bg-white rounded-2xl px-6 py-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-gray-100 no-print">

          {/* Info */}
          <p className="text-sm text-gray-500">
            Affichage{" "}
            <span className="font-semibold text-gray-800">{startIdx + 1}</span>
            {" "}&agrave;{" "}
            <span className="font-semibold text-gray-800">{Math.min(endIdx, filtered.length)}</span>
            {" "}sur{" "}
            <span className="font-semibold text-[#FF6600]">{filtered.length}</span>
            {" "}client{filtered.length > 1 ? "s" : ""}
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

      {/* Modal détail client */}
      <ModalClient clientId={selectedId} onClose={() => setSelectedId(null)} />

      {/* ── Toast notification ──────────────────────────────────────────── */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium animate-fade-in no-print ${
          toast.type === "success" ? "bg-green-500" :
          toast.type === "error"   ? "bg-red-500"   : "bg-orange-500"
        }`}>
          {toast.type === "success" ? <CheckCircle size={18} /> :
           toast.type === "error"   ? <XCircle size={18} />     : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(s => ({ ...s, show: false }))} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Modal de confirmation ────────────────────────────────────────── */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9998] p-4 no-print">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg text-gray-800 mb-2">{confirmModal.title}</h3>
            <p className="text-gray-500 text-sm mb-6">{confirmModal.text}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal(s => ({ ...s, show: false }))}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setConfirmModal(s => ({ ...s, show: false }));
                  confirmModal.onConfirm?.();
                }}
                style={{ background: confirmModal.btnColor }}
                className="px-5 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CSS POUR L'IMPRESSION - VERSION ROBUSTE ═══════════════════════ */}
      <style>{`
        @media print {
          @page { 
            size: landscape;
            margin: 8mm; 
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          
          body {
            background: white !important;
            color: black !important;
            font-size: 8pt !important;
            font-family: Arial, sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Cacher les éléments non imprimables */
          .no-print, nav, aside, header {
            display: none !important;
          }
          
          /* Ajuster la zone imprimable */
          .printable-area {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Afficher le tableau correctement */
          #clients-table {
            display: table !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 7pt !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
          }
          
          #clients-table thead {
            display: table-header-group !important;
          }
          
          #clients-table tbody {
            display: table-row-group !important;
          }
          
          #clients-table tr {
            display: table-row !important;
            page-break-inside: avoid !important;
          }
          
          #clients-table th,
          #clients-table td {
            display: table-cell !important;
            border: 1px solid #333 !important;
            padding: 3px 4px !important;
            text-align: left !important;
            word-wrap: break-word !important;
          }
          
          #clients-table th {
            background-color: #1e2a3a !important;
            color: white !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
          }
          
          #clients-table tbody tr:nth-child(even) {
            background-color: #f9f9f9 !important;
          }
          
          /* Largeurs de colonnes */
          #clients-table th:nth-child(1), #clients-table td:nth-child(1) { width: 8%; }
          #clients-table th:nth-child(2), #clients-table td:nth-child(2) { width: 7%; }
          #clients-table th:nth-child(3), #clients-table td:nth-child(3) { width: 22%; }
          #clients-table th:nth-child(4), #clients-table td:nth-child(4) { width: 24%; }
          #clients-table th:nth-child(5), #clients-table td:nth-child(5) { width: 10%; }
          #clients-table th:nth-child(6), #clients-table td:nth-child(6) { width: 9%; }
          #clients-table th:nth-child(7), #clients-table td:nth-child(7) { width: 12%; }
          #clients-table th:nth-child(8), #clients-table td:nth-child(8) { width: 10%; }
          #clients-table th:nth-child(9), #clients-table td:nth-child(9) { width: 8%; }
          
          /* Cacher colonne Détail */
          #clients-table th:nth-child(10),
          #clients-table td:nth-child(10) {
            display: none !important;
          }
          
          /* En-tête de rapport */
          #clients-table::before {
            content: "BOMBA CASH - Liste des Clients";
            display: table-caption;
            caption-side: top;
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            padding: 10px 0;
            color: #1e2a3a;
          }
          
          #clients-table::after {
            content: "Exporté le: " attr(data-export-date);
            display: table-caption;
            caption-side: bottom;
            font-size: 8pt;
            text-align: right;
            padding: 5px 0;
            color: #666;
          }
        }
      `}</style>
    </div>
  );
}
