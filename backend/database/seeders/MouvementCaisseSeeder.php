<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Client;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MouvementCaisseSeeder extends Seeder
{
    public function run(): void
    {
        $agent = Agent::first();

        if (! $agent) {
            $this->command?->warn('Aucun agent trouvé. Exécutez d\'abord AgentTestSeeder ou créez un agent.');
            return;
        }

        $clients = Client::with(['carte', 'compte'])
            ->where('id_agent', $agent->id_agent)
            ->get();

        if ($clients->isEmpty()) {
            $this->command?->warn('Aucun client trouvé pour l\'agent. Exécutez d\'abord TestClientsSeeder.');
            return;
        }

        $created = 0;

        DB::transaction(function () use ($agent, $clients, &$created): void {
            foreach ($clients as $index => $client) {
                if (! $client->compte || ! $client->carte) {
                    continue;
                }

                $solde = (float) $client->compte->solde_total;
                $baseDate = Carbon::now()->subDays(random_int(1, 20))->subMinutes(random_int(0, 59));

                // 1. Dépôt cash test
                $depositAmount = max(1000, min(15000, round($solde * 0.15 / 1000) * 1000));
                if ($depositAmount <= 0) {
                    $depositAmount = 1000;
                }

                $transactionDate = $baseDate->copy()->subHours(random_int(0, 12));
                $newSolde = $solde + $depositAmount;

                Transaction::create([
                    'id_carte'   => $client->carte->id_carte,
                    'id_client'  => $client->id_client,
                    'id_agent'   => $agent->id_agent,
                    'id_kiosque' => $agent->id_kiosque,
                    'type_op'    => 'dépôt_cash',
                    'montant'    => $depositAmount,
                    'penalite'   => 0,
                    'solde_avant'=> $solde,
                    'solde_apres'=> $newSolde,
                    'date_heure' => $transactionDate,
                    'sync_status'=> 'synchronisé',
                ]);

                $client->compte->update([
                    'solde_total' => $newSolde,
                    'total_depots' => (float) $client->compte->total_depots + $depositAmount,
                ]);

                $created++;

                // 2. Retrait partiel pour certains clients si le solde le permet
                $solde = $newSolde;
                if ($index % 2 === 0 && $solde > 5000) {
                    $withdrawAmount = min(2000, floor(($solde - 100) / 1000) * 1000);
                    if ($withdrawAmount >= 1000) {
                        $penalite = 100;
                        $transactionDate = $baseDate->copy()->subHours(random_int(13, 18));
                        $newSolde = $solde - $withdrawAmount - $penalite;

                        Transaction::create([
                            'id_carte'   => $client->carte->id_carte,
                            'id_client'  => $client->id_client,
                            'id_agent'   => $agent->id_agent,
                            'id_kiosque' => $agent->id_kiosque,
                            'type_op'    => 'retrait_partiel',
                            'montant'    => $withdrawAmount,
                            'penalite'   => $penalite,
                            'solde_avant'=> $solde,
                            'solde_apres'=> $newSolde,
                            'date_heure' => $transactionDate,
                            'sync_status'=> 'synchronisé',
                        ]);

                        $client->compte->update([
                            'solde_total' => $newSolde,
                            'total_retraits_partiels' => (float) $client->compte->total_retraits_partiels + $withdrawAmount,
                            'total_penalites' => (float) $client->compte->total_penalites + $penalite,
                        ]);

                        $created++;
                        $solde = $newSolde;
                    }
                }

                // 3. Retrait du solde pour quelques clients
                if ($index % 4 === 0 && $solde > 2000) {
                    $transactionDate = $baseDate->copy()->subHours(random_int(19, 23));
                    $withdrawAmount = floor($solde / 1000) * 1000;
                    $newSolde = 0;

                    Transaction::create([
                        'id_carte'   => $client->carte->id_carte,
                        'id_client'  => $client->id_client,
                        'id_agent'   => $agent->id_agent,
                        'id_kiosque' => $agent->id_kiosque,
                        'type_op'    => 'retrait_solde_compte',
                        'montant'    => $withdrawAmount,
                        'penalite'   => 0,
                        'solde_avant'=> $solde,
                        'solde_apres'=> $newSolde,
                        'date_heure' => $transactionDate,
                        'sync_status'=> 'synchronisé',
                    ]);

                    $client->compte->update([
                        'solde_total' => $newSolde,
                        'total_retraits' => (float) $client->compte->total_retraits + $withdrawAmount,
                        'date_cloture' => Carbon::now(),
                    ]);

                    $client->carte->update(['statut' => 'terminé']);
                    $created++;
                }
            }
        });

        $this->command?->info("Transactions de caisse créées : {$created}");
    }
}
