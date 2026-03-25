<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Importation des contrôleurs Admin
use App\Http\Controllers\Admin\KiosqueController;
use App\Http\Controllers\Admin\AgentController;
use App\Http\Controllers\Admin\CarteController;
use App\Http\Controllers\Admin\ProfilController;
use App\Http\Controllers\Admin\MouvementCaisseController;

/*
|--------------------------------------------------------------------------
| API Routes - Projet BOMBA_CASH
|--------------------------------------------------------------------------
*/

// ══════════════════════════════════════════════════════════════════════════════
// ROUTE PUBLIQUE — Utilisateur connecté
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Hors groupe admin — TEMPORAIRE (Gestion des QR Codes)
Route::post('/admin/qrcodes/generer', [CarteController::class, 'generer'])->name('qrcodes.generer');
Route::get('/admin/qrcodes/lots',     [CarteController::class, 'index'])->name('qrcodes.lots');

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES ADMIN (Protégées par Sanctum et le middleware isAdmin)
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'isAdmin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // ── Dashboard ─────────────────────────────────────────────────────────
        Route::get('/dashboard', fn() => response()->json([
            'success' => true,
            'message' => '✅ Dashboard Manager'
        ]))->name('dashboard');

        // ── Kiosques — Admin DEV3 Djenna ──────────────────────────────────────
        Route::get   ('/kiosques',                 [KiosqueController::class, 'index'])        ->name('kiosques.list');
        // Route pour la création, visualisation et modification des kiosques
        Route::post  ('/kiosques',                 [KiosqueController::class, 'store'])        ->name('kiosques.store');
        Route::get   ('/kiosques/{kiosque}',       [KiosqueController::class, 'show'])         ->name('kiosques.show');
        Route::put   ('/kiosques/{kiosque}',       [KiosqueController::class, 'update'])       ->name('kiosques.update');
        Route::delete('/kiosques/{kiosque}',       [KiosqueController::class, 'destroy'])      ->name('kiosques.destroy');
        Route::patch ('/kiosques/{kiosque}/statut', [KiosqueController::class, 'toggleStatut']) ->name('kiosques.toggle');
        Route::get   ('/kiosques/{kiosque}/agents', [KiosqueController::class, 'agents'])       ->name('kiosques.agents');

        // ── Agents — Admin DEV3 Djenna ────────────────────────────────────────
        Route::get   ('/agents',                   [AgentController::class, 'index'])          ->name('agents.list');
        Route::post  ('/agents',                   [AgentController::class, 'store'])          ->name('agents.store');
        Route::get   ('/agents/{agent}',           [AgentController::class, 'show'])           ->name('agents.show');
        Route::put   ('/agents/{agent}',           [AgentController::class, 'update'])         ->name('agents.update');
        Route::delete('/agents/{agent}',           [AgentController::class, 'destroy'])        ->name('agents.destroy');
        // Modification rapide du statut (Actif/Inactif)
        Route::patch ('/agents/{agent}/statut',    [AgentController::class, 'toggleStatut'])   ->name('agents.toggle');

        // ── Placeholders & Mouvements — Intégration Collègues ─────────────────
        Route::get('/clients',          fn() => response()->json(['success' => true, 'message' => '✅ Liste clients']))->name('clients.index');
        Route::get('/transactions',     fn() => response()->json(['success' => true, 'message' => '✅ Transactions']))->name('transactions.index');

        // Utilisation du contrôleur réel de Djenna pour les mouvements de caisse
        

        // ── Profil Admin ──────────────────────────────────────────────────────
        Route::put('/profil',          [ProfilController::class, 'update'])        ->name('profil.update');
        Route::put('/profil/password', [ProfilController::class, 'updatePassword'])->name('profil.password');
    });

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES AGENT (Accès terrain)
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'isAgent'])
    ->prefix('agent')
    ->name('agent.')
    ->group(function () {
        Route::get('/dashboard',          fn() => response()->json(['success' => true, 'message' => '✅ Dashboard Agent']))->name('dashboard');
        Route::get('/mes-clients',        fn() => response()->json(['success' => true, 'message' => '✅ Mes clients']))->name('clients.index');
        Route::get('/historique',         fn() => response()->json(['success' => true, 'message' => '✅ Historique']))->name('historique.index');
        Route::post('/scan-carte',        fn() => response()->json(['success' => true, 'message' => '✅ Scan carte']))->name('carte.scan');
        Route::post('/operations',        fn() => response()->json(['success' => true, 'message' => '✅ Opération']))->name('operations.store');
        Route::get('/rapport-journalier', fn() => response()->json(['success' => true, 'message' => '✅ Rapport journalier']))->name('rapport.journalier');
    });
