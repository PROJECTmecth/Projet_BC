<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Agent;
use App\Models\Kiosque;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * ============================================================
 *  Tests Feature : CheckIsAdmin & CheckIsAgent Middlewares
 * ============================================================
 *  Projet  : BOMBA CASH — Johann Finance SA © 2026
 *  Fichier : tests/Feature/MiddlewareRolesTest.php
 *  Branche : feature/middlewares-auth-roles
 * ============================================================
 *  Ces tests vérifient TOUS les scénarios possibles des
 *  middlewares isAdmin et isAgent.
 *
 *  COMMANDE pour lancer les tests :
 *    cd backend
 *    php artisan test --filter MiddlewareRolesTest
 *    php artisan test --filter MiddlewareRolesTest --verbose
 *
 *  RÉSULTATS ATTENDUS :
 *    ✅ 11 tests doivent passer (PASSED)
 *    ✅ 0 test doit échouer (FAILED)
 * ============================================================
 *
 *  NOTE IMPORTANTE :
 *    Ces tests utilisent actingAs() pour simuler
 *    l'authentification Sanctum SANS dépendre du code
 *    du collègue responsable du login.
 *    Quand son code sera mergé, les tests continueront
 *    de fonctionner sans modification.
 * ============================================================
 */
class MiddlewareRolesTest extends TestCase
{
    // RefreshDatabase réinitialise la base de test après chaque test
    // Assure l'isolation complète entre les tests
    use RefreshDatabase;


    // ==============================================================
    // 🛡️ TESTS MIDDLEWARE — isAdmin (CheckIsAdmin)
    // ==============================================================

    /**
     * ✅ TEST 1 : Un admin actif peut accéder aux routes admin
     *
     * Scénario : Admin avec rôle='admin' et statut='actif'
     * Résultat attendu : HTTP 200 OK
     */
    public function test_adminActifPeutAccederRoutesAdmin(): void
    {
        // Création d'un utilisateur admin actif en base de test
        $adminUser = User::factory()->create([
            'role'   => 'admin',
            'statut' => 'actif',
        ]);

        // Simulation de la requête authentifiée
        $response = $this->actingAs($adminUser, 'sanctum')
                         ->getJson('/api/admin/dashboard');

        // Vérification : accès autorisé
        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    /**
     * ❌ TEST 2 : Un agent ne peut PAS accéder aux routes admin
     *
     * Scénario : User avec rôle='agent' tente d'accéder au panel Manager
     * Résultat attendu : HTTP 403 + code FORBIDDEN_NOT_ADMIN
     */
    public function test_agentNePeutPasAccederRoutesAdmin(): void
    {
        $agentUser = User::factory()->create([
            'role'   => 'agent',
            'statut' => 'actif',
        ]);

        $response = $this->actingAs($agentUser, 'sanctum')
                         ->getJson('/api/admin/dashboard');

        $response->assertStatus(403)
                 ->assertJson([
                     'success' => false,
                     'code'    => 'FORBIDDEN_NOT_ADMIN',
                 ]);
    }

    /**
     * ❌ TEST 3 : Un admin INACTIF est bloqué même avec token valide
     *
     * Scénario : Admin désactivé par un autre admin
     * Résultat attendu : HTTP 403 + code ACCOUNT_INACTIVE
     */
    public function test_adminInactifEstBloque(): void
    {
        $adminUser = User::factory()->create([
            'role'   => 'admin',
            'statut' => 'inactif',
        ]);

        $response = $this->actingAs($adminUser, 'sanctum')
                         ->getJson('/api/admin/dashboard');

        $response->assertStatus(403)
                 ->assertJson([
                     'success' => false,
                     'code'    => 'ACCOUNT_INACTIVE',
                 ]);
    }

    /**
     * ❌ TEST 4 : Un utilisateur non authentifié est bloqué (admin)
     *
     * Scénario : Requête sans token sur une route admin
     * Résultat attendu : HTTP 401 + code UNAUTHENTICATED
     */
    public function test_utilisateurNonAuthentifieBloqueSurRoutesAdmin(): void
    {
        // Requête sans actingAs = sans token
        $response = $this->getJson('/api/admin/dashboard');

        $response->assertStatus(401);
    }


    // ==============================================================
    // 🛡️ TESTS MIDDLEWARE — isAgent (CheckIsAgent)
    // ==============================================================

    /**
     * ✅ TEST 5 : Un agent actif avec kiosque actif peut accéder
     *
     * Scénario : Agent normal, tout est actif
     * Résultat attendu : HTTP 200 OK
     */
    public function test_agentActifAvecKiosqueActifPeutAcceder(): void
    {
        // Création du kiosque actif
        $kiosque = Kiosque::factory()->create([
            'statut_service' => 'actif',
        ]);

        // Création du user avec rôle agent
        $userAgent = User::factory()->create([
            'role'   => 'agent',
            'statut' => 'actif',
        ]);

        // Création du profil agent rattaché au kiosque
        Agent::factory()->create([
            'id_user'    => $userAgent->id_user,
            'id_kiosque' => $kiosque->id_kiosque,
        ]);

        $response = $this->actingAs($userAgent, 'sanctum')
                         ->getJson('/api/agent/dashboard');

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    /**
     * ❌ TEST 6 : Un admin ne peut PAS accéder aux routes agent
     *
     * Scénario : Admin tente d'accéder à l'interface agent
     * Résultat attendu : HTTP 403 + code FORBIDDEN_NOT_AGENT
     */
    public function test_adminNePeutPasAccederRoutesAgent(): void
    {
        $adminUser = User::factory()->create([
            'role'   => 'admin',
            'statut' => 'actif',
        ]);

        $response = $this->actingAs($adminUser, 'sanctum')
                         ->getJson('/api/agent/dashboard');

        $response->assertStatus(403)
                 ->assertJson([
                     'success' => false,
                     'code'    => 'FORBIDDEN_NOT_AGENT',
                 ]);
    }

    /**
     * ❌ TEST 7 : Un agent INACTIF est bloqué
     *
     * Scénario : Compte agent désactivé par l'admin
     * Résultat attendu : HTTP 403 + code ACCOUNT_INACTIVE
     */
    public function test_agentInactifEstBloque(): void
    {
        $kiosque = Kiosque::factory()->create(['statut_service' => 'actif']);

        $userAgent = User::factory()->create([
            'role'   => 'agent',
            'statut' => 'inactif', // Compte désactivé
        ]);

        Agent::factory()->create([
            'id_user'    => $userAgent->id_user,
            'id_kiosque' => $kiosque->id_kiosque,
        ]);

        $response = $this->actingAs($userAgent, 'sanctum')
                         ->getJson('/api/agent/dashboard');

        $response->assertStatus(403)
                 ->assertJson([
                     'success' => false,
                     'code'    => 'ACCOUNT_INACTIVE',
                 ]);
    }

    /**
     * ❌ TEST 8 : Un agent avec KIOSQUE INACTIF est bloqué
     *
     * Scénario critique : L'admin désactive un kiosque.
     *   → Tous les agents de ce kiosque doivent être bloqués
     * Résultat attendu : HTTP 403 + code KIOSQUE_INACTIVE
     */
    public function test_agentAvecKiosqueInactifEstBloque(): void
    {
        // Kiosque désactivé par l'admin
        $kiosque = Kiosque::factory()->create([
            'statut_service' => 'inactif',
        ]);

        $userAgent = User::factory()->create([
            'role'   => 'agent',
            'statut' => 'actif',
        ]);

        Agent::factory()->create([
            'id_user'    => $userAgent->id_user,
            'id_kiosque' => $kiosque->id_kiosque,
        ]);

        $response = $this->actingAs($userAgent, 'sanctum')
                         ->getJson('/api/agent/dashboard');

        $response->assertStatus(403)
                 ->assertJson([
                     'success' => false,
                     'code'    => 'KIOSQUE_INACTIVE',
                 ]);
    }

    /**
     * ❌ TEST 9 : Un agent sans profil agent est bloqué
     *
     * Scénario : Incohérence BDD — user rôle agent sans entrée dans agents
     * Résultat attendu : HTTP 403 + code AGENT_PROFILE_NOT_FOUND
     */
    public function test_agentSansProfilEstBloque(): void
    {
        // User avec rôle agent mais PAS d'entrée dans la table agents
        $userAgent = User::factory()->create([
            'role'   => 'agent',
            'statut' => 'actif',
        ]);

        // Pas de Agent::factory() → profil absent

        $response = $this->actingAs($userAgent, 'sanctum')
                         ->getJson('/api/agent/dashboard');

        $response->assertStatus(403)
                 ->assertJson([
                     'success' => false,
                     'code'    => 'AGENT_PROFILE_NOT_FOUND',
                 ]);
    }

    /**
     * ❌ TEST 10 : Utilisateur non authentifié bloqué (agent)
     *
     * Scénario : Requête sans token sur une route agent
     * Résultat attendu : HTTP 401
     */
    public function test_utilisateurNonAuthentifieBloqueSurRoutesAgent(): void
    {
        $response = $this->getJson('/api/agent/dashboard');

        $response->assertStatus(401);
    }

    /**
     * ✅ TEST 11 : L'admin peut accéder à toutes les routes admin
     *
     * Scénario : Admin actif accède à différentes routes du panel
     * Résultat attendu : HTTP 200 sur toutes les routes testées
     */
    public function test_adminPeutAccederToutesRoutesAdmin(): void
    {
        $adminUser = User::factory()->create([
            'role'   => 'admin',
            'statut' => 'actif',
        ]);

        // Liste des routes admin à tester
        $routesAdmin = [
            '/api/admin/dashboard',
            '/api/admin/kiosques',
            '/api/admin/agents',
            '/api/admin/clients',
            '/api/admin/transactions',
        ];

        foreach ($routesAdmin as $route) {
            $this->actingAs($adminUser, 'sanctum')
                 ->getJson($route)
                 ->assertStatus(200);
        }
    }
}
