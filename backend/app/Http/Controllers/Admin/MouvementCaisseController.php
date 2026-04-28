<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class MouvementCaisseController extends Controller
{
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
        $totalGarde    = $transactions->sum(fn($t) => $t->carte?->frais_garde ?? 0);
        $totalSolde    = $transactions->sum('solde_apres');

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
}
