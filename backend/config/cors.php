<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     |--------------------------------------------------------------------------
     | IMPORTANT — pas de wildcard '*' avec credentials en production
     | Lister EXPLICITEMENT chaque origine autorisée
     |--------------------------------------------------------------------------
    */
    'allowed_origins' => [
        'https://projet-bc.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
    ],

    'allowed_origins_patterns' => [
        '#^https://projet-bc-.*\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,



];