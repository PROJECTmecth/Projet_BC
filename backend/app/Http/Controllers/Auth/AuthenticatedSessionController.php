<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthenticatedSessionController extends Controller
{
    public function store(Request $request)
    {
        // Vérification rate limiting
        $this->ensureIsNotRateLimited($request);

        // Validation
        $request->validate([
            'name' => 'required|string',
            'password' => 'required|string',
        ]);

        // Recherche utilisateur
        $user = User::where('name', $request->name)->first();

        // Vérification credentials
        if (!$user || !Hash::check($request->password, $user->password)) {
            // Incrémenter rate limiter en cas d'échec
            RateLimiter::hit($this->throttleKey($request));

            throw ValidationException::withMessages([
                'name' => ['Les informations d\'identification fournies ne correspondent pas à nos enregistrements.'],
            ]);
        }

        // Compte désactivé
        if ($user->statut === 'inactif') {
            return response()->json([
                'message' => 'Votre compte est désactivé. Contactez l\'administrateur.',
            ], 403);
        }

        // Nettoyer rate limiter en cas de succès
        RateLimiter::clear($this->throttleKey($request));

        // ✅ Supprimer les anciens tokens (sécurité)
        $user->tokens()->delete();

        // ✅ Créer nouveau token Sanctum
        $token = $user->createToken('bc_token')->plainTextToken;

        return response()->json([
            'message' => 'Connecté avec succès.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'statut' => $user->statut,
            ],
        ]);
    }

    public function destroy(Request $request)
    {
        // Suppression du token actuel
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    /**
     * Vérification rate limiting
     */
    protected function ensureIsNotRateLimited(Request $request): void
    {
        if (!RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'name' => "Trop de tentatives de connexion. Veuillez réessayer dans {$seconds} secondes.",
        ]);
    }

    /**
     * Clé pour le rate limiting
     */
    protected function throttleKey(Request $request): string
    {
        return strtolower($request->input('name')) . '|' . $request->ip();
    }
}
