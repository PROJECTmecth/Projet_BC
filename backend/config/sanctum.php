<?php

return [
    // ✅ Domaines stateful pour votre environnement WAMP
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS',
        'localhost,localhost:5173,localhost:5174,127.0.0.1,127.0.0.1:5173,127.0.0.1:5174,127.0.0.1:8000,::1'
    )),

    // ✅ Guard pour les sessions stateful
    'guard' => ['web'],

    // ✅ Pas d'expiration (ou mettez 60*24 pour 24h si vous préférez)
    'expiration' => null,

    // Préfixe token (laissez vide)
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    // Middlewares pour les sessions stateful
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],
];
