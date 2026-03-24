<?php
// app/Http/Controllers/Api/KiosqueController.php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Http\Requests\KiosqueRequest;
// Dans KiosqueController.php — changer cette ligne
use App\Http\Resources\KiosqueResource;  // ← si le fichier est dans Resources/
use App\Models\Kiosque;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KiosqueController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────
    // GET /api/kiosques
    // Paramètres optionnels : ?q=  ?statut=actif|inactif
    // ──────────────────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = Kiosque::with('admin')->withCount('agents');

        // Recherche texte : nom_kiosque, code_kiosque, adresse, ville
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('nom_kiosque',  'like', "%$q%")
                    ->orWhere('code_kiosque','like', "%$q%")
                    ->orWhere('adresse',     'like', "%$q%")
                    ->orWhere('ville',       'like', "%$q%");
            });
        }

        // Filtre statut_service
        if ($request->filled('statut')) {
            $query->where('statut_service', $request->statut);
        }

        $kiosques = $query->orderBy('nom_kiosque')->get();

        return response()->json([
            'data'  => KiosqueResource::collection($kiosques),
            'stats' => [
                'total'  => $kiosques->count(),
                'actifs' => $kiosques->where('statut_service', 'actif')->count(),
                'geles'  => $kiosques->where('statut_service', 'inactif')->count(),
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // POST /api/kiosques
    // Body : { code_kiosque, nom_kiosque, adresse, ville, telephone,
    //          statut_service?, id_admin? }
    // ──────────────────────────────────────────────────────────────────────
    public function store(KiosqueRequest $request): JsonResponse
    {
        $kiosque = Kiosque::create($request->validated());
        $kiosque->load('admin');
        $kiosque->loadCount('agents');

        return response()->json([
            'message' => 'Kiosque créé avec succès.',
            'data'    => new KiosqueResource($kiosque),
        ], 201);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/kiosques/{kiosque}
    // Retourne le kiosque avec admin + agents
    // ──────────────────────────────────────────────────────────────────────
    public function show(Kiosque $kiosque): JsonResponse
    {
        $kiosque->load('admin', 'agents.user');
        $kiosque->loadCount('agents');

        return response()->json([
            'data' => new KiosqueResource($kiosque),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // PUT /api/kiosques/{kiosque}
    // Body : mêmes champs que store
    // ──────────────────────────────────────────────────────────────────────
    public function update(KiosqueRequest $request, Kiosque $kiosque): JsonResponse
    {
        $kiosque->update($request->validated());
        $kiosque->load('admin');
        $kiosque->loadCount('agents');

        return response()->json([
            'message' => 'Kiosque mis à jour.',
            'data'    => new KiosqueResource($kiosque),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // PATCH /api/kiosques/{kiosque}/statut
    // Appelé par le toggle switch React
    // Body : { "statut_service": "actif" | "inactif" }
    // ──────────────────────────────────────────────────────────────────────
    public function toggleStatut(Request $request, Kiosque $kiosque): JsonResponse
    {
        $request->validate([
            'statut_service' => ['required', 'in:actif,inactif'],
        ]);

        $kiosque->update(['statut_service' => $request->statut_service]);

        return response()->json([
            'message' => $kiosque->estActif()
                ? "Kiosque {$kiosque->nom_kiosque} activé."
                : "Kiosque {$kiosque->nom_kiosque} mis hors ligne.",
            'data' => new KiosqueResource($kiosque),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // DELETE /api/kiosques/{kiosque}
    // Bloqué si des agents sont encore rattachés
    // ──────────────────────────────────────────────────────────────────────
    public function destroy(Kiosque $kiosque): JsonResponse
    {
        if ($kiosque->agents()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer : des agents sont rattachés à ce kiosque.',
            ], 422);
        }

        $nom = $kiosque->nom_kiosque;
        $kiosque->delete();

        return response()->json([
            'message' => "Kiosque {$nom} supprimé.",
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/kiosques/{kiosque}/agents
    // Liste des agents du kiosque avec leurs infos User
    // ──────────────────────────────────────────────────────────────────────
    public function agents(Kiosque $kiosque): JsonResponse
    {
        $agents = $kiosque->agents()
            ->with('user')
            ->get()
            ->map(fn($agent) => [
                'id'            => $agent->id_agent,
                'nom'           => $agent->user?->name ?? '—',
                'email'         => $agent->user?->email,
                'telephone'     => $agent->telephone,
                'adresse'       => $agent->adresse,
                'statut_ligne'  => $agent->statut_ligne,
                'est_en_ligne'  => $agent->estEnLigne(),
                'derniere_sync' => $agent->derniere_sync?->format('d/m/Y H:i'),
            ]);

        return response()->json([
            'data' => $agents,
        ]);
    }
}