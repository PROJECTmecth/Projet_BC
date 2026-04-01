<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AgentHistoriqueController extends Controller
{
    /**
     * GET /api/agent/historique
     */
    public function index(Request $request)
    {
        $user  = $request->user();
        $agent = Agent::where('id_user', $user->id)->first();

        if (!$agent) {
            return response()->json(['message' => 'Agent introuvable.'], 403);
        }

        $dateDebut = $request->input('date_debut', now()->startOfYear()->format('Y-m-d'));
        $dateFin   = $request->input('date_fin',   now()->format('Y-m-d'));
        $typeOp    = $request->input('type_op');
        $client    = $request->input('client');
        $perPage   = min((int) $request->input('per_page', 15), 100);

        $query = DB::table('transactions as t')
            ->join('clients as c',  'c.id_client', '=', 't.id_client')
            ->join('cartes as ca',  'ca.id_carte',  '=', 't.id_carte')
            ->where('t.id_agent', $agent->id_agent)
            ->whereDate('t.date_heure', '>=', $dateDebut)
            ->whereDate('t.date_heure', '<=', $dateFin)
            ->select([
                't.id_trans',
                't.id_client',
                't.type_op',
                't.montant',
                't.penalite',
                't.solde_avant',
                't.solde_apres',
                't.date_heure',
                't.sync_status',
                'c.nom as client_nom',
                'c.prenom as client_prenom',
                'c.telephone',
                'ca.numero_carte',
            ]);

        if ($typeOp && in_array($typeOp, ['dépôt_cash', 'retrait_partiel', 'retrait_solde_compte'])) {
            $query->where('t.type_op', $typeOp);
        }

        if ($client) {
            $like = '%' . $client . '%';
            $query->where(function ($q) use ($like) {
                $q->where('c.nom',       'like', $like)
                  ->orWhere('c.prenom',   'like', $like)
                  ->orWhere('c.telephone','like', $like);
            });
        }

        // KPI (avant pagination)
      // ✅ APRÈS — requête KPI séparée et propre
$kpiRaw = DB::table('transactions as t')
    ->join('clients as c',  'c.id_client', '=', 't.id_client')
    ->join('cartes as ca',  'ca.id_carte',  '=', 't.id_carte')
    ->where('t.id_agent', $agent->id_agent)
    ->whereDate('t.date_heure', '>=', $dateDebut)
    ->whereDate('t.date_heure', '<=', $dateFin)
    ->when($typeOp, fn($q) => $q->where('t.type_op', $typeOp))
    ->when($client, fn($q) => $q->where(function($q2) use ($client) {
        $like = '%'.$client.'%';
        $q2->where('c.nom','like',$like)
           ->orWhere('c.prenom','like',$like)
           ->orWhere('c.telephone','like',$like);
    }))
    ->selectRaw('
        COUNT(*) as total,
        SUM(CASE WHEN t.type_op = ? THEN 1 ELSE 0 END) as depots,
        SUM(CASE WHEN t.type_op IN (?,?) THEN 1 ELSE 0 END) as retraits,
        COALESCE(SUM(t.montant), 0) as montant_total
    ', ['dépôt_cash', 'retrait_partiel', 'retrait_solde_compte'])
    ->first();

        $kpi = [
            'total'         => (int)   $kpiRaw->total,
            'depots'        => (int)   $kpiRaw->depots,
            'retraits'      => (int)   $kpiRaw->retraits,
            'montant_total' => (float) $kpiRaw->montant_total,
        ];

        $transactions = $query->orderBy('t.date_heure', 'desc')->paginate($perPage);

        return response()->json([
            'kpi'          => $kpi,
            'transactions' => $transactions,
        ]);
    }

    /**
     * GET /api/agent/historique/export-excel
     */
    public function exportExcel(Request $request)
    {
        $rows = $this->buildExportRows($request);

        $csv  = "\xEF\xBB\xBF"; // BOM UTF-8 pour Excel
        $csv .= "DATE,NOM ET PRÉNOM,OPÉRATION,MONTANT,HEURE,N. CARTE,TÉLÉPHONE,SYNC\n";

        foreach ($rows as $row) {
            $dt   = new \DateTime($row->date_heure);
            $csv .= implode(',', [
                $dt->format('d/m/Y'),
                '"' . $row->client_prenom . ' ' . $row->client_nom . '"',
                '"' . $row->type_op . '"',
                $row->montant,
                $dt->format('H') . 'h' . $dt->format('i'),
                $row->numero_carte ?? '',
                $row->telephone    ?? '',
                $row->sync_status,
            ]) . "\n";
        }

        $dateDebut = $request->input('date_debut', now()->format('Y-m-d'));
        $dateFin   = $request->input('date_fin',   now()->format('Y-m-d'));

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"historique_{$dateDebut}_{$dateFin}.csv\"",
        ]);
    }

    /**
     * GET /api/agent/historique/export-pdf
     * (nécessite composer require barryvdh/laravel-dompdf)
     */
    public function exportPdf(Request $request)
    {
        $rows      = $this->buildExportRows($request);
        $dateDebut = $request->input('date_debut', '');
        $dateFin   = $request->input('date_fin',   '');

        // Une fois dompdf installé, décommenter :
        // $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('agent.historique_pdf', compact('rows','dateDebut','dateFin'));
        // return $pdf->download("historique_{$dateDebut}_{$dateFin}.pdf");

        return response()->json(['message' => 'PDF disponible après installation de dompdf.'], 501);
    }

    private function buildExportRows(Request $request)
    {
        $user  = $request->user();
        $agent = Agent::where('id_user', $user->id)->first();

        return DB::table('transactions as t')
            ->join('clients as c', 'c.id_client', '=', 't.id_client')
            ->join('cartes as ca', 'ca.id_carte',  '=', 't.id_carte')
            ->where('t.id_agent', $agent->id_agent)
            ->whereDate('t.date_heure', '>=', $request->input('date_debut', now()->startOfYear()->format('Y-m-d')))
            ->whereDate('t.date_heure', '<=', $request->input('date_fin',   now()->format('Y-m-d')))
            ->when($request->input('type_op'), fn($q, $v) => $q->where('t.type_op', $v))
            ->when($request->input('client'),  fn($q, $v) => $q->where(function($q2) use ($v) {
                $like = '%'.$v.'%';
                $q2->where('c.nom','like',$like)->orWhere('c.prenom','like',$like)->orWhere('c.telephone','like',$like);
            }))
            ->select(['t.type_op','t.montant','t.date_heure','t.sync_status',
                      'c.nom as client_nom','c.prenom as client_prenom','c.telephone','ca.numero_carte'])
            ->orderBy('t.date_heure', 'desc')
            ->get();
    }
}