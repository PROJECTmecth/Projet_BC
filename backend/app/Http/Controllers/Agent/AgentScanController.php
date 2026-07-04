<?php

/**
 * BOMBA CASH — AgentScanController.php
 * Contrôleur : Scan QR / recherche carte par numéro
 * Auteur : Johann Finance SA © 2026
 * Namespace : App\Http\Controllers\Agent
 *
 * Route : POST /api/agent/scan
 * Middleware : auth:sanctum, role:agent
 */

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Carte;
use App\Models\Client;
use App\Models\Compte;
use App\Models\Agent;
use App\Models\Transaction;

class AgentScanController extends Controller
{
    /**
     * POST /api/agent/scan
     *
     * Vérifie qu'une carte appartient bien à un client
     * géré par l'agent authentifié, puis retourne les détails.
     *
     * Body JSON attendu :
     *   { "numero_carte": "BC-2024-0001" } ou UUID
     *
     * Réponse 200 :
     *   { carte, client, compte, is_vierge }
     *
     * Erreurs possibles :
     *   400 — champ manquant
     *   403 — carte hors périmètre de l'agent
     *   404 — carte introuvable
     *   422 — validation Laravel
     */
    public function scan(Request $request): JsonResponse
    {
        // ── 1. Validation ──────────────────────────────────────
        $validated = $request->validate([
            'numero_carte' => ['required', 'string', 'max:64'],
        ], [
            'numero_carte.required' => 'Le numéro de carte est obligatoire.',
            'numero_carte.string'   => 'Format de numéro invalide.',
        ]);

        $numeroCarte = trim($validated['numero_carte']);

        // ── 2. Récupération de la carte ────────────────────────
        // ✅ Cherche par UUID (qr_code_uid) OU par numero_carte
        $carte = Carte::where('qr_code_uid', $numeroCarte)
            ->orWhere('numero_carte', $numeroCarte)
            ->first();

        if (! $carte) {
            return response()->json([
                'message' => 'Carte introuvable. Vérifiez le numéro ou scannez à nouveau.',
            ], 404);
        }

        // ── 3. Récupération du client ──────────────────────────
        $client = Client::find($carte->id_client);

        // ✅ NOUVELLE LOGIQUE : Carte vierge détectée
        if (! $client) {
            return response()->json([
                'carte'     => $this->formatCarte($carte),
                'is_vierge' => true,
                'message'   => 'Carte vierge, prête à être assignée.',
            ], 200);
        }

        // ── 4. Vérification du périmètre agent ─────────────────
        //    L'agent ne peut scanner que les cartes de SES clients.
        $agent = Agent::where('id_user', Auth::id())->first();

        if ($agent && (int) $client->id_agent !== (int) $agent->id_agent) {
            return response()->json([
                'message' => 'Cette carte n\'appartient pas à un client de votre portefeuille.',
            ], 403);
        }

        // ── 5. Récupération du compte ──────────────────────────
        $compte = Compte::where('id_client', $client->id_client)->first();
        if ($compte) {
            $this->syncCompteFromTransactions($compte, $client->id_client);
            $compte = $compte->fresh();
        }

        // ── 6. Retour ──────────────────────────────────────────
        return response()->json([
            'carte'     => $this->formatCarte($carte),
            'client'    => $this->formatClient($client),
            'compte'    => $this->formatCompte($compte),
            'is_vierge' => false,
        ], 200);
    }

    /* ── Formatage / sérialisation sécurisée ─────────────────── */

    private function formatCarte(Carte $c): array
    {
        return [
            'id_carte'         => $c->id_carte,
            'qr_code_uid'      => $c->qr_code_uid,
            'numero_carte'     => $c->numero_carte,
            'statut'           => $c->statut,
            'progression'      => (float) ($c->progression ?? 0),
            'montant_initial'  => (float) ($c->montant_initial ?? 0),
            'date_activation'  => $c->date_activation,
            'date_expiration'  => $c->date_expiration,
        ];
    }

    private function formatClient(Client $c): array
    {
        return [
            'id_client'  => $c->id_client,
            'nom'        => $c->nom,
            'prenom'     => $c->prenom,
            'telephone'  => $c->telephone,
            'adresse'    => $c->adresse,
            'ville'      => $c->ville,
        ];
    }

    private function syncCompteFromTransactions(Compte $compte, int $idClient): void
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

    private function formatCompte(?Compte $c): array
    {
        if (! $c) {
            return [
                'solde_total'             => 0,
                'total_depots'            => 0,
                'total_retraits'          => 0,
                'total_retraits_partiels' => 0,
                'total_penalites'         => 0,
            ];
        }

        return [
            'id_compte'               => $c->id_compte,
            'solde_total'             => (float) $c->solde_total,
            'total_depots'            => (float) $c->total_depots,
            'total_retraits'          => (float) $c->total_retraits,
            'total_retraits_partiels' => (float) $c->total_retraits_partiels,
            'total_penalites'         => (float) $c->total_penalites,
        ];
    }
}