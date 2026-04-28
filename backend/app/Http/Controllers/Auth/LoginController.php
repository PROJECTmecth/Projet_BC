<?php

/* namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller */

    /**
     * POST /login
     *
     * Authentifie l'utilisateur via le champ "name" (nom d'utilisateur)
     * au lieu du champ "email" par défaut de Laravel Breeze.
     *
     * Body attendu : { "name": "admin", "password": "admin123" }
     *
     * Réponses :
     *   200 → { message: "Connecté", user: { id, name, email, role, statut } }
     *   422 → { message: "...", errors: { name: [...] } }
     *   403 → { message: "Compte désactivé." }
     */
    /* public function store(Request $request)
    { */
        // ── 1. Validation des champs ──────────────────────────────────────────
       /*  $request->validate([
            'name'     => ['required', 'string'],
            'password' => ['required', 'string'],
        ], [
            'name.required'     => "Le nom d'utilisateur est requis.",
            'password.required' => "Le mot de passe est requis.",
        ]); */

        // ── 2. Tentative d'authentification via "name" ────────────────────────
        // Auth::attempt() accepte un tableau de credentials
        // On utilise "name" à la place de "email"
        /* $credentials = [
            'name'     => $request->name,
            'password' => $request->password,
        ];

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'name' => ["Nom d'utilisateur ou mot de passe incorrect."],
            ]);
        } */

        // ── 3. Vérification du statut du compte ──────────────────────────────
       /*  $user = Auth::user();

        if ($user->statut === 'inactif') {
            Auth::logout();
            return response()->json([
                'message' => 'Votre compte est désactivé. Contactez l\'administrateur.',
            ], 403);
        } */

        // ── 4. Régénération de session (sécurité — anti fixation de session) ──
        /* $request->session()->regenerate();

        return response()->json([
            'message' => 'Connecté avec succès.',
            'user'    => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'role'   => $user->role,
                'statut' => $user->statut,
            ],
        ]);
    } */

    /**
     * POST /logout
     * Déconnecte l'utilisateur et détruit la session.
     */
    /* public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Déconnecté.']);
    }
} */