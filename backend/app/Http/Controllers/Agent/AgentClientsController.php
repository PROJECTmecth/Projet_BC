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
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class AgentClientsController extends Controller
{
    private const OPERATION_UNIT = 50000;
    private const MAX_OPERATIONS_PER_DAY = 3;

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
                'id_client'        => $c->id_client,
                'nom_prenom'       => $c->prenom . ' ' . $c->nom,
                'telephone'        => $c->telephone,
                'adresse'          => $c->adresse,
                'ville'            => $c->ville,
                'numero_carte'     => $c->carte->numero_carte ?? 'N/A',
                'statut_carte'     => $c->carte->statut ?? 'N/A',
                'date_activation'  => $c->carte->date_activation ?? null,
                'date_expiration'  => $c->carte->date_expiration ?? null,
                'photo_piece_url'  => (is_array($c->photo_pieces) && count($c->photo_pieces) > 0)
                    ? Storage::url($c->photo_pieces[0])
                    : ($c->photo_piece ? Storage::url($c->photo_piece) : null),
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
        $transactions = Transaction::with(['kiosque', 'agent.user', 'agent.kiosque'])
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
                'kiosque'   => $t->kiosque->nom_kiosque ?? $t->agent->kiosque->nom_kiosque ?? '—',
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
                    'photo_piece_url' => (is_array($client->photo_pieces) && count($client->photo_pieces) > 0)
                        ? Storage::url($client->photo_pieces[0])
                        : ($client->photo_piece ? Storage::url($client->photo_piece) : null),
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
            'genre'           => 'required|in:Homme,Femme',
            'prenom'          => 'required|string|max:100',
            'nom'             => 'required|string|max:100',
            'adresse'         => 'required|string|max:255',
            'ville'           => 'required|string|max:100',
            'activite'        => 'required|string|max:150',
            'nationalite'     => 'required|in:Résident,Étranger',
            'type_piece'      => 'required|in:CNI,NIU,Passeport,Permis',
            'num_piece'       => 'required|string|max:50|unique:clients',
            'photo_pieces'    => 'required_without:photo_piece|array|min:1|max:2',
            'photo_pieces.*'  => 'file|image|mimes:jpeg,png,jpg,gif,webp,heic,heif|max:10240',
            'photo_piece'     => 'sometimes|file|image|mimes:jpeg,png,jpg,gif,webp,heic,heif|max:10240',
            'telephone'       => 'required|string|max:20',
            'qr_code_uid'     => 'required|string',
            'montant'         => 'required|numeric|min:1000',
            'duree'           => 'required|in:15 jours,30 jours',
        ]);

        $user  = $request->user();
        $agent = Agent::where('id_user', $user->id)->first();
        if (!$agent) return response()->json(['success' => false, 'message' => 'Agent introuvable.'], 404);

        $carte = Carte::where('qr_code_uid', $request->qr_code_uid)->where('statut', 'vierge')->first();
        if (!$carte) return response()->json(['success' => false, 'message' => 'Carte invalide ou déjà utilisée.'], 422);

        DB::beginTransaction();
        try {
            $photoPath  = null;
            $photoPaths = [];

            if ($request->hasFile('photo_pieces')) {
                foreach ($request->file('photo_pieces') as $file) {
                    $photoPaths[] = $file->store('client_photos', 'public');
                }
            } elseif ($request->hasFile('photo_piece')) {
                $photoPaths[] = $request->file('photo_piece')->store('client_photos', 'public');
            }

            if (count($photoPaths) > 0) {
                $photoPath = $photoPaths[0];
            }

            $client = Client::create([
                'genre'         => $request->genre,
                'prenom'        => $request->prenom,
                'nom'           => $request->nom,
                'adresse'       => $request->adresse,
                'ville'         => $request->ville,
                'activite'      => $request->activite,
                'nationalite'   => $request->nationalite,
                'type_piece'    => $request->type_piece,
                'num_piece'     => $request->num_piece,
                'photo_piece'   => $photoPath,
                'photo_pieces'  => $photoPaths,
                'telephone'     => $request->telephone,
                'id_agent'      => $agent->id_agent,
                'id_user'       => $user->id,
            ]);

            $montant = (float) $request->montant;

            $nbJours        = $request->duree === '15 jours' ? 15 : 30;
            $tauxFrais      = $nbJours === 15 ? 0.5 : 1.0; // 50% pour 15j, 100% pour 30j
            $fraisGarde     = $montant * $tauxFrais;
            $soldeFinal     = $montant - $fraisGarde;
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
                'progression'     => min(100, round(($soldeFinal / ($request->montant * $nbJours)) * 100)),
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

    private function resetDailyOperationCounters(Carte $carte): void
    {
        $today = Carbon::today()->toDateString();
        if ($carte->reset_date !== $today) {
            $carte->update([
                'nb_depots_jour' => 0,
                'nb_retraits_jour' => 0,
                'reset_date' => $today,
            ]);
        }
    }

    private function calculateDepositOperationUnits(float $montant): int
    {
        return max(1, (int) ceil($montant / self::OPERATION_UNIT));
    }

    private function canProcessDailyOperation(Carte $carte, int $units = 1): bool
    {
        $this->resetDailyOperationCounters($carte);

        $usedOperations = (int) $carte->nb_depots_jour + (int) $carte->nb_retraits_jour;

        return ($usedOperations + $units) <= self::MAX_OPERATIONS_PER_DAY;
    }

    private function resolveDepositBaseAmount(?Carte $carte, ?Compte $compte): float
    {
        return (float) self::OPERATION_UNIT;
    }

    private function syncCompteTotals(Compte $compte, int $idClient): void
    {
        $stats = Transaction::where('id_client', $idClient)
            ->selectRaw('COALESCE(SUM(CASE WHEN type_op = "dépôt_cash" THEN montant ELSE 0 END), 0) as total_depots')
            ->selectRaw('COALESCE(SUM(CASE WHEN type_op = "retrait_solde_compte" THEN montant ELSE 0 END), 0) as total_retraits')
            ->selectRaw('COALESCE(SUM(CASE WHEN type_op = "retrait_partiel" THEN montant ELSE 0 END), 0) as total_retraits_partiels')
            ->selectRaw('COALESCE(SUM(CASE WHEN type_op IN ("retrait_partiel", "retrait_solde_compte") THEN penalite ELSE 0 END), 0) as total_penalites')
            ->first();

        $compte->update([
            'total_depots'            => max((float) $compte->total_depots, (float) $stats->total_depots),
            'total_retraits'         => max((float) $compte->total_retraits, (float) $stats->total_retraits),
            'total_retraits_partiels'=> max((float) $compte->total_retraits_partiels, (float) $stats->total_retraits_partiels),
            'total_penalites'        => max((float) $compte->total_penalites, (float) $stats->total_penalites),
        ]);
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
        if ($request->type_op === 'retrait_solde_compte') {
            if ($request->montant > $soldeAvant) {
                return response()->json(['success' => false, 'message' => 'Solde insuffisant.'], 422);
            }
        } elseif ($request->type_op === 'retrait_partiel') {
            $penaliteCalculee = 100;
            if (($request->montant + $penaliteCalculee) > $soldeAvant) {
                return response()->json(['success' => false, 'message' => "Solde insuffisant pour ce retrait partiel (incluant la pénalité de {$penaliteCalculee} F)."], 422);
            }
        }

        DB::beginTransaction();
        try {
            $penalite   = 0;
            $soldeApres = $soldeAvant;

            if ($request->type_op === 'dépôt_cash') {
                $montantDepot = (float) $request->montant;
                $unitsRequired = $this->calculateDepositOperationUnits($montantDepot);

                if ($unitsRequired > self::MAX_OPERATIONS_PER_DAY || !$this->canProcessDailyOperation($carte, $unitsRequired)) {
                    return response()->json(['success' => false, 'message' => 'Le client a déjà atteint la limite de 3 opérations pour la journée.'], 422);
                }

                $montantTotal = $montantDepot;
                $currentSolde = $soldeAvant;

                while ($montantTotal > 0) {
                    $montantTranche = (float) $montantTotal;
                    $soldeTrancheAvant = $currentSolde;
                    $soldeTrancheApres = $soldeTrancheAvant + $montantTranche;

                    $compte->increment('total_depots', $montantTranche);
                    $compte->update(['solde_total' => $soldeTrancheApres]);

                    Transaction::create([
                        'id_carte'   => $carte->id_carte,
                        'id_client'  => $client->id_client,
                        'id_agent'   => $agent->id_agent,
                        'id_kiosque' => $agent->id_kiosque,
                        'type_op'    => $request->type_op,
                        'montant'    => $montantTranche,
                        'penalite'   => 0,
                        'solde_avant'=> $soldeTrancheAvant,
                        'solde_apres'=> $soldeTrancheApres,
                        'date_heure' => now(),
                        'sync_status'=> 'synchronisé',
                    ]);

                    $currentSolde = $soldeTrancheApres;
                    $montantTotal -= $montantTranche;
                }

                $this->resetDailyOperationCounters($carte);
                $carte->update([
                    'nb_depots_jour' => (int) $carte->nb_depots_jour + $unitsRequired,
                    'reset_date' => Carbon::today()->toDateString(),
                ]);

                $soldeApres = $currentSolde;
            } elseif ($request->type_op === 'retrait_partiel') {
                if (!$this->canProcessDailyOperation($carte, 1)) {
                    return response()->json(['success' => false, 'message' => 'Le client a déjà atteint la limite de 3 opérations pour la journée.'], 422);
                }

                $penalite   = 100; // pénalité fixe de 100 F pour chaque retrait partiel
                $soldeApres = $soldeAvant - $request->montant - $penalite; // Diminution effective du solde
                $compte->increment('total_retraits_partiels', $request->montant);
                $compte->increment('total_penalites', $penalite);
                $compte->update(['solde_total' => $soldeApres]);

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

                $this->resetDailyOperationCounters($carte);
                $carte->update([
                    'nb_retraits_jour' => (int) $carte->nb_retraits_jour + 1,
                    'reset_date' => Carbon::today()->toDateString(),
                ]);
            } elseif ($request->type_op === 'retrait_solde_compte') {
                if (!$this->canProcessDailyOperation($carte, 1)) {
                    return response()->json(['success' => false, 'message' => 'Le client a déjà atteint la limite de 3 opérations pour la journée.'], 422);
                }

                $soldeApres = 0;
                $compte->increment('total_retraits', $soldeAvant);
                $compte->update(['solde_total' => 0, 'date_cloture' => now()]);
                // La carte expire automatiquement lors du retrait total
                $carte->update(['statut' => 'terminé', 'date_expiration' => now()]);

                Transaction::create([
                    'id_carte'   => $carte->id_carte,
                    'id_client'  => $client->id_client,
                    'id_agent'   => $agent->id_agent,
                    'id_kiosque' => $agent->id_kiosque,
                    'type_op'    => $request->type_op,
                    'montant'    => $request->montant,
                    'penalite'   => 0,
                    'solde_avant'=> $soldeAvant,
                    'solde_apres'=> $soldeApres,
                    'date_heure' => now(),
                    'sync_status'=> 'synchronisé',
                ]);

                $this->resetDailyOperationCounters($carte);
                $carte->update([
                    'nb_retraits_jour' => (int) $carte->nb_retraits_jour + 1,
                    'reset_date' => Carbon::today()->toDateString(),
                ]);
            }

            $this->syncCompteTotals($compte, $client->id_client);

            // Calculer progression carte par rapport à l'objectif total (15 ou 30 jours)
            if ($carte && $carte->montant_initial > 0) {
                $nbJours = $carte->duree === '15 jours' ? 15 : 30;
                $objectifFinal = $carte->montant_initial * $nbJours;
                // S'assurer qu'on ne tombe pas sous 0
                $prog = round(($compte->fresh()->solde_total / $objectifFinal) * 100);
                $progression = max(0, min(100, $prog));
                $carte->update(['progression' => $progression]);
            }

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
