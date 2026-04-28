<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kiosque;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Retourne les stats globales des kiosques (format cohérent avec KiosqueController)
     */
    public function getStats(): JsonResponse
    {
        try {
            // ✅ Stats globales — sans filtres, sur toute la table
            $total  = Kiosque::count();
            $actifs = Kiosque::where('statut_service', 'actif')->count();
            $geles  = Kiosque::where('statut_service', 'inactif')->count();

            return response()->json([
                'success' => true,
                // On ne retourne PAS 'data' pour alléger la réponse du dashboard
                'stats' => [
                    'total'  => $total,
                    'actifs' => $actifs,
                    'geles'  => $geles,
                ],
                'timestamp' => now()->toISOString()
            ], 200);

        } catch (\Exception $e) {
            Log::error('Dashboard Stats Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur',
                'stats' => ['total' => 0, 'actifs' => 0, 'geles' => 0]
            ], 500);
        }
    }
}
