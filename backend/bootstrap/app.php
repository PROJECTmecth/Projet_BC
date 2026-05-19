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
        // Lit la config depuis config/cors.php
        $middleware->prepend(HandleCors::class);

        // Trust Proxies (Railway se trouve derrière un reverse proxy)
        $middleware->trustProxies(at: '*');

        // Exclure les routes API et auth du CSRF
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'login',
            'logout',
            'sanctum/csrf-cookie',
        ]);

        // ⚠️ EnsureFrontendRequestsAreStateful retiré du groupe web :
        // inutile en cross-domain Bearer Token et peut provoquer
        // des conflits de session/cookies avec Vercel → Railway.

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'isAdmin'  => CheckIsAdmin::class,
            'isAgent'  => CheckIsAgent::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
    })->create();
