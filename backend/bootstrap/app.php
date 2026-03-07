<?php

/**
 * ============================================================
 *  Bootstrap Application — BOMBA CASH
 * ============================================================
 *  Projet  : BOMBA CASH — Johann Finance SA © 2026
 *  Fichier : bootstrap/app.php
 * ============================================================
 *  Ce fichier configure l'application Laravel.
 *  C'est ici qu'on enregistre les middlewares personnalisés
 *  sous forme d'alias pour les utiliser dans routes/api.php.
 *
 *  Middlewares enregistrés :
 *    → 'isAdmin' : CheckIsAdmin — Protège le panel Manager
 *    → 'isAgent' : CheckIsAgent — Protège l'interface Agent
 *
 *  Utilisation dans les routes :
 *    Route::middleware(['auth:sanctum', 'isAdmin'])->group(...)
 *    Route::middleware(['auth:sanctum', 'isAgent'])->group(...)
 * ============================================================
 */

use App\Http\Middleware\CheckIsAdmin;
use App\Http\Middleware\CheckIsAgent;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // ----------------------------------------------------------
        // Enregistrement des middlewares personnalisés BOMBA CASH
        // ----------------------------------------------------------
        // Ces alias permettent d'utiliser les middlewares par leur
        // nom court dans les routes, rendant le code plus lisible.
        //
        //   'isAdmin' → CheckIsAdmin::class
        //      Vérifie : authentifié + rôle admin + compte actif
        //
        //   'isAgent' → CheckIsAgent::class
        //      Vérifie : authentifié + rôle agent + compte actif
        //               + profil agent existant + kiosque actif
        // ----------------------------------------------------------
        $middleware->alias([
            'isAdmin' => CheckIsAdmin::class,
            'isAgent' => CheckIsAgent::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Gestion des exceptions globales (à compléter si besoin)
    })->create();