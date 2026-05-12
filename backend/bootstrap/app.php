<?php

use App\Http\Middleware\CheckIsAdmin;
use App\Http\Middleware\CheckIsAgent;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // ✅ CORS — doit être AVANT tout autre middleware
        $middleware->prepend(HandleCors::class);

        // Exclure les routes API et auth du CSRF
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'login',
            'logout',
            'sanctum/csrf-cookie',
        ]);

        $middleware->web(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // ⚠️ Ne pas mettre EnsureFrontendRequestsAreStateful sur les API en cross-domain
        // Le token Bearer est utilisé à la place des cookies de session

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'isAdmin'  => CheckIsAdmin::class,
            'isAgent'  => CheckIsAgent::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
    })->create();