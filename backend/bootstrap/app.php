<?php

use App\Http\Middleware\CheckIsAdmin;
use App\Http\Middleware\CheckIsAgent;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(_DIR_))
    ->withRouting(
        web: _DIR_.'/../routes/web.php',
        api: _DIR_.'/../routes/api.php',
        commands: _DIR_.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Sanctum frontend (collègue login)
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Middlewares BOMBA CASH
        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'isAdmin'  => CheckIsAdmin::class,
            'isAgent'  => CheckIsAgent::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
    })->create();