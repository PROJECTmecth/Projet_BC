<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Carte;
use App\Models\Compte;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MouvementCaisseController extends Controller
{
    /**
     * GET /api/admin/mouvements/caisse
     * Journal des transactions - AVEC pagination, tri et filtrage
     * 
     * Query Parameters:
     *   - limit: int (default: 10) — nombre de résultats par page
     *   - page: int (default: 1) — numéro de page
     *   - sort_by: string (default: 'date_heure') — colonne à trier: 'date_heure', 'montant', 'type_op'
     *   - sort_order: string (default: 'desc') — 'asc' ou 'desc'
     *   - type: string — filtrer par type: 'dépôt_cash', 'retrait_partiel', 'retrait_solde_compte'
     *   - date_from: string (YYYY-MM-DD) — filtrer à partir de cette date
     *   - date_to: string (YYYY-MM-DD) — filtrer jusqu'à cette date
     *   - search: string — rechercher par nom client ou numéro carte
     */
    public function index(Request $request): JsonResponse
    {
        // 📋 Paramètres avec valeurs par défaut
        $limit = (int) $request->query('limit', 10);
        $page = (int) $request->query('page', 1);
        $sortBy = $request->query('sort_by', 'date_heure');
        $sortOrder = $request->query('sort_order', 'desc');
        $typeFilter = $request->query('type');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $search = $request->query('search');

        // 🔍 Query builder
        $query = Transaction::with(['carte', 'client', 'agent.user', 'agent.kiosque', 'kiosque']);

        // 🏷️ Filtrer par type d'opération
        if ($typeFilter) {
            $query->where('type_op', $typeFilter);
        }

        // 📅 Filtrer par plage de dates
        if ($dateFrom) {
            $query->whereDate('date_heure', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('date_heure', '<=', $dateTo);
        }

        
        // ⏱️ Filtrer les opérations récentes (dernières 24h)
        if ($request->query('recent_only') == 1) {
            $query->where('date_heure', '>=', now()->subHours(24));
        }

        // 🔎 Recherche par nom client ou numéro carte
        if ($search) {
            $query->whereHas('client', function ($q) use ($search) {
                $q->where('nom', 'LIKE', "%$search%")
                  ->orWhere('prenom', 'LIKE', "%$search%");
            })->orWhereHas('carte', function ($q) use ($search) {
                $q->where('numero_carte', 'LIKE', "%$search%");
            });
        }

        // 📊 Tri
        if (in_array($sortBy, ['date_heure', 'montant', 'type_op'])) {
            $query->orderBy($sortBy, strtoupper($sortOrder) === 'ASC' ? 'asc' : 'desc');
        } else {
            $query->orderBy('date_heure', 'desc');
        }

        // � Totaux calculés sur l'ensemble des résultats filtrés
        $summaryQuery = (clone $query);
        $totalDepot = (float) $summaryQuery->where('type_op', 'dépôt_cash')->sum('montant');
        $totalRetrait = (float) $summaryQuery->whereIn('type_op', ['retrait_partiel', 'retrait_solde_compte'])->sum('montant');
        $totalPenalite = (float) $summaryQuery->sum('penalite');
        $totalSolde = $totalDepot - $totalRetrait - $totalPenalite;

        // 📄 Pagination
        $total = $query->count();
        $transactions = $query->skip(($page - 1) * $limit)
                              ->take($limit)
                              ->get();

        // 🔄 Format des données
        $data = $transactions->map(function ($t) {
            $fraisGarde = $t->carte?->frais_garde ?? 0;

            // Récupération du nom de l'agent : certains agents sont liés via user->name
            $agentName = $t->agent?->user?->name
                ?? trim(($t->agent?->nom ?? '') . ' ' . ($t->agent?->prenom ?? ''))
                ?? '-';

            return [
                'id_trans'    => $t->id_trans,
                'id_carte'    => $t->carte?->numero_carte ?? $t->id_carte,
                'id_client'   => $t->client?->code_client ?? $t->id_client,
                'nom_client'  => trim(($t->client?->nom ?? '') . ' ' . ($t->client?->prenom ?? '')),
                'nom_agent'   => $agentName,
                'nom_kiosque' => $t->kiosque?->nom_kiosque ?? $t->agent?->kiosque?->nom_kiosque ?? '',
                'type_op'     => $t->type_op,
                'montant'     => $t->montant,
                'frais_garde' => $fraisGarde,
                'penalite'    => $t->penalite,
                'solde_avant' => $t->solde_avant,
                'solde_apres' => $t->solde_apres,
                'date_heure'  => $t->date_heure,
            ];
        });

        // 📊 Calcul des totaux globaux de la caisse
        $totalDepot = Transaction::where('type_op', 'dépôt_cash')->sum('montant');
        $totalRetrait = Transaction::whereIn('type_op', ['retrait_partiel', 'retrait_solde_compte'])->sum('montant');
        $totalPenalite = Transaction::sum('penalite');
        $totalSolde = Compte::whereNull('date_cloture')->sum('solde_total');

        return response()->json([
            'success'      => true,
            'transactions' => $data,
            'totaux'       => [
                'total_depot'    => round($totalDepot, 2),
                'total_retrait'  => round($totalRetrait, 2),
                'total_penalite' => round($totalPenalite, 2),
                'total_solde'    => round($totalSolde, 2),
            ],
            'pagination'   => [
                'current_page' => $page,
                'limit'        => $limit,
                'total'        => $total,
                'total_pages'  => ceil($total / $limit),
            ],
            'totaux'       => [
                'total_depot'    => (float) $totalDepot,
                'total_retrait'  => (float) $totalRetrait,
                'total_penalite' => (float) $totalPenalite,
                'total_solde'    => (float) $totalSolde,
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/admin/mouvements/caisse/revenus
    // Pour le Dashboard : total des revenus encaissés par le service (mois en cours)
    // ──────────────────────────────────────────────────────────────────────
    public function revenus(): JsonResponse
    {
        $fraisGarde = Carte::where('statut', 'actif')->sum('frais_garde');

        $penalites = Transaction::whereIn('type_op', ['retrait_partiel', 'retrait_solde_compte'])
            ->sum('penalite');

        $total = $fraisGarde + $penalites;

        return response()->json([
            'success' => true,
            'data' => [
                'total'     => round($total, 2),
                'breakdown' => [
                    'frais_garde' => round($fraisGarde, 2),
                    'penalites'   => round($penalites, 2),
                ],
            ],
        ]);
    }


    // ──────────────────────────────────────────────────────────────────────
    // GET /api/admin/mouvements-caisse/revenus/detail
    // Pour la page détail : Frais de garde + Pénalités (avec historique 6 mois)
    // ──────────────────────────────────────────────────────────────────────
    public function revenusDetail(Request $request): JsonResponse
    {
        // Récupérer le mois depuis les query params (format: YYYY-MM)
        $monthParam = $request->query('month', now()->format('Y-m'));

        try {
            $startDate = Carbon::createFromFormat('Y-m', $monthParam)->startOfMonth();
            $endDate = Carbon::createFromFormat('Y-m', $monthParam)->endOfMonth();
        } catch (\Exception) {
            // Fallback sur le mois courant si format invalide
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
            $monthParam = $startDate->format('Y-m');
        }

        // 💰 Frais de garde : une fois par carte activée ce mois-ci
        $fraisGarde = Carte::whereBetween('date_activation', [$startDate, $endDate])
            ->where('statut', 'actif')
            ->sum('frais_garde');

        // ⚠️ Pénalités : sur les transactions de retrait ce mois-ci
        $penalites = Transaction::whereBetween('date_heure', [$startDate, $endDate])
            ->whereIn('type_op', ['retrait_partiel', 'retrait_solde_compte'])
            ->sum('penalite');

        // 📊 Historique sur 6 derniers mois pour graphique/tableau
        $history = collect(range(5, 0))->map(function ($i) use ($monthParam) {
            $date = Carbon::createFromFormat('Y-m', $monthParam)->copy()->subMonths($i);
            $start = $date->copy()->startOfMonth();
            $end = $date->copy()->endOfMonth();

            $fg = Carte::whereBetween('date_activation', [$start, $end])
                ->where('statut', 'actif')
                ->sum('frais_garde');

            $pen = Transaction::whereBetween('date_heure', [$start, $end])
                ->whereIn('type_op', ['retrait_partiel', 'retrait_solde_compte'])
                ->sum('penalite');

            return [
                'month' => $date->format('M Y'),  // Ex: "Nov 2025"
                'frais_garde' => round($fg, 2),
                'penalites' => round($pen, 2),
                'total' => round($fg + $pen, 2),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'month' => $monthParam,
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d'),
                ],
                'current' => [
                    'frais_garde' => round($fraisGarde, 2),
                    'penalites' => round($penalites, 2),
                    'total' => round($fraisGarde + $penalites, 2),
                ],
                'history' => $history,
            ],
        ]);
    }


    // ──────────────────────────────────────────────────────────────────────
    // GET /api/admin/transactions
    // Journal des transactions pour le Dashboard Admin
    // 
    // Query Parameters:
    //   - limit: int (default: 15)
    //   - page: int (default: 1)
    //   - sort_by: 'date_heure' | 'montant' | 'type_op' (default: 'date_heure')
    //   - sort_order: 'asc' | 'desc' (default: 'desc')
    //   - date_from: YYYY-MM-DD
    //   - date_to: YYYY-MM-DD
    //   - type: 'dépôt_cash' | 'retrait_partiel' | 'retrait_solde_compte'
    //   - search: string (recherche par nom client ou numéro carte)
    // ──────────────────────────────────────────────────────────────────────
    public function journal(Request $request): JsonResponse
    {
        // 📋 Paramètres avec valeurs par défaut
        $limit = (int) $request->query('limit', 15);
        $page = (int) $request->query('page', 1);
        $sortBy = $request->query('sort_by', 'date_heure');
        $sortOrder = $request->query('sort_order', 'desc');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $typeFilter = $request->query('type');
        $search = $request->query('search');

        // 🔍 Query builder
        $query = Transaction::with(['carte', 'client', 'agent.user', 'agent.kiosque', 'kiosque'])
            ->select([
                'id_trans', 'id_carte', 'id_client', 'id_agent', 'id_kiosque',
                'type_op', 'montant', 'penalite', 'date_heure'
            ]);

        // 📅 Filtrer par plage de dates
        if ($dateFrom) {
            $query->whereDate('date_heure', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('date_heure', '<=', $dateTo);
        }

        // 🏷️ Filtrer par type d'opération
        if ($typeFilter) {
            $query->where('type_op', $typeFilter);
        }

        // 🔎 Recherche par nom client ou numéro carte
        if ($search) {
            $query->whereHas('client', function ($q) use ($search) {
                $q->where('nom', 'LIKE', "%$search%")
                  ->orWhere('prenom', 'LIKE', "%$search%");
            })->orWhereHas('carte', function ($q) use ($search) {
                $q->where('numero_carte', 'LIKE', "%$search%");
            });
        }

        // 📊 Tri
        if (in_array($sortBy, ['date_heure', 'montant', 'type_op'])) {
            $query->orderBy($sortBy, strtoupper($sortOrder) === 'ASC' ? 'asc' : 'desc');
        } else {
            $query->orderBy('date_heure', 'desc');
        }

        // 📄 Pagination
        $total = $query->count();
        $transactions = $query->skip(($page - 1) * $limit)
                              ->take($limit)
                              ->get();

        // 🔄 Format des données pour le journal
        $data = $transactions->map(function ($t) {
            $agentName = $t->agent?->user?->name
                ?? trim(($t->agent?->nom ?? '') . ' ' . ($t->agent?->prenom ?? ''))
                ?? '';
            return [
                'id_trans'    => $t->id_trans,
                'date'        => $t->date_heure ? Carbon::parse($t->date_heure)->format('d/m/Y') : '',
                'heure'       => $t->date_heure ? Carbon::parse($t->date_heure)->format('H:i:s') : '',
                'nom'         => trim(($t->client?->nom ?? '') . ' ' . ($t->client?->prenom ?? '')),
                'operation'   => ucfirst(str_replace('_', ' ', $t->type_op)),
                'montant'     => (float) $t->montant,
                'telephone'   => $t->client?->telephone ?? '',
                'numero_carte'=> $t->carte?->numero_carte ?? '',
                'kiosque'     => $t->kiosque?->nom_kiosque ?? $t->agent?->kiosque?->nom_kiosque ?? '',
                'agent'       => $agentName,
            ];
        });

        // 📊 Statistiques
        $stats = [
            'total_operations' => $total,
            'total_depots' => $transactions->whereIn('type_op', ['dépôt_cash'])->count(),
            'total_retraits_partiels' => $transactions->whereIn('type_op', ['retrait_partiel'])->count(),
            'total_retraits_solde' => $transactions->whereIn('type_op', ['retrait_solde_compte'])->count(),
            'montant_total_depots' => (float) $transactions->where('type_op', 'dépôt_cash')->sum('montant'),
            'montant_total_retraits' => (float) $transactions->whereIn('type_op', ['retrait_partiel', 'retrait_solde_compte'])->sum('montant'),
        ];

        return response()->json([
            'success'      => true,
            'data'         => $data,
            'pagination'   => [
                'current_page' => $page,
                'limit'        => $limit,
                'total'        => $total,
                'total_pages'  => ceil($total / $limit),
            ],
            'stats'        => $stats,
        ]);
    }
}