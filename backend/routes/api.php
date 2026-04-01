<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==============================================================
// ROUTES PUBLIQUES — Authentification (collègue login)
// ==============================================================
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/auth/admin/login', fn() => response()->json(['message' => 'Route login admin — géré par collègue']));
Route::post('/auth/agent/login', fn() => response()->json(['message' => 'Route login agent — géré par collègue']));


// ==============================================================
// ROUTES ADMIN — Panel BOMBA CASH MANAGER
// ==============================================================
Route::middleware(['auth:sanctum', 'isAdmin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', fn() => response()->json(['success' => true, 'message' => '✅ Dashboard Manager']))->name('dashboard');
        Route::get('/kiosques', fn() => response()->json(['success' => true, 'message' => '✅ Liste kiosques']))->name('kiosques.index');
        Route::get('/agents', fn() => response()->json(['success' => true, 'message' => '✅ Liste agents']))->name('agents.index');
        Route::get('/clients', fn() => response()->json(['success' => true, 'message' => '✅ Liste clients']))->name('clients.index');
        Route::get('/transactions', fn() => response()->json(['success' => true, 'message' => '✅ Transactions']))->name('transactions.index');
        Route::get('/mouvements-solde', fn() => response()->json(['success' => true, 'message' => '✅ Mouvements solde']))->name('mouvements.index');
        Route::post('/qrcodes/generer', fn() => response()->json(['success' => true, 'message' => '✅ Génération QR codes']))->name('qrcodes.generer');
    });


// ==============================================================
// INCLUSION DES ROUTES PAR MODULE — NE PAS MODIFIER
// ==============================================================
require __DIR__.'/api_agent.php';   // Dev 1 (Toi)
// require __DIR__.'/api_admin.php';  // Dev 2 — à décommenter quand prêt
// require __DIR__.'/api_client.php'; // Dev 3 — à décommenter quand prêt