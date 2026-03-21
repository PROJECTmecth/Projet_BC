<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\KiosqueController;
use App\Http\Controllers\Admin\AgentController;
use App\Http\Controllers\Admin\CarteController;
use App\Http\Controllers\Admin\ProfilController;

// ══════════════════════════════════════════════════════════════════════════════
// ROUTE PUBLIQUE — Utilisateur connecté
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Hors groupe admin — TEMPORAIRE (Sanctum stateful à régler)
Route::post('/admin/qrcodes/generer', [CarteController::class, 'generer'])->name('qrcodes.generer');
Route::get('/admin/qrcodes/lots',     [CarteController::class, 'index'])->name('qrcodes.lots');

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES ADMIN
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'isAdmin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // ── Dashboard ─────────────────────────────────────────────────────────
        Route::get('/dashboard', fn() => response()->json(['success' => true, 'message' => '✅ Dashboard Manager']))->name('dashboard');

        // ── Kiosques — DEV3 Djenna ────────────────────────────────────────────
        Route::get   ('/kiosques',                    [KiosqueController::class, 'index'])        ->name('kiosques.list');
        Route::post  ('/kiosques',                    [KiosqueController::class, 'store'])        ->name('kiosques.store');
        Route::get   ('/kiosques/{kiosque}',          [KiosqueController::class, 'show'])         ->name('kiosques.show');
        Route::put   ('/kiosques/{kiosque}',          [KiosqueController::class, 'update'])       ->name('kiosques.update');
        Route::delete('/kiosques/{kiosque}',          [KiosqueController::class, 'destroy'])      ->name('kiosques.destroy');
        Route::patch ('/kiosques/{kiosque}/statut',   [KiosqueController::class, 'toggleStatut']) ->name('kiosques.toggle');
        Route::get   ('/kiosques/{kiosque}/agents',   [KiosqueController::class, 'agents'])       ->name('kiosques.agents');

        // ── Agents — DEV3 Djenna ──────────────────────────────────────────────
        Route::get   ('/agents',                      [AgentController::class, 'index'])          ->name('agents.list');
        Route::post  ('/agents',                      [AgentController::class, 'store'])          ->name('agents.store');
        Route::get   ('/agents/{agent}',              [AgentController::class, 'show'])           ->name('agents.show');
        Route::put   ('/agents/{agent}',              [AgentController::class, 'update'])         ->name('agents.update');
        Route::delete('/agents/{agent}',              [AgentController::class, 'destroy'])        ->name('agents.destroy');
        Route::patch ('/agents/{agent}/statut',       [AgentController::class, 'toggleStatut'])   ->name('agents.toggle');

        // ── Placeholders collègues ────────────────────────────────────────────
        Route::get('/clients',          fn() => response()->json(['success' => true, 'message' => '✅ Liste clients'])        )->name('clients.index');
        Route::get('/transactions',     fn() => response()->json(['success' => true, 'message' => '✅ Transactions'])          )->name('transactions.index');
        Route::get('/mouvements-solde', fn() => response()->json(['success' => true, 'message' => '✅ Mouvements solde'])      )->name('mouvements.index');

        // ── Profil Admin — collègue ───────────────────────────────────────────
        Route::put('/profil',          [ProfilController::class, 'update'])        ->name('profil.update');
        Route::put('/profil/password', [ProfilController::class, 'updatePassword'])->name('profil.password');
    });

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES AGENT
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'isAgent'])
    ->prefix('agent')
    ->name('agent.')
    ->group(function () {
        Route::get('/dashboard',          fn() => response()->json(['success' => true, 'message' => '✅ Dashboard Agent'])      )->name('dashboard');
        Route::get('/mes-clients',        fn() => response()->json(['success' => true, 'message' => '✅ Mes clients'])          )->name('clients.index');
        Route::get('/historique',         fn() => response()->json(['success' => true, 'message' => '✅ Historique'])           )->name('historique.index');
        Route::post('/scan-carte',        fn() => response()->json(['success' => true, 'message' => '✅ Scan carte'])           )->name('carte.scan');
        Route::post('/operations',        fn() => response()->json(['success' => true, 'message' => '✅ Opération'])            )->name('operations.store');
        Route::get('/rapport-journalier', fn() => response()->json(['success' => true, 'message' => '✅ Rapport journalier'])   )->name('rapport.journalier');
    });