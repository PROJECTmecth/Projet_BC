<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'register',
    ],
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5174',  // ← ton frontend tourne sur 5174
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
    ],
    'allowed_methods'     => ['*'],
    'allowed_headers'     => ['*'],
    'exposed_headers'     => [],
    'max_age'             => 0,
    'supports_credentials'=> true,  // ← true obligatoire avec withCredentials
];