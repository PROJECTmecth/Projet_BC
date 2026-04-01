<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Client;
use App\Models\Carte;
use App\Models\Compte;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AgentClientsController extends Controller
{
    /**
     * GET /api/agent/clients
     */
    public function index(Request $request): JsonResponse
    {
        $agent = Agent::where('id_user', $request->user()->id)->first();
        if (!$agent) return response()->json(['success' => false, 'message' => 'Agent introuvable.'], 404);

        $clients = Client::with(['carte'])
            ->where('id_agent', $agent->id_agent)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($c) => [
                'id_client'       => $c->id_client,
                'nom_prenom'      => $c->prenom . ' ' . $c->nom,
                'telephone'       => $c->telephone,
                'adresse'         => $c->adresse,
                'ville'           => $c->ville,
                'numero_carte'    => $c->carte->numero_carte ?? 'N/A',
                'statut_carte'    => $c->carte->statut ?? 'N/A',
                'date_activation' => $c->carte->date_activation ?? null,
                'date_expiration' => $c->carte->date_expiration ?? null,
            ]);

        return response()->json(['success' => true, 'data' => ['total' => $clients->count(), 'clients' => $clients]]);
    }

    /**
     * GET /api/agent/clients/{id}
     */
    public function show(Request $request, $id): JsonResponse
    {
        $agent = Agent::where('id_user', $request->user()->id)->first();
        if (!$agent) return response()->json(['success' => false, 'message' => 'Agent introuvable.'], 404);

        $client = Client::with(['carte', 'compte'])
            ->where('id_client', $id)
            ->where('id_agent', $agent->id_agent)
            ->first();

        if (!$client) return response()->json(['success' => false, 'message' => 'Client introuvable.'], 404);

        // Transactions du client
        $transactions = Transaction::with(['kiosque', 'agent.user'])
            ->where('id_client', $client->id_client)
            ->orderBy('date_heure', 'desc')
            ->get()
            ->map(fn($t) => [
                'date'      => Carbon::parse($t->date_heure)->format('d/m/Y'),
                'heure'     => Carbon::parse($t->date_heure)->format('H\hi'),
                'operation' => match($t->type_op) {
                    'dépôt_cash'            => 'Dépôt cash',
                    'retrait_partiel'       => 'Retrait cash partiel',
                    'retrait_solde_compte'  => 'Retrait de solde',
                    default                 => $t->type_op,
                },
                'montant'   => number_format($t->montant, 0, ',', ' ') . ' F',
                'kiosque'   => $t->kiosque->nom_kiosque ?? '—',
                'agent'     => $t->agent->user->name ?? '—',
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'infos'        => [
                    'id_client'   => $client->id_client,
                    'prenom'      => $client->prenom,
                    'nom'         => $client->nom,
                    'activite'    => $client->activite,
                    'adresse'     => $client->adresse,
                    'ville'       => $client->ville,
                    'nationalite' => $client->nationalite,
                    'telephone'   => $client->telephone,
                    'type_piece'  => $client->type_piece,
                    'num_piece'   => $client->num_piece,
                ],
                'carte'        => $client->carte,
                'compte'       => $client->compte,
                'transactions' => $transactions,
            ],
        ]);
    }

    /**
     * POST /api/agent/scan
     */
    public function scanCarte(Request $request): JsonResponse
    {
        $request->validate(['qr_code_uid' => 'required|string']);
        $carte = Carte::where('qr_code_uid', $request->qr_code_uid)->first();

        if (!$carte) return response()->json(['success' => false, 'message' => 'Carte introuvable.'], 404);
        if ($carte->statut !== 'vierge') return response()->json([
            'success' => false,
            'message' => 'Cette carte est déjà utilisée (statut : ' . $carte->statut . ').',
        ], 422);

        return response()->json(['success' => true, 'message' => 'Carte valide.', 'data' => [
            'numero_carte' => $carte->numero_carte,
            'qr_code_uid'  => $carte->qr_code_uid,
            'duree'        => $carte->duree,
        ]]);
    }

    /**
     * POST /api/agent/clients/register
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'genre'       => 'required|in:Homme,Femme',
            'prenom'      => 'required|string|max:100',
            'nom'         => 'required|string|max:100',
            'adresse'     => 'required|string|max:255',
            'ville'       => 'required|string|max:100',
            'activite'    => 'required|string|max:150',
            'nationalite' => 'required|in:Résident,Étranger',
            'type_piece'  => 'required|in:CNI,NIU,Passeport,Permis',
            'num_piece'   => 'required|string|max:50|unique:clients',
            'telephone'   => 'required|string|max:20',
            'qr_code_uid' => 'required|string',
            'montant'     => 'required|numeric|min:1000',
            'duree'       => 'required|in:15 jours,30 jours',
        ]);

        $user  = $request->user();
        $agent = Agent::where('id_user', $user->id)->first();
        if (!$agent) return response()->json(['success' => false, 'message' => 'Agent introuvable.'], 404);

        $carte = Carte::where('qr_code_uid', $request->qr_code_uid)->where('statut', 'vierge')->first();
        if (!$carte) return response()->json(['success' => false, 'message' => 'Carte invalide ou déjà utilisée.'], 422);

        DB::beginTransaction();
        try {
            $client = Client::create([
                'genre'       => $request->genre,
                'prenom'      => $request->prenom,
                'nom'         => $request->nom,
                'adresse'     => $request->adresse,
                'ville'       => $request->ville,
                'activite'    => $request->activite,
                'nationalite' => $request->nationalite,
                'type_piece'  => $request->type_piece,
                'num_piece'   => $request->num_piece,
                'telephone'   => $request->telephone,
                'id_agent'    => $agent->id_agent,
                'id_user'     => $user->id,
            ]);

            $fraisGarde     = $request->montant * 0.5;
            $soldeFinal     = $request->montant - $fraisGarde;
            $nbJours        = $request->duree === '15 jours' ? 15 : 30;
            $dateActivation = Carbon::today();
            $dateExpiration = $dateActivation->copy()->addDays($nbJours);

            $carte->update([
                'id_client'       => $client->id_client,
                'id_agent'        => $agent->id_agent,
                'id_kiosque'      => $agent->id_kiosque,
                'statut'          => 'actif',
                'duree'           => $request->duree,
                'montant_initial' => $request->montant,
                'frais_garde'     => $fraisGarde,
                'progression'     => 0,
                'date_activation' => $dateActivation,
                'date_expiration' => $dateExpiration,
                'reset_date'      => $dateActivation,
            ]);

            Compte::create([
                'id_client'          => $client->id_client,
                'solde_total'        => $soldeFinal,
                'total_depots'       => $request->montant,
                'total_frais_garde'  => $fraisGarde,
                'date_ouverture'     => now(),
            ]);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Client enregistré avec succès.', 'data' => [
                'client'       => $client->prenom . ' ' . $client->nom,
                'numero_carte' => $carte->numero_carte,
                'solde'        => $soldeFinal,
                'expiration'   => $dateExpiration->format('d/m/Y'),
            ]], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/agent/transactions
     */
    public function storeTransaction(Request $request): JsonResponse
    {
        $request->validate([
            'id_client' => 'required|exists:clients,id_client',
            'type_op'   => 'required|in:dépôt_cash,retrait_partiel,retrait_solde_compte',
            'montant'   => 'required|numeric|min:100',
        ]);

        $user  = $request->user();
        $agent = Agent::where('id_user', $user->id)->first();
        if (!$agent) return response()->json(['success' => false, 'message' => 'Agent introuvable.'], 404);

        $client = Client::with(['carte', 'compte'])->find($request->id_client);
        if (!$client) return response()->json(['success' => false, 'message' => 'Client introuvable.'], 404);

        $compte = $client->compte;
        $carte  = $client->carte;
        $soldeAvant = $compte->solde_total;

        // Vérification solde pour retraits
        if (in_array($request->type_op, ['retrait_partiel', 'retrait_solde_compte'])) {
            if ($request->montant > $soldeAvant) {
                return response()->json(['success' => false, 'message' => 'Solde insuffisant.'], 422);
            }
        }

        DB::beginTransaction();
        try {
            $penalite   = 0;
            $soldeApres = $soldeAvant;

            if ($request->type_op === 'dépôt_cash') {
                $soldeApres = $soldeAvant + $request->montant;
                $compte->increment('total_depots', $request->montant);
                $compte->update(['solde_total' => $soldeApres]);
            } elseif ($request->type_op === 'retrait_partiel') {
                $penalite   = $request->montant * 0.10; // 10% pénalité
                $soldeApres = $soldeAvant - $request->montant;
                $compte->increment('total_retraits_partiels', $request->montant);
                $compte->increment('total_penalites', $penalite);
                $compte->update(['solde_total' => $soldeApres]);
            } elseif ($request->type_op === 'retrait_solde_compte') {
                $soldeApres = 0;
                $compte->increment('total_retraits', $soldeAvant);
                $compte->update(['solde_total' => 0, 'date_cloture' => now()]);
                $carte->update(['statut' => 'clôturé']);
            }

            // Calculer progression carte
            if ($carte && $carte->montant_initial > 0) {
                $progression = min(100, round(($compte->fresh()->solde_total / $carte->montant_initial) * 100));
                $carte->update(['progression' => $progression]);
            }

            Transaction::create([
                'id_carte'   => $carte->id_carte,
                'id_client'  => $client->id_client,
                'id_agent'   => $agent->id_agent,
                'id_kiosque' => $agent->id_kiosque,
                'type_op'    => $request->type_op,
                'montant'    => $request->montant,
                'penalite'   => $penalite,
                'solde_avant'=> $soldeAvant,
                'solde_apres'=> $soldeApres,
                'date_heure' => now(),
                'sync_status'=> 'synchronisé',
            ]);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Transaction enregistrée.', 'data' => [
                'solde_apres' => $soldeApres,
            ]]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }
}