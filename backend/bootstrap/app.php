<?php

use App\Http\Middleware\CheckIsAdmin;
use App\Http\Middleware\CheckIsAgent;
use App\Http\Middleware\CorsMiddleware;
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

        // Trust Proxies (Railway)
        $middleware->trustProxies(at: '*');
        
        // Add custom CORS middleware globally
        $middleware->append(CorsMiddleware::class);
        
        // Enregistrement explicite du middleware CORS
        $middleware->prependToGroup('api', HandleCors::class);
        $middleware->prependToGroup('web', HandleCors::class);

        $middleware->validateCsrfTokens(except: [
            'api/*',
            'login',
            'logout',
            'sanctum/csrf-cookie',
        ]);

        $middleware->api(prepend: [
            // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'isAdmin'  => CheckIsAdmin::class,
            'isAgent'  => CheckIsAgent::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
    })->create();
