<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => [
        'https://projet-bc.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
        'https://projetbc-production-bombacash.up.railway.app'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => explode(',', env('CORS_ALLOWED_HEADERS', '*')),

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,





];