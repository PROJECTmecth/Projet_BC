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
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,


];