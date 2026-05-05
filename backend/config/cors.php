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
        'https://projet-bc.vercel.app',      // ← ton front Vercel (OBLIGATOIRE)
        // Ajoute ici si tu as d'autres domaines :
        // 'https://www.ton-domaine.com',
        // 'http://localhost:5173',           // dev local Vite
        // 'http://localhost:3000',           // dev local autre port
    ],

    'allowed_origins_patterns' => [
        // Autorise tous les preview deployments Vercel (optionnel)
        '#^https://projet-bc-.*\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400, // cache preflight 24h

    /*
     | CRUCIAL — mettre à TRUE si tu utilises withCredentials côté Axios
     | Mettre à FALSE si tu utilises UNIQUEMENT Bearer token sans cookies
     |
     | Avec Bearer token seul → false (recommandé pour API stateless)
    */
    'supports_credentials' => false,

];