<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    public function store(LoginRequest $request)
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = Auth::user();

        // Compte désactivé
        if ($user->statut === 'inactif') {
            Auth::logout();
            return response()->json([
                'message' => 'Votre compte est désactivé.',
            ], 403);
        }

        // ✅ Créer un token Sanctum pour les requêtes API
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connecté avec succès.',
            'token'   => $token,
            'user'    => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'role'   => $user->role,
                'statut' => $user->statut,
            ],
        ]);
    }

    public function destroy(Request $request)
    {
        // ✅ Révoquer tous les tokens de l'utilisateur connecté
        $request->user()?->tokens()->delete();

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Déconnecté.']);
    }
}