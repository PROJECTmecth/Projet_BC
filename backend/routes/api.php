<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\KiosqueController;
use App\Http\Controllers\Admin\AgentController;
use App\Http\Controllers\Admin\CarteController;
use App\Http\Controllers\Admin\ProfilController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MouvementCaisseController;
use App\Http\Controllers\Admin\ClientController;
/*
|--------------------------------------------------------------------------
| API Routes - Projet BOMBA_CASH
|--------------------------------------------------------------------------
*/

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES PUBLIQUES
// ══════════════════════════════════════════════════════════════════════════════

// Login
Route::post('/login', [AuthenticatedSessionController::class, 'store']);

// Route de diagnostic CORS
Route::get('/cors-debug', function () {
    return response()->json([
        'status' => 'ok',
        'allowed_origins' => config('cors.allowed_origins'),
        'env_origins' => env('CORS_ALLOWED_ORIGINS'),
        'app_url' => config('app.url'),
        'headers' => getallheaders(),
        'origin' => request()->header('Origin'),
        'method' => request()->method(),
    ]);
});

// Route de test CORS complet
Route::options('/test-cors', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', 'https://projet-bc.vercel.app')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-Token')
        ->header('Access-Control-Allow-Credentials', 'true');
});

Route::get('/test-cors', function () {
    return response()->json([
        'success' => true,
        'message' => 'CORS test successful',
        'timestamp' => now()->toISOString(),
        'origin' => request()->header('Origin'),
        'method' => request()->method(),
    ])->header('Access-Control-Allow-Origin', 'https://projet-bc.vercel.app')
      ->header('Access-Control-Allow-Credentials', 'true');
});

Route::post('/test-cors', function () {
    return response()->json([
        'success' => true,
        'message' => 'CORS POST test successful',
        'data' => request()->all(),
        'timestamp' => now()->toISOString(),
    ])->header('Access-Control-Allow-Origin', 'https://projet-bc.vercel.app')
      ->header('Access-Control-Allow-Credentials', 'true');
});

// Utilisateur connecté
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Logout
Route::middleware(['auth:sanctum'])->post('/logout', [AuthenticatedSessionController::class, 'destroy']);

// Hors groupe admin — Gestion des QR Codes
Route::post('/admin/qrcodes/generer', [CarteController::class, 'generer'])->name('qrcodes.generer');
Route::get('/admin/qrcodes/lots',     [CarteController::class, 'index'])->name('qrcodes.lots');

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES ADMIN (Protégées par Sanctum et le middleware isAdmin)
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'isAdmin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // Dashboard
    // ── Dashboard Stats ──────────────────────────────────────────────────
        // ✅ Route pour récupérer le compteur kiosques + autres stats (DEV-A Mechack)
        Route::get('/stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');

        // ── Dashboard ─────────────────────────────────────────────────────────
        Route::get('/dashboard', fn() => response()->json([
            'success' => true, 'message' => '✅ Dashboard Manager'
        ]))->name('dashboard');

        // Kiosques
        Route::get   ('/kiosques',                  [KiosqueController::class, 'index'])        ->name('kiosques.list');
        Route::post  ('/kiosques',                  [KiosqueController::class, 'store'])        ->name('kiosques.store');
        Route::get   ('/kiosques/{kiosque}',        [KiosqueController::class, 'show'])         ->name('kiosques.show');
        Route::put   ('/kiosques/{kiosque}',        [KiosqueController::class, 'update'])       ->name('kiosques.update');
        Route::delete('/kiosques/{kiosque}',        [KiosqueController::class, 'destroy'])      ->name('kiosques.destroy');
        Route::patch ('/kiosques/{kiosque}/statut', [KiosqueController::class, 'toggleStatut']) ->name('kiosques.toggle');
        Route::get   ('/kiosques/{kiosque}/agents', [KiosqueController::class, 'agents'])       ->name('kiosques.agents');

        //Mouvements de caisse
        Route::get('/mouvements-caisse', [MouvementCaisseController::class, 'index']);
        // clients-Admin
        Route::get('/clients',     [ClientController::class, 'index'])->name('clients.index');
        Route::get('/clients/{id}',[ClientController::class, 'show'])->name('clients.show');

        // Agents
        Route::get   ('/agents',                [AgentController::class, 'index'])        ->name('agents.list');
        Route::post  ('/agents',                [AgentController::class, 'store'])        ->name('agents.store');
        Route::get   ('/agents/{agent}',        [AgentController::class, 'show'])         ->name('agents.show');
        Route::put   ('/agents/{agent}',        [AgentController::class, 'update'])       ->name('agents.update');
        Route::delete('/agents/{agent}',        [AgentController::class, 'destroy'])      ->name('agents.destroy');
        Route::patch ('/agents/{agent}/statut', [AgentController::class, 'toggleStatut']) ->name('agents.toggle');


        Route::get('/transactions',  fn() => response()->json(['success' => true, 'message' => '✅ Transactions']))->name('transactions.index');

        // Profil Admin
        Route::put('/profil',          [ProfilController::class, 'update'])        ->name('profil.update');
        Route::put('/profil/password', [ProfilController::class, 'updatePassword'])->name('profil.password');
    });

// ══════════════════════════════════════════════════════════════════════════════
// INCLUSION DES ROUTES PAR MODULE — NE PAS MODIFIER
// ══════════════════════════════════════════════════════════════════════════════
require __DIR__.'/api_agent.php';   // Dev 1 — routes agent complètes
// require __DIR__.'/api_admin.php';  // Dev 2 — à décommenter quand prêt
// require __DIR__.'/api_client.php'; // Dev 3 — à décommenter quand prêt
