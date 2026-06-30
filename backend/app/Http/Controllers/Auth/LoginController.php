<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * POST /login
     * Authentifie l'utilisateur via le champ "name".
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'string'],
            'password' => ['required', 'string'],
        ], [
            'name.required'     => "Le nom d'utilisateur est requis.",
            'password.required' => "Le mot de passe est requis.",
        ]);

        $credentials = [
            'name'     => $request->input('name'),
            'password' => $request->input('password'),
        ];

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'name' => ["Nom d'utilisateur ou mot de passe incorrect."],
            ]);
        }

        $user = Auth::user();

        if ($user->statut === 'inactif') {
            Auth::logout();
            return response()->json([
                'message' => "Votre compte est désactivé. Contactez l'administrateur.",
            ], 403);
        }

        $request->session()->regenerate();

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
    }

    /**
     * POST /logout
     */
    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Déconnecté.']);
    }
}