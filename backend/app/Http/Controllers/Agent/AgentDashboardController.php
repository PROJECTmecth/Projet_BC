<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Client;
use App\Models\Kiosque;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AgentDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $agent = Agent::with(['kiosque', 'user'])
            ->where('id_user', $user->id)
            ->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Profil agent introuvable.',
            ], 404);
        }

        $totalClients = Client::where('id_agent', $agent->id_agent)->count();

        $totalKiosques = Kiosque::where('statut_service', 'actif')->count();

        $soldeTotal = DB::table('comptes')->sum('solde_total') ?? 0;

        $revenusEncaisses = Transaction::where('id_agent', $agent->id_agent)
            ->whereDate('created_at', Carbon::today())
            ->sum('penalite') ?? 0;

        $rapportJour = Transaction::with(['carte', 'client', 'agent.user'])
            ->where('id_agent', $agent->id_agent)
            ->whereDate('created_at', Carbon::today())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id_carte'   => $transaction->carte->qr_code_uid ?? 'N/A',
                    'nom_prenom' => ($transaction->client->nom ?? '') . ' ' . ($transaction->client->prenom ?? ''),
                    'operation'  => $transaction->type_op,
                    'montant'    => number_format($transaction->montant, 0, ',', ' ') . ' F',
                    'heure'      => $transaction->created_at->format('H:i'),
                    'agent'      => $transaction->agent->user->name ?? 'N/A',
                ];
            });

        $profil = [
            'nom'       => $user->name,
            'kiosque'   => $agent->kiosque->code_kiosque ?? 'N/A',
            'adresse'   => $agent->kiosque->adresse ?? 'N/A',
            'ville'     => $agent->kiosque->ville ?? 'N/A',
            'telephone' => $agent->telephone,
            'statut'    => $agent->statut_ligne,
            'latitude'  => $agent->kiosque->latitude ?? null,
            'longitude' => $agent->kiosque->longitude ?? null,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_clients'     => $totalClients,
                    'total_kiosques'    => $totalKiosques,
                    'solde_total'       => $soldeTotal,
                    'revenus_encaisses' => $revenusEncaisses,
                ],
                'profil'       => $profil,
                'rapport_jour' => $rapportJour,
            ],
        ]);
    }
}