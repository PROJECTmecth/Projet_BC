<?php

/**
 * ============================================================
 *  Routes API — BOMBA CASH
 * ============================================================
 *  Projet  : BOMBA CASH — Johann Finance SA © 2026
 *  Fichier : routes/api.php
 * ============================================================
 *  Organisation des routes par groupe de middleware :
 *
 *  [PUBLIC]
 *    → Aucun middleware — Routes libres (login, health check)
 *    → Géré par le collègue responsable de l'authentification
 *
 *  [ADMIN — Panel Manager]
 *    → Middleware : auth:sanctum + isAdmin
 *    → Préfixe    : /api/admin/...
 *    → Accès      : Administrateurs uniquement
 *
 *  [AGENT — Interface terrain]
 *    → Middleware : auth:sanctum + isAgent
 *    → Préfixe    : /api/agent/...
 *    → Accès      : Agents actifs avec kiosque actif uniquement
 *
 *  NOTE IMPORTANTE :
 *    Le middleware auth:sanctum est géré par le collègue
 *    responsable du login/authentification.
 *    Nos middlewares isAdmin et isAgent viennent EN PLUS
 *    et vérifient le rôle après l'authentification.
 * ============================================================
 */

use Illuminate\Support\Facades\Route;

// ==============================================================
// 🔓 ROUTES PUBLIQUES — Gérées par le collègue (authentification)
// ==============================================================
// Ces routes ne nécessitent pas d'authentification.
// Exemples : login admin, login agent, health check.
// NE PAS MODIFIER — responsabilité du collègue auth.
// ==============================================================

Route::post('/auth/admin/login', fn() => response()->json(['message' => 'Route login admin — géré par collègue']));
Route::post('/auth/agent/login', fn() => response()->json(['message' => 'Route login agent — géré par collègue']));


// ==============================================================
// 🔐 ROUTES ADMIN — Panel BOMBA CASH MANAGER
// ==============================================================
// Protection :
//   1. auth:sanctum → Token valide (collègue)
//   2. isAdmin      → Rôle admin + statut actif (notre middleware)
//
// Toutes les routes ci-dessous nécessitent les deux middlewares.
// Préfixe URL : /api/admin/...
// ==============================================================

Route::middleware(['auth:sanctum', 'isAdmin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // --------------------------------------------------
        // Tableau de bord admin
        // --------------------------------------------------
        Route::get('/dashboard', fn() => response()->json([
            'success' => true,
            'message' => '✅ Accès Admin autorisé — Dashboard Manager',
        ]))->name('dashboard');

        // --------------------------------------------------
        // Gestion des kiosques
        // Contrôleur à créer : KiosqueController
        // --------------------------------------------------
        Route::get('/kiosques', fn() => response()->json([
            'success' => true,
            'message' => '✅ Liste des kiosques — à brancher sur KiosqueController',
        ]))->name('kiosques.index');

        // --------------------------------------------------
        // Gestion des agents
        // Contrôleur à créer : AgentController
        // --------------------------------------------------
        Route::get('/agents', fn() => response()->json([
            'success' => true,
            'message' => '✅ Liste des agents — à brancher sur AgentController',
        ]))->name('agents.index');

        // --------------------------------------------------
        // Gestion des clients (vue globale)
        // Contrôleur à créer : ClientController
        // --------------------------------------------------
        Route::get('/clients', fn() => response()->json([
            'success' => true,
            'message' => '✅ Liste des clients — à brancher sur ClientController',
        ]))->name('clients.index');

        // --------------------------------------------------
        // Journal de transactions (vue globale)
        // Contrôleur à créer : TransactionController
        // --------------------------------------------------
        Route::get('/transactions', fn() => response()->json([
            'success' => true,
            'message' => '✅ Journal transactions — à brancher sur TransactionController',
        ]))->name('transactions.index');

        // --------------------------------------------------
        // Mouvement de solde
        // Contrôleur à créer : SoldeController
        // --------------------------------------------------
        Route::get('/mouvements-solde', fn() => response()->json([
            'success' => true,
            'message' => '✅ Mouvement de solde — à brancher sur SoldeController',
        ]))->name('mouvements.index');

        // --------------------------------------------------
        // Génération de QR codes (lot de 500)
        // Contrôleur à créer : QrCodeController
        // --------------------------------------------------
        Route::post('/qrcodes/generer', fn() => response()->json([
            'success' => true,
            'message' => '✅ Génération QR codes — à brancher sur QrCodeController',
        ]))->name('qrcodes.generer');

    });


// ==============================================================
// 🔐 ROUTES AGENT — Interface terrain BOMBA CASH
// ==============================================================
// Protection :
//   1. auth:sanctum → Token valide (collègue)
//   2. isAgent      → Rôle agent + statut actif + kiosque actif
//
// Toutes les routes ci-dessous nécessitent les deux middlewares.
// Préfixe URL : /api/agent/...
// ==============================================================

Route::middleware(['auth:sanctum', 'isAgent'])
    ->prefix('agent')
    ->name('agent.')
    ->group(function () {

        // --------------------------------------------------
        // Tableau de bord agent
        // --------------------------------------------------
        Route::get('/dashboard', fn() => response()->json([
            'success' => true,
            'message' => '✅ Accès Agent autorisé — Tableau de bord',
        ]))->name('dashboard');

        // --------------------------------------------------
        // Mes clients (liste des clients de l'agent)
        // Contrôleur à créer : ClientController
        // --------------------------------------------------
        Route::get('/mes-clients', fn() => response()->json([
            'success' => true,
            'message' => '✅ Mes clients — à brancher sur ClientController',
        ]))->name('clients.index');

        // --------------------------------------------------
        // Historique des opérations de l'agent
        // Contrôleur à créer : HistoriqueController
        // --------------------------------------------------
        Route::get('/historique', fn() => response()->json([
            'success' => true,
            'message' => '✅ Historique — à brancher sur HistoriqueController',
        ]))->name('historique.index');

        // --------------------------------------------------
        // Scan de carte QR
        // Contrôleur à créer : CarteController
        // --------------------------------------------------
        Route::post('/scan-carte', fn() => response()->json([
            'success' => true,
            'message' => '✅ Scan carte — à brancher sur CarteController',
        ]))->name('carte.scan');

        // --------------------------------------------------
        // Enregistrement d'une nouvelle opération
        // Contrôleur à créer : TransactionController
        // --------------------------------------------------
        Route::post('/operations', fn() => response()->json([
            'success' => true,
            'message' => '✅ Enregistrement opération — à brancher sur TransactionController',
        ]))->name('operations.store');

        // --------------------------------------------------
        // Rapport journalier de l'agent
        // Contrôleur à créer : RapportController
        // --------------------------------------------------
        Route::get('/rapport-journalier', fn() => response()->json([
            'success' => true,
            'message' => '✅ Rapport journalier — à brancher sur RapportController',
        ]))->name('rapport.journalier');

    });