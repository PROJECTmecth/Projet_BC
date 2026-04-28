<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClientController extends Controller
{
    /**
     * GET /api/admin/clients
     */
    public function index(Request $request): JsonResponse
    {
        $clients = Client::with(['carte', 'agent.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($c) => [
                'id_client'    => $c->id_client,
                'genre'        => $c->genre,
                'nom'          => $c->nom,
                'prenom'       => $c->prenom,
                'adresse'      => $c->adresse . ', ' . $c->ville,
                'nationalite'  => $c->nationalite,
                'type_piece'   => $c->type_piece,
                'num_piece'    => $c->num_piece,
                'activite'     => $c->activite,
                'telephone'    => $c->telephone,
                'numero_carte' => $c->carte->numero_carte ?? 'N/A',
                'statut_carte' => $c->carte->statut ?? 'N/A',
            ]);

        return response()->json([
            'success' => true,
            'total'   => $clients->count(),
            'data'    => $clients,
        ]);
    }

    /**
     * GET /api/admin/clients/{id}
     */
    public function show($id): JsonResponse
    {
        $client = Client::with(['carte', 'compte', 'agent.user'])->find($id);

        if (!$client) {
            return response()->json(['success' => false, 'message' => 'Client introuvable.'], 404);
        }

        $transactions = Transaction::with(['kiosque', 'agent.user'])
            ->where('id_client', $client->id_client)
            ->orderBy('date_heure', 'desc')
            ->get()
            ->map(fn($t) => [
                'date'      => Carbon::parse($t->date_heure)->format('d/m/Y'),
                'heure'     => Carbon::parse($t->date_heure)->format('H:i'),
                'operation' => match($t->type_op) {
                    'dépôt_cash'           => 'Dépôt',
                    'retrait_partiel'      => 'Retrait',
                    'retrait_solde_compte' => 'Retrait total',
                    default                => $t->type_op,
                },
                'montant'   => $t->montant,
                'type_op'   => $t->type_op,
                'kiosque'   => $t->kiosque->nom_kiosque ?? '—',
                'agent'     => 'Agent ' . ($t->agent->user->name ?? '—'),
            ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'infos' => [
                    'id_client'   => $client->id_client,
                    'genre'       => $client->genre,
                    'nom'         => $client->nom,
                    'prenom'      => $client->prenom,
                    'activite'    => $client->activite,
                    'adresse'     => $client->adresse . ', ' . $client->ville,
                    'telephone'   => $client->telephone,
                    'nationalite' => $client->nationalite,
                    'type_piece'  => $client->type_piece,
                    'num_piece'   => $client->num_piece,
                ],
                'carte' => [
                    'numero_carte'    => $client->carte->numero_carte ?? 'N/A',
                    'statut'          => $client->carte->statut ?? 'N/A',
                    'date_activation' => $client->carte?->date_activation
                        ? Carbon::parse($client->carte->date_activation)->format('d/m/Y') : '—',
                    'date_expiration' => $client->carte?->date_expiration
                        ? Carbon::parse($client->carte->date_expiration)->format('d/m/Y') : '—',
                    'progression'     => $client->carte->progression ?? 0,
                    'montant_actuel'  => $client->compte->solde_total ?? 0,
                ],
                'transactions' => $transactions,
            ],
        ]);
    }
}
