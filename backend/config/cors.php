<?php

return [

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        // 'login',   // Décommente si tu utilises ces routes Laravel en direct
        // 'logout',
        // 'register',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'], // Temporairement ouvert pour la production

    // Si tu veux repasser en local strict, commente la ligne du haut et décommente ceci :
    // 'allowed_origins' => [
    //     'http://localhost:5173',
    //     'http://127.0.0.1:5173',
    // ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // Obligatoire pour withCredentials
];
