<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()], 200);
});

Route::get('/up', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()], 200);
});

require __DIR__.'/auth.php';