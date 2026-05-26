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
     * Journal des transactions + totaux (pour OperationsTable)
     */
    public function index(Request $request)
    {
        $transactions = Transaction::with(['carte', 'client', 'agent', 'kiosque'])
            ->orderBy('date_heure', 'desc')
            ->get();

        $data = $transactions->map(function ($t) {
            $fraisGarde = $t->carte?->frais_garde ?? 0;

            return [
                'id_trans'    => $t->id_trans,
                'id_carte'    => $t->carte?->numero_carte ?? $t->id_carte,
                'id_client'   => $t->client?->code_client ?? $t->id_client,
                'nom_client'  => $t->client?->nom . ' ' . $t->client?->prenom ?? '',
                'type_op'     => $t->type_op,
                'montant'     => $t->montant,
                'frais_garde' => $fraisGarde,
                'penalite'    => $t->penalite,
                'solde_avant' => $t->solde_avant,
                'solde_apres' => $t->solde_apres,
                'date_heure'  => $t->date_heure,
            ];
        });

        // Totaux
        $totalDepot    = $transactions->where('type_op', 'dépôt_cash')->sum('montant');
        $totalRetrait  = $transactions->whereIn('type_op', ['retrait_partiel', 'retrait_solde_compte'])->sum('montant');
        $totalPenalite = $transactions->sum('penalite');
        $totalGarde    = Compte::sum('total_frais_garde');
        $totalSolde    = Compte::sum('solde_total');

        return response()->json([
            'success'      => true,
            'transactions' => $data,
            'totaux'       => [
                'total_depot'    => $totalDepot,
                'total_retrait'  => $totalRetrait,
                'total_penalite' => $totalPenalite,
                'total_garde'    => $totalGarde,
                'total_solde'    => $totalSolde,
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/admin/mouvements/caisse/revenus
    // Pour le Dashboard : total des revenus encaissés par le service (mois en cours)
    // ──────────────────────────────────────────────────────────────────────
    public function revenus(): JsonResponse
    {
        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        // 💰 Frais de garde : une fois par carte activée ce mois-ci
        $fraisGarde = Carte::whereBetween('date_activation', [$startDate, $endDate])
            ->where('statut', 'actif')
            ->sum('frais_garde');

        // ⚠️ Pénalités : sur les transactions de retrait ce mois-ci
        $penalites = Transaction::whereBetween('date_heure', [$startDate, $endDate])
            ->whereIn('type_op', ['retrait_partiel', 'retrait_solde_compte'])
            ->sum('penalite');

        $total = $fraisGarde + $penalites;

        return response()->json([
            'success' => true,
            'data' => [
                'total' => round($total, 2),
                'breakdown' => [
                    'frais_garde' => round($fraisGarde, 2),
                    'penalites' => round($penalites, 2),
                ],
                'period' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d'),
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
        } catch (\Exception $e) {
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
}