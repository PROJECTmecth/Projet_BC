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

        // N'affiche que le kiosque assigné à l'agent s'il est actif
        $totalKiosques = $agent->id_kiosque
            ? Kiosque::where('id_kiosque', $agent->id_kiosque)->where('statut_service', 'actif')->count()
            : 0;

        // Somme des soldes uniquement pour les clients de cet agent
        $soldeTotal = DB::table('comptes')
            ->join('clients', 'comptes.id_client', '=', 'clients.id_client')
            ->where('clients.id_agent', $agent->id_agent)
            ->sum('comptes.solde_total') ?? 0;

        $revenusEncaisses = Transaction::where('id_agent', $agent->id_agent)
            ->whereDate('created_at', Carbon::today())
            ->sum('penalite') ?? 0;

        $rapportJour = Transaction::with(['carte', 'client', 'agent.user'])
            ->where('id_agent', $agent->id_agent)
            ->whereDate('date_heure', Carbon::today())
            ->orderBy('date_heure', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id_carte'   => $transaction->carte->numero_carte ?? 'N/A',
                    'nom_prenom' => ($transaction->client->prenom ?? '') . ' ' . ($transaction->client->nom ?? ''),
                    'operation'  => $transaction->type_op,
                    'montant'    => number_format($transaction->montant, 0, ',', ' ') . ' F',
                    'heure'      => $transaction->date_heure->format('H:i'),
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