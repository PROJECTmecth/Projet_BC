<?php
/**
 * ============================================================
 *  Routes API Agent — BOMBA CASH
 * ============================================================
 *  Dev 1 — NE PAS MODIFIER par Dev 2 ou Dev 3
 * ============================================================
 */

use App\Http\Controllers\Agent\AgentDashboardController;
use App\Http\Controllers\Agent\AgentClientsController;
use App\Http\Controllers\Agent\AgentHistoriqueController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'isAgent'])
    ->prefix('agent')
    ->name('agent.')
    ->group(function () {

        // ── Dashboard ──────────────────────────────────────────
        Route::get('/dashboard', [AgentDashboardController::class, 'index'])
            ->name('dashboard');

        // ── Clients ────────────────────────────────────────────
        Route::get('/clients',           [AgentClientsController::class, 'index'])
            ->name('clients.index');
        Route::get('/clients/{id}',      [AgentClientsController::class, 'show'])
            ->name('clients.show');
        Route::post('/clients/register', [AgentClientsController::class, 'register'])
            ->name('clients.register');

        // ── Scan carte QR ──────────────────────────────────────
        Route::post('/scan', [AgentClientsController::class, 'scanCarte'])
            ->name('scan');

        // ── Transactions ───────────────────────────────────────
        Route::post('/transactions', [AgentClientsController::class, 'storeTransaction'])
            ->name('transactions.store');

        // ── Historique ─────────────────────────────────────────
        Route::get('/historique',              [AgentHistoriqueController::class, 'index'])
            ->name('historique.index');
        Route::get('/historique/export-excel', [AgentHistoriqueController::class, 'exportExcel'])
            ->name('historique.export-excel');
        Route::get('/historique/export-pdf',   [AgentHistoriqueController::class, 'exportPdf'])
            ->name('historique.export-pdf');

        // ── Stats (à brancher plus tard) ───────────────────────
        Route::get('/stats', fn() => response()->json([
            'success' => true,
            'message' => 'À brancher sur AgentStatsController',
        ]))->name('stats');
    });