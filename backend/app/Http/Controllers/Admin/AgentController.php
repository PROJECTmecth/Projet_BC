<?php
// app/Http/Controllers/Admin/AgentController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AgentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Agent::with('user', 'kiosque');

        if ($request->filled('id_kiosque')) {
            $query->where('id_kiosque', $request->id_kiosque);
        }
        if ($request->filled('statut')) {
            $query->where('statut_ligne', $request->statut);
        }
        if ($request->filled('q')) {
            $q = $request->q;
            $query->whereHas('user', fn($u) =>
                $u->where('name', 'like', "%$q%")
                  ->orWhere('email', 'like', "%$q%")
            );
        }

        $agents = $query->orderBy('id_agent')->get();

        return response()->json([
            'data'  => $agents->map(fn($a) => $this->format($a)),
            'stats' => [
                'total'      => $agents->count(),
                'en_ligne'   => $agents->where('statut_ligne', 'en_ligne')->count(),
                'hors_ligne' => $agents->where('statut_ligne', 'hors_ligne')->count(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nom'        => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'unique:users,email'],
            'password'   => ['required', 'string', 'min:6'],
            'telephone'  => ['required', 'string', 'max:20', 'regex:/^\+242\s?\d{2}\s?\d{3}\s?\d{4}$/'],
            'adresse'    => ['required', 'string', 'max:255'],
            'id_kiosque' => ['required', 'exists:kiosques,id_kiosque'],
            'statut'     => ['sometimes', 'in:actif,inactif'],
        ], [
            'nom.required'      => 'Le nom est obligatoire.',
            'email.required'    => "L'email est obligatoire.",
            'email.unique'      => 'Cet email est déjà utilisé.',
            'password.min'      => 'Le mot de passe doit faire au moins 6 caractères.',
            'telephone.regex'   => 'Format attendu : +242 XX XXX XXXX',
            'id_kiosque.exists' => "Ce kiosque n'existe pas.",
        ]);

        // ✅ Vérifier si le kiosque est déjà rattaché à un agent
        if (Agent::where('id_kiosque', $request->id_kiosque)->exists()) {
            return response()->json([
                'message' => 'Ce kiosque est déjà rattaché à un agent.',
                'errors'  => ['id_kiosque' => ['Ce kiosque est déjà utilisé par un autre agent.']],
            ], 422);
        }

        $agent = DB::transaction(function () use ($request) {
            $user = User::create([
                'name'     => $request->nom,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'agent',
                'statut'   => $request->statut ?? 'actif',
            ]);

            $agent = Agent::create([
                'id_user'      => $user->id,
                'id_kiosque'   => $request->id_kiosque,
                'telephone'    => $request->telephone,
                'adresse'      => $request->adresse,
                'statut_ligne' => 'hors_ligne',
            ]);

            // Mettre à jour le téléphone du kiosque si vide
            if (!$agent->kiosque->telephone) {
                $agent->kiosque->update(['telephone' => $request->telephone]);
            }

            return $agent->load('user', 'kiosque');
        });

        return response()->json([
            'message' => "Agent {$agent->user->name} créé avec succès.",
            'data'    => $this->format($agent),
        ], 201);
    }

    public function show(Agent $agent): JsonResponse
    {
        $agent->load('user', 'kiosque', 'clients');
        return response()->json(['data' => $this->format($agent)]);
    }

    public function update(Request $request, Agent $agent): JsonResponse
    {
        $request->validate([
            'nom'        => ['sometimes', 'string', 'max:100'],
            'email'      => ['sometimes', 'email', 'unique:users,email,' . $agent->id_user . ',id'],
            'telephone'  => ['sometimes', 'string', 'max:20', 'regex:/^\+242\s?\d{2}\s?\d{3}\s?\d{4}$/'],
            'adresse'    => ['sometimes', 'string', 'max:255'],
            'id_kiosque' => ['sometimes', 'exists:kiosques,id_kiosque'],
            'statut'     => ['sometimes', 'in:actif,inactif'],
        ]);

        // ✅ Vérifier si le nouveau kiosque est déjà pris (sauf par cet agent lui-même)
        if ($request->filled('id_kiosque') && $request->id_kiosque != $agent->id_kiosque) {
            if (Agent::where('id_kiosque', $request->id_kiosque)->exists()) {
                return response()->json([
                    'message' => 'Ce kiosque est déjà rattaché à un agent.',
                    'errors'  => ['id_kiosque' => ['Ce kiosque est déjà utilisé par un autre agent.']],
                ], 422);
            }
        }

        DB::transaction(function () use ($request, $agent) {
            $agent->user->update(array_filter([
                'name'   => $request->nom,
                'email'  => $request->email,
                'statut' => $request->statut,
            ]));

            $agent->update(array_filter([
                'telephone'  => $request->telephone,
                'adresse'    => $request->adresse,
                'id_kiosque' => $request->id_kiosque,
            ]));
        });

        $agent->load('user', 'kiosque');

        return response()->json([
            'message' => 'Agent mis à jour.',
            'data'    => $this->format($agent),
        ]);
    }

    public function toggleStatut(Request $request, Agent $agent): JsonResponse
    {
        $request->validate([
            'statut_ligne' => ['required', 'in:en_ligne,hors_ligne'],
        ]);

        $agent->update(['statut_ligne' => $request->statut_ligne]);

        return response()->json([
            'message' => $agent->estEnLigne() ? "Agent mis en ligne." : "Agent mis hors ligne.",
            'data'    => $this->format($agent->load('user', 'kiosque')),
        ]);
    }

    public function destroy(Agent $agent): JsonResponse
    {
        $nom = $agent->user->name;

        DB::transaction(function () use ($agent) {
            $userId = $agent->id_user;
            $agent->delete();
            User::destroy($userId);
        });

        return response()->json(['message' => "Agent {$nom} supprimé."]);
    }

    private function format(Agent $agent): array
    {
        return [
            'id'            => $agent->id_agent,
            'nom'           => $agent->user?->name ?? '—',
            'email'         => $agent->user?->email,
            'statut'        => $agent->user?->statut ?? 'actif',  // ✅ statut du compte
            'telephone'     => $agent->telephone,
            'adresse'       => $agent->adresse,
            'statut_ligne'  => $agent->statut_ligne,
            'est_en_ligne'  => $agent->estEnLigne(),
            'derniere_sync' => $agent->derniere_sync?->format('d/m/Y H:i'),
            'kiosque'       => $agent->relationLoaded('kiosque') ? [
                'id'          => $agent->kiosque?->id_kiosque,
                'nom_kiosque' => $agent->kiosque?->nom_kiosque,
                'ville'       => $agent->kiosque?->ville,
                'code'        => $agent->kiosque?->code_kiosque,
            ] : null,
            'nb_clients'    => $agent->relationLoaded('clients') ? $agent->clients->count() : null,
            'created_at'    => $agent->created_at?->format('d/m/Y H:i'),
        ];
    }
}