<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});


// Routes protégées Admin (CheckIsAdmin middleware)
/* Route::middleware(['auth:sanctum', 'isAdmin'])->group(function () {
    Route::get('/admin/cartes', [CardController::class, 'index']);
    Route::post('/admin/cartes/generate', [CardController::class, 'generate']);
});

// Routes protégées Agent (CheckIsAgent middleware)
Route::middleware(['auth:sanctum', 'isAgent'])->group(function () {
    Route::get('/agent/dashboard', [AgentController::class, 'dashboard']);
}); */

// Route pour récupérer l'utilisateur connecté (dans React pour lire le rôle)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
