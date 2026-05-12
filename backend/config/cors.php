<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration
    | Frontend Vercel → Backend Railway
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_unique([
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'https://projet-bc.vercel.app',
        env('FRONTEND_URL'),         // Variable Railway
        env('APP_FRONTEND_URL'),     // Alias de secours
    ])),

    // Wildcard pattern si FRONTEND_URL contient *.vercel.app
    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Authorization'],

    'max_age' => 86400,

    // ✅ false car on utilise Bearer Token (pas de cookies en cross-domain)
    // Mettre true SEULEMENT si le frontend et le backend sont sur le même domaine
    'supports_credentials' => false,
];
