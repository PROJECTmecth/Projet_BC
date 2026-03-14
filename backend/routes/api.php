<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\CarteController;
use App\Http\Controllers\Admin\ProfilController;

// ==============================================================
// ROUTES PUBLIQUES — Authentification
// ==============================================================
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/auth/admin/login', fn() => response()->json(['message' => 'Route login admin — géré par collègue']));
Route::post('/auth/agent/login', fn() => response()->json(['message' => 'Route login agent — géré par collègue']));

// Hors groupe admin — TEMPORAIRE (Sanctum stateful à régler)
Route::post('/admin/qrcodes/generer', [CarteController::class, 'generer'])->name('qrcodes.generer');
Route::get('/admin/qrcodes/lots',     [CarteController::class, 'index'])->name('qrcodes.lots');

// ==============================================================
// ROUTES ADMIN — Panel BOMBA CASH MANAGER
// ==============================================================
Route::middleware(['auth:sanctum', 'isAdmin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard',        fn() => response()->json(['success' => true, 'message' => '✅ Dashboard Manager']))->name('dashboard');
        Route::get('/kiosques',         fn() => response()->json(['success' => true, 'message' => '✅ Liste kiosques']))->name('kiosques.index');
        Route::get('/agents',           fn() => response()->json(['success' => true, 'message' => '✅ Liste agents']))->name('agents.index');
        Route::get('/clients',          fn() => response()->json(['success' => true, 'message' => '✅ Liste clients']))->name('clients.index');
        Route::get('/transactions',     fn() => response()->json(['success' => true, 'message' => '✅ Transactions']))->name('transactions.index');
        Route::get('/mouvements-solde', fn() => response()->json(['success' => true, 'message' => '✅ Mouvements solde']))->name('mouvements.index');

        // ── Gestion QR Codes / Cartes ─────────────────────────────────────
        // Route::post('/qrcodes/generer', [CarteController::class, 'generer'])->name('qrcodes.generer');
        // Route::get('/qrcodes/lots',     [CarteController::class, 'index'])->name('qrcodes.lots');
    });


    // ── Profil Admin ──────────────────────────────────────────────────
        Route::put('/profil',          [ProfilController::class, 'update'])->name('profil.update');
        Route::put('/profil/password', [ProfilController::class, 'updatePassword'])->name('profil.password');

// ==============================================================
// ROUTES AGENT — Interface terrain BOMBA CASH
// ==============================================================
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
