<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Forcer la longueur par défaut des chaînes pour éviter les problèmes d'indexation avec MySQL 5.7
        Schema::defaultStringLength(191);   
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
