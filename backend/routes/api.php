<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\KiosqueController;
use App\Http\Controllers\Admin\AgentController;
// ══════════════════════════════════════════════════════════════════════════════
// ROUTE PUBLIQUE — Utilisateur connecté
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


// ══════════════════════════════════════════════════════════════════════════════
// ROUTES ADMIN — Un seul groupe, pas de duplication
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'isAdmin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // ── Dashboard ─────────────────────────────────────────────────────────
        Route::get('/dashboard', fn() => response()->json([
            'success' => true,
            'message' => '✅ Dashboard Manager',
        ]))->name('dashboard');

        
        // ── Placeholders — à compléter par chaque collègue ───────────────────
        Route::get('/agents', fn() => response()->json([
            'success' => true,
            'message' => '✅ Liste agents — à implémenter',
        ]))->name('agents.index');

        Route::get('/clients', fn() => response()->json([
            'success' => true,
            'message' => '✅ Liste clients — à implémenter',
        ]))->name('clients.index');

        Route::get('/transactions', fn() => response()->json([
            'success' => true,
            'message' => '✅ Transactions — à implémenter',
        ]))->name('transactions.index');

        Route::get('/mouvements-solde', fn() => response()->json([
            'success' => true,
            'message' => '✅ Mouvements solde — à implémenter',
        ]))->name('mouvements.index');

        Route::post('/qrcodes/generer', fn() => response()->json([
            'success' => true,
            'message' => '✅ Génération QR codes — à implémenter',
        ]))->name('qrcodes.generer');
    });

// ── DEV3 Djenna — Agents ──────────────────────────────────────────────────────
Route::prefix('admin')->name('admin.')->group(function () {

    Route::get('/kiosques',                  [KiosqueController::class, 'index'])->name('kiosques.list');
    Route::post('/kiosques',                  [KiosqueController::class, 'store'])->name('kiosques.store');
    Route::get('/kiosques/{kiosque}',        [KiosqueController::class, 'show'])->name('kiosques.show');
    Route::put('/kiosques/{kiosque}',        [KiosqueController::class, 'update'])->name('kiosques.update');
    Route::delete('/kiosques/{kiosque}',        [KiosqueController::class, 'destroy'])->name('kiosques.destroy');
    Route::patch('/kiosques/{kiosque}/statut', [KiosqueController::class, 'toggleStatut'])->name('kiosques.toggle');
    Route::get('/kiosques/{kiosque}/agents', [KiosqueController::class, 'agents'])->name('kiosques.agents');

    Route::get('/agents',                  [AgentController::class, 'index'])->name('agents.list');
    Route::post('/agents',                  [AgentController::class, 'store'])->name('agents.store');
    Route::get('/agents/{agent}',          [AgentController::class, 'show'])->name('agents.show');
    Route::put('/agents/{agent}',          [AgentController::class, 'update'])->name('agents.update');
    Route::delete('/agents/{agent}',          [AgentController::class, 'destroy'])->name('agents.destroy');
    Route::patch('/agents/{agent}/statut',   [AgentController::class, 'toggleStatut'])->name('agents.toggle');

});


// ══════════════════════════════════════════════════════════════════════════════
// ROUTES AGENT — À compléter par le collègue partie agent
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'isAgent'])
    ->prefix('agent')
    ->name('agent.')
    ->group(function () {

        Route::get('/dashboard', fn() => response()->json([
            'success' => true,
            'message' => '✅ Dashboard Agent — à implémenter',
        ]))->name('dashboard');
    });
