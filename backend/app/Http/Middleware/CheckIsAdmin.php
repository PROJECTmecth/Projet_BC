<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * ============================================================
 *  Middleware : CheckIsAdmin
 * ============================================================
 *  Projet      : BOMBA CASH — Johann Finance SA © 2026
 *  Branche     : feature/middlewares-auth-roles
 *  Fichier     : app/Http/Middleware/CheckIsAdmin.php
 * ============================================================
 *  RÔLE :
 *    Ce middleware agit comme un gardien de sécurité placé
 *    AVANT chaque contrôleur du panel Manager (Admin).
 *    Il vérifie en cascade trois conditions obligatoires :
 *      1. L'utilisateur est bien authentifié (token valide)
 *      2. Son rôle est exactement 'admin'
 *      3. Son compte est en statut 'actif'
 *
 *  RÈGLES MÉTIER (réf. Dictionnaire de Données v1.0) :
 *    → users.role     = ENUM('admin', 'agent')
 *    → users.statut   = ENUM('actif', 'inactif')
 *    → Un admin 'inactif' ne peut plus accéder au système
 *    → Un agent ne peut jamais accéder au panel Manager
 *    → Tout accès refusé est tracé dans les logs système
 *
 *  CODES RETOUR :
 *    → 401 UNAUTHENTICATED     : Pas de token / token invalide
 *    → 403 FORBIDDEN_NOT_ADMIN : Rôle différent de 'admin'
 *    → 403 ACCOUNT_INACTIVE    : Compte admin désactivé
 *    → Passage au contrôleur   : Toutes les conditions OK ✅
 * ============================================================
 */
class CheckIsAdmin
{
    /**
     * Gère la requête HTTP entrante.
     *
     * Ce middleware est appelé automatiquement par Laravel
     * pour chaque route décorée avec le middleware 'isAdmin'.
     * En cas d'échec, une réponse JSON standardisée est renvoyée.
     *
     * @param  Request  $request   La requête HTTP entrante (headers, body, user)
     * @param  Closure  $next      Référence vers le prochain middleware ou contrôleur
     * @return Response            La réponse HTTP (JSON erreur ou passage au suivant)
     */
    public function handle(Request $request, Closure $next): Response
    {
        // ----------------------------------------------------------
        // ÉTAPE 1 : Vérification de l'authentification
        // ----------------------------------------------------------
        // La méthode $request->user() retourne NULL si :
        //   - Aucun token Bearer n'est fourni dans le header
        //   - Le token Sanctum est invalide ou expiré
        //   - L'utilisateur n'existe plus en base de données
        // Ce contrôle est une sécurité supplémentaire au middleware
        // auth:sanctum géré par le collègue responsable du login.
        // ----------------------------------------------------------
        $authenticatedUser = $request->user();

        if (!$authenticatedUser) {
            // Log de sécurité : tentative sans authentification
            Log::warning('[BOMBA_CASH][CheckIsAdmin] Tentative accès sans authentification', [
                'ip'          => $request->ip(),
                'url'         => $request->fullUrl(),
                'user_agent'  => $request->userAgent(),
                'timestamp'   => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Authentification requise pour accéder à cette ressource.',
                'code'    => 'UNAUTHENTICATED',
            ], Response::HTTP_UNAUTHORIZED); // 401
        }

        // ----------------------------------------------------------
        // ÉTAPE 2 : Vérification du rôle administrateur
        // ----------------------------------------------------------
        // Le rôle est défini dans la table 'users' lors de la création
        // du compte par l'admin central. Seul le rôle 'admin' autorise
        // l'accès au panel Manager (BOMBA CASH MANAGER).
        // Un agent authentifié recevra un refus 403 ici.
        // ----------------------------------------------------------
        if ($authenticatedUser->role !== 'admin') {
            // Log de sécurité : tentative d'accès avec mauvais rôle
            Log::warning('[BOMBA_CASH][CheckIsAdmin] Accès refusé — rôle insuffisant', [
                'userId'    => $authenticatedUser->id_user,
                'username'  => $authenticatedUser->username,
                'role'      => $authenticatedUser->role,
                'ip'        => $request->ip(),
                'url'       => $request->fullUrl(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Accès refusé. Droits administrateur requis.',
                'code'    => 'FORBIDDEN_NOT_ADMIN',
            ], Response::HTTP_FORBIDDEN); // 403
        }

        // ----------------------------------------------------------
        // ÉTAPE 3 : Vérification du statut du compte
        // ----------------------------------------------------------
        // Un admin peut être désactivé par un autre admin ou lors
        // d'une procédure de sécurité. Si son statut est 'inactif',
        // il ne doit plus pouvoir effectuer aucune action dans le
        // système, même avec un token encore valide.
        // ----------------------------------------------------------
        if ($authenticatedUser->statut !== 'actif') {
            // Log de sécurité : compte désactivé tente de se connecter
            Log::warning('[BOMBA_CASH][CheckIsAdmin] Accès refusé — compte inactif', [
                'userId'    => $authenticatedUser->id_user,
                'username'  => $authenticatedUser->username,
                'statut'    => $authenticatedUser->statut,
                'ip'        => $request->ip(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Votre compte administrateur a été désactivé. Contactez le support.',
                'code'    => 'ACCOUNT_INACTIVE',
            ], Response::HTTP_FORBIDDEN); // 403
        }

        // ----------------------------------------------------------
        // ✅ ACCÈS AUTORISÉ
        // ----------------------------------------------------------
        // Toutes les vérifications sont passées avec succès.
        // La requête est transmise au prochain middleware ou
        // directement au contrôleur concerné.
        // ----------------------------------------------------------
        return $next($request);
    }
}