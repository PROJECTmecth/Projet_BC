<?php
// ─────────────────────────────────────────────────────────────────────────────
// fichier : app/Http/Controllers/Admin/CarteController.php
//
// Contrôleur : CarteController
//
// Rôle :
//   Gère la génération des codes QR vierges en masse.
//   Chaque QR généré est sauvegardé dans la table `cartes` avec statut `vierge`.
//
// Endpoints :
//   POST /api/admin/qrcodes/generer  → generer()
//   GET  /api/admin/qrcodes/lots     → index()
//
// Règles métier :
//   - qr_code_uid  : UUID v4 unique généré via Str::uuid()
//   - numero_carte : BC-{id_carte paddé sur 5} ex: BC-00001
//   - statut       : vierge à la création
//   - date_creation: date du jour
//   - id_client, id_agent, id_kiosque : nullable à la génération (remplis à l'activation)
//   - Génération en transaction DB pour garantir l'intégrité
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Carte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CarteController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/admin/qrcodes/generer
    //
    // Body JSON : { "quantite": 100 }
    //
    // Retourne :
    // {
    //   "success": true,
    //   "message": "100 codes QR générés avec succès",
    //   "data": {
    //     "quantite": 100,
    //     "cartes": [ { "id_carte", "numero_carte", "qr_code_uid", "statut", "date_creation" }, ... ]
    //   }
    // }
    // ─────────────────────────────────────────────────────────────────────────
    public function generer(Request $request)
    {
        // ── Validation ────────────────────────────────────────────────────
        $validator = Validator::make($request->all(), [
            'quantite' => 'required|integer|min:1|max:500',
        ], [
            'quantite.required' => 'La quantité est obligatoire.',
            'quantite.integer'  => 'La quantité doit être un nombre entier.',
            'quantite.min'      => 'La quantité minimale est 1.',
            'quantite.max'      => 'La quantité maximale est 500 par lot.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $quantite = $request->quantite;

        // ── Génération en transaction DB ──────────────────────────────────
        try {
            $cartes = DB::transaction(function () use ($quantite) {
                $cartesGenerees = [];

                for ($i = 0; $i < $quantite; $i++) {

                    // Créer la carte vierge
                    $carte = Carte::create([
                        'qr_code_uid'    => Str::uuid()->toString(), // UUID v4 unique
                        'qr_code_image'  => '',                      // TODO: générer image QR si besoin
                        'statut'         => 'vierge',
                        'date_creation'  => now()->toDateString(),             // valeur par défaut
                        'montant_initial'=> 0,
                        'frais_garde'    => 0,
                        'progression'    => 0,
                    ]);

                    // Générer numero_carte basé sur id_carte auto-incrémenté
                    $numeroCarte = 'BC-' . str_pad($carte->id_carte, 5, '0', STR_PAD_LEFT);
                    $carte->update(['numero_carte' => $numeroCarte]);

                    $cartesGenerees[] = [
                        'id_carte'      => $carte->id_carte,
                        'numero_carte'  => $numeroCarte,
                        'qr_code_uid'   => $carte->qr_code_uid,
                        'statut'        => $carte->statut,
                        'date_creation' => $carte->date_creation,
                    ];
                }

                return $cartesGenerees;
            });

            return response()->json([
                'success' => true,
                'message' => "{$quantite} codes QR générés avec succès.",
                'data'    => [
                    'quantite' => $quantite,
                    'cartes'   => $cartes,
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération des codes QR.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/admin/qrcodes/lots
    //
    // Par défaut : exclut les lots annulés.
    // Avec ?include_annule=1 : retourne tous les lots (pour rapport complet PDF).
    // ─────────────────────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        try {
            $query = Carte::select(
                        'date_creation',
                        'statut',
                        DB::raw('COUNT(*) as quantite'),
                        DB::raw('MIN(id_carte) as premier_id'),
                        DB::raw('MAX(id_carte) as dernier_id')
                    )
                    ->groupBy('date_creation', 'statut')
                    ->orderByDesc('date_creation');

            if ($request->boolean('include_annule')) {
                $lots = $query->get()->map(function ($lot, $index) {
                    return [
                        'id'             => $lot->premier_id,
                        'numero'         => 'Lot #' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                        'quantite'       => $lot->quantite,
                        'dateGeneration' => \Carbon\Carbon::parse($lot->date_creation)->format('d/m/Y'),
                        'statut'         => ucfirst($lot->statut),
                        'annule'         => $lot->statut === 'annulé',
                    ];
                });

                return response()->json([
                    'success' => true,
                    'data'    => $lots,
                ]);
            }

            // Normal paginated request — exclure les lots annulés
            $limit = (int) $request->query('limit', 10);
            $page = (int) $request->query('page', 1);
            $statutFilter = $request->query('statut');

            // Filtrer les annulés de la requête principale ET du comptage
            $query->where('statut', '!=', 'annulé');

            $countQuery = Carte::select('date_creation', 'statut')
                ->where('statut', '!=', 'annulé')
                ->groupBy('date_creation', 'statut');

            // Filtre optionnel par statut spécifique (vierge, actif, expiré, terminé)
            if ($statutFilter && in_array($statutFilter, ['vierge', 'actif', 'expiré', 'terminé'])) {
                $query->where('statut', $statutFilter);
                $countQuery->where('statut', $statutFilter);
            }
            $total = $countQuery->get()->count();

            $paginatedLots = $query->skip(($page - 1) * $limit)
                                  ->take($limit)
                                  ->get();

            $lots = $paginatedLots->map(function ($lot, $index) use ($page, $limit) {
                return [
                    'id'             => $lot->premier_id,
                    'numero'         => 'Lot #' . str_pad($index + 1 + ($page - 1) * $limit, 3, '0', STR_PAD_LEFT),
                    'quantite'       => $lot->quantite,
                    'dateGeneration' => \Carbon\Carbon::parse($lot->date_creation)->format('d/m/Y'),
                    'statut'         => ucfirst($lot->statut),
                    'annule'         => $lot->statut === 'annulé',
                ];
            });

            return response()->json([
                'success' => true,
                'data'    => $lots,
                'pagination' => [
                    'current_page' => $page,
                    'limit'        => $limit,
                    'total'        => $total,
                    'total_pages'  => (int) ceil($total / $limit),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des lots.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/admin/qrcodes/annuler
    //
    // Body JSON : { "carte_ids": [1, 2, 3, ...] }
    // Marque les cartes vierges comme annulées.
    // ─────────────────────────────────────────────────────────────────────────
    public function annuler(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'carte_ids'   => 'required|array|min:1',
            'carte_ids.*' => 'integer',
        ], [
            'carte_ids.required' => 'La liste des cartes est obligatoire.',
            'carte_ids.array'    => 'Le format est invalide.',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $count = Carte::whereIn('id_carte', $request->carte_ids)
            ->where('statut', 'vierge')
            ->update(['statut' => 'annulé']);

        return response()->json([
            'success' => true,
            'message' => "{$count} carte(s) annulée(s).",
            'annulees' => $count,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/admin/qrcodes/supprimer
    //
    // Body JSON : { "lot_ids": [premier_id_1, premier_id_2, ...] }
    // Supprime des lots de l'historique en marquant leurs cartes comme annulées.
    // Seuls les lots de cartes vierges peuvent être supprimés.
    // Les cartes actives/terminées/expirées liées à des clients sont protégées.
    // ─────────────────────────────────────────────────────────────────────────
    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lot_ids'   => 'required|array|min:1',
            'lot_ids.*' => 'integer',
        ], [
            'lot_ids.required' => 'La liste des lots est obligatoire.',
            'lot_ids.array'    => 'Le format est invalide.',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $totalAnnulees = 0;
        $lotsProteges  = 0;

        foreach ($request->lot_ids as $premierId) {
            $carte = Carte::find($premierId);
            if (!$carte) continue;

            // Protéger les cartes liées à des clients (actif, terminé, expiré)
            if (in_array($carte->statut, ['actif', 'terminé', 'expiré'])) {
                $lotsProteges++;
                continue;
            }

            // Marquer toutes les cartes de ce lot (même date + même statut) comme annulées
            $count = Carte::where('date_creation', $carte->date_creation)
                ->where('statut', $carte->statut)
                ->where('statut', '!=', 'annulé')
                ->update(['statut' => 'annulé']);

            $totalAnnulees += $count;
        }

        $message = "{$totalAnnulees} carte(s) supprimée(s) de l'historique.";
        if ($lotsProteges > 0) {
            $message .= " {$lotsProteges} lot(s) protégé(s) (cartes actives/utilisées).";
        }

        return response()->json([
            'success'  => true,
            'message'  => $message,
            'annulees' => $totalAnnulees,
            'proteges' => $lotsProteges,
        ]);
    }
}
