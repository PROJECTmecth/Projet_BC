<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

/**
 * ============================================================
 *  AppServiceProvider — BOMBA CASH
 * ============================================================
 *  Fichier : backend/app/Providers/AppServiceProvider.php
 * ============================================================
 *  Fix MySQL : Schema::defaultStringLength(191)
 *  Résout l'erreur "key too long" sur les colonnes email
 *  lors des migrations avec MySQL < 5.7.7
 * ============================================================
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Enregistrement des services de l'application.
     */
    public function register(): void
    {
        //
    }

    /**
     * Démarrage des services de l'application.
     * Fix appliqué : longueur par défaut des string réduite à 191
     * pour compatibilité avec MySQL et son index de 1000 bytes max.
     */
    public function boot(): void
    {
        // Fix MySQL "key too long" — longueur max index MySQL = 1000 bytes
        // utf8mb4 utilise 4 bytes/char donc 191 * 4 = 764 bytes (< 1000) ✅
        Schema::defaultStringLength(191);
    }
}