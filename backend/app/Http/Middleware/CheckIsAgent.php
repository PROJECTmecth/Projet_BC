<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * ============================================================
 *  Middleware : CheckIsAgent
 * ============================================================
 *  Projet      : BOMBA CASH — Johann Finance SA © 2026
 *  Branche     : feature/middlewares-auth-roles
 *  Fichier     : app/Http/Middleware/CheckIsAgent.php
 * ============================================================
 *  RÔLE :
 *    Ce middleware protège toutes les routes de l'interface
 *    Agent (BOMBA CASH — interface de terrain). Il effectue
 *    une vérification en cascade en 4 étapes obligatoires :
 *      1. L'utilisateur est bien authentifié (token valide)
 *      2. Son rôle est exactement 'agent'
 *      3. Son compte utilisateur est en statut 'actif'
 *      4. Son kiosque rattaché est également en statut 'actif'
 *
 *  RÈGLES MÉTIER (réf. Dictionnaire de Données v1.0) :
 *    → users.role                 = ENUM('admin', 'agent')
 *    → users.statut               = ENUM('actif', 'inactif')
 *    → agents.id_kiosque          = FK vers kiosques
 *    → kiosques.statut_service    = ENUM('actif', 'inactif')
 *    → Un agent sans kiosque actif ne peut PAS opérer
 *    → Un admin ne peut PAS accéder à l'interface agent
 *    → La barre d'alerte affiche VERT si en ligne, ROUGE sinon
 *    → Tout accès refusé est tracé dans les logs système
 *
 *  CODES RETOUR :
 *    → 401 UNAUTHENTICATED          : Pas de token / expiré
 *    → 403 FORBIDDEN_NOT_AGENT      : Rôle différent de 'agent'
 *    → 403 ACCOUNT_INACTIVE         : Compte agent désactivé
 *    → 403 AGENT_PROFILE_NOT_FOUND  : Profil agent introuvable
 *    → 403 KIOSQUE_INACTIVE         : Kiosque désactivé
 *    → Passage au contrôleur        : Toutes conditions OK ✅
 * ============================================================
 */
class CheckIsAgent
{
    /**
     * Gère la requête HTTP entrante.
     *
     * Ce middleware est appelé automatiquement par Laravel
     * pour chaque route décorée avec le middleware 'isAgent'.
     * Il charge également la relation kiosque en eager loading
     * pour éviter des requêtes N+1 dans les contrôleurs suivants.
     *
     * @param  Request  $request   La requête HTTP entrante
     * @param  Closure  $next      Référence vers le prochain middleware/contrôleur
     * @return Response            Réponse JSON erreur ou passage au suivant
     */
    public function handle(Request $request, Closure $next): Response
    {
        // ----------------------------------------------------------
        // ÉTAPE 1 : Vérification de l'authentification
        // ----------------------------------------------------------
        // Vérifie la présence et validité du token Sanctum.
        // Complète le middleware auth:sanctum du collègue.
        // Retourne NULL si token absent, invalide ou expiré.
        // ----------------------------------------------------------
        $authenticatedUser = $request->user();

        if (!$authenticatedUser) {
            // Log de sécurité : tentative sans authentification
            Log::warning('[BOMBA_CASH][CheckIsAgent] Tentative accès sans authentification', [
                'ip'         => $request->ip(),
                'url'        => $request->fullUrl(),
                'user_agent' => $request->userAgent(),
                'timestamp'  => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Authentification requise pour accéder à cette ressource.',
                'code'    => 'UNAUTHENTICATED',
            ], Response::HTTP_UNAUTHORIZED); // 401
        }

        // ----------------------------------------------------------
        // ÉTAPE 2 : Vérification du rôle agent
        // ----------------------------------------------------------
        // Seul le rôle 'agent' peut accéder à l'interface terrain.
        // Un admin qui tenterait d'accéder sera bloqué ici.
        // ----------------------------------------------------------
        if ($authenticatedUser->role !== 'agent') {
            // Log de sécurité : mauvais rôle
            Log::warning('[BOMBA_CASH][CheckIsAgent] Accès refusé — rôle insuffisant', [
                'userId'    => $authenticatedUser->id_user,
                'username'  => $authenticatedUser->username,
                'role'      => $authenticatedUser->role,
                'ip'        => $request->ip(),
                'url'       => $request->fullUrl(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Accès refusé. Espace réservé aux agents de terrain.',
                'code'    => 'FORBIDDEN_NOT_AGENT',
            ], Response::HTTP_FORBIDDEN); // 403
        }

        // ----------------------------------------------------------
        // ÉTAPE 3 : Vérification du statut du compte utilisateur
        // ----------------------------------------------------------
        // Si l'admin central a désactivé le compte de cet agent,
        // même avec un token encore valide, l'accès est bloqué.
        // Correspond à la règle : users.statut = 'inactif'
        // ----------------------------------------------------------
        if ($authenticatedUser->statut !== 'actif') {
            // Log de sécurité : compte désactivé
            Log::warning('[BOMBA_CASH][CheckIsAgent] Accès refusé — compte inactif', [
                'userId'    => $authenticatedUser->id_user,
                'username'  => $authenticatedUser->username,
                'statut'    => $authenticatedUser->statut,
                'ip'        => $request->ip(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Votre compte agent a été désactivé. Contactez votre administrateur.',
                'code'    => 'ACCOUNT_INACTIVE',
            ], Response::HTTP_FORBIDDEN); // 403
        }

        // ----------------------------------------------------------
        // ÉTAPE 4a : Chargement du profil agent avec son kiosque
        // ----------------------------------------------------------
        // On utilise l'eager loading (with) pour récupérer l'agent
        // ET son kiosque en une seule requête SQL optimisée.
        // Cela évite les requêtes N+1 dans les contrôleurs aval.
        // La relation agent() doit être définie dans le modèle User.
        // ----------------------------------------------------------
        $agentProfile = $authenticatedUser->agent()->with('kiosque')->first();

        // Vérification : le profil agent existe bien dans la table agents
        // Cas rare mais possible si la création du compte a échoué partiellement.
        if (!$agentProfile) {
            // Log d'erreur critique : incohérence de données
            Log::error('[BOMBA_CASH][CheckIsAgent] Profil agent introuvable pour un user role=agent', [
                'userId'    => $authenticatedUser->id_user,
                'username'  => $authenticatedUser->username,
                'ip'        => $request->ip(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Profil agent introuvable. Contactez votre administrateur.',
                'code'    => 'AGENT_PROFILE_NOT_FOUND',
            ], Response::HTTP_FORBIDDEN); // 403
        }

        // ----------------------------------------------------------
        // ÉTAPE 4b : Vérification du statut du kiosque
        // ----------------------------------------------------------
        // Règle métier CRITIQUE :
        // Un kiosque désactivé par l'admin bloque TOUS les agents
        // rattachés à ce kiosque. Aucune opération ne peut être
        // effectuée depuis un kiosque 'inactif'.
        // Correspond à : kiosques.statut_service = ENUM('actif','inactif')
        // ----------------------------------------------------------
        if (!$agentProfile->kiosque || $agentProfile->kiosque->statut_service !== 'actif') {
            $codeKiosque = $agentProfile->kiosque?->code_kiosque ?? 'INCONNU';

            // Log de sécurité : kiosque inactif ou absent
            Log::warning('[BOMBA_CASH][CheckIsAgent] Accès refusé — kiosque inactif ou absent', [
                'userId'       => $authenticatedUser->id_user,
                'username'     => $authenticatedUser->username,
                'idAgent'      => $agentProfile->id_agent,
                'codeKiosque'  => $codeKiosque,
                'ip'           => $request->ip(),
                'timestamp'    => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Votre kiosque est actuellement désactivé. Aucune opération possible.',
                'code'    => 'KIOSQUE_INACTIVE',
                'kiosque' => $codeKiosque,
            ], Response::HTTP_FORBIDDEN); // 403
        }

        // ----------------------------------------------------------
        // ✅ ACCÈS AUTORISÉ
        // ----------------------------------------------------------
        // Toutes les 4 étapes sont validées.
        // On attache le profil agent à la requête pour que les
        // contrôleurs puissent y accéder sans refaire de requête SQL.
        // Usage dans le contrôleur : $request->agentProfile
        // ----------------------------------------------------------
        $request->merge(['agentProfile' => $agentProfile]);

        return $next($request);
    }
}