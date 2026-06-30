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
     * Liste de tous les clients avec leurs informations
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
     * Détails d'un client spécifique
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

    /**
     * GET /api/admin/clients/analytics
     * Données pour le Dashboard : démographie + enregistrements mensuels (100% dynamique)
     */
    public function analytics(): JsonResponse
    {
        // 📊 Total clients
        $total = Client::count();
        
        // 📊 Démographie par genre
        $hommes = Client::where('genre', 'Homme')->count();
        $femmes = Client::where('genre', 'Femme')->count();
        
        // 📊 Catégories par activité
        $categories = Client::selectRaw('activite, COUNT(*) as count')
            ->groupBy('activite')
            ->orderByDesc('count')
            ->get()
            ->map(fn($c) => [
                'label' => $c->activite ?? 'Autre',
                'count' => $c->count,
                'color' => match($c->activite) {
                    'Commerçant'    => 'text-blue-600',
                    'Ménagère'      => 'text-purple-600',
                    'Travailleurs'  => 'text-yellow-600',
                    'Étudiants'     => 'text-green-600',
                    default         => 'text-gray-600',
                },
                'bg' => match($c->activite) {
                    'Commerçant'    => 'bg-blue-50',
                    'Ménagère'      => 'bg-purple-50',
                    'Travailleurs'  => 'bg-yellow-50',
                    'Étudiants'     => 'bg-green-50',
                    default         => 'bg-gray-50',
                },
            ]);
        
        // 📈 Enregistrements par mois : 12 derniers mois (100% dynamique depuis la BDD)
        $monthly = collect(range(11, 0))->map(function ($i) {
            $date = now()->copy()->subMonths($i);
            
            // Compte UNIQUEMENT les clients créés ce mois-ci ET cette année-là
            $count = Client::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();
            
            return [
                'month'   => $date->format('M'),  // Ex: "Jan", "Feb" (anglais → converti en frontend)
                'clients' => $count,              // ← Nombre RÉEL depuis la BDD, PAS de hardcoded
            ];
        })->values();
        
        return response()->json([
            'success' => true,
            'data'    => [
                'demographics' => [
                    'hommes'    => $total > 0 ? round(($hommes / $total) * 100) : 0,
                    'femmes'    => $total > 0 ? round(($femmes / $total) * 100) : 0,
                    'hommesCnt' => $hommes,
                    'femmesCnt' => $femmes,
                    'categories'=> $categories,
                ],
                'monthly' => $monthly,  // ← Tableau de 12 objets avec vrais chiffres dynamiques
            ],
        ]);
    }
}