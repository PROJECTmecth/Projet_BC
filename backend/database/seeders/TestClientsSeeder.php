<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Carte;
use App\Models\Client;
use App\Models\Compte;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TestClientsSeeder extends Seeder
{
    public function run(): void
    {
        $agent = Agent::first();

        if (! $agent) {
            $this->command?->error('Aucun agent disponible pour rattacher les clients.');
            return;
        }

        $clients = [
            ['Homme', 'Mabiala', 'Junior', 'Commercant'],
            ['Femme', 'Nkodia', 'Sarah', 'Menagere'],
            ['Homme', 'Makosso', 'David', 'Travailleurs'],
            ['Femme', 'Bouesso', 'Grace', 'Etudiants'],
            ['Homme', 'Ngoma', 'Arnaud', 'Commercant'],
            ['Femme', 'Massamba', 'Laetitia', 'Coiffeuse'],
            ['Homme', 'Kimbembe', 'Patrick', 'Chauffeur'],
            ['Femme', 'Moukoko', 'Esther', 'Vendeuse'],
            ['Homme', 'Okemba', 'Christian', 'Menuisier'],
            ['Femme', 'Tchibinda', 'Arielle', 'Restauratrice'],
            ['Homme', 'Mavoungou', 'Kevin', 'Etudiants'],
            ['Femme', 'Bikouta', 'Nadine', 'Commercant'],
            ['Homme', 'Itsouhou', 'Yannick', 'Travailleurs'],
            ['Femme', 'Loubaki', 'Mireille', 'Couturiere'],
            ['Homme', 'Nsilou', 'Alain', 'Agent mobile money'],
            ['Femme', 'Mpassi', 'Chancelle', 'Vendeuse'],
            ['Homme', 'Koumba', 'Franck', 'Commercant'],
            ['Femme', 'Ngatse', 'Diane', 'Etudiants'],
            ['Homme', 'Bemba', 'Herve', 'Travailleurs'],
            ['Femme', 'Milandou', 'Sylvie', 'Menagere'],
        ];

        $created = 0;

        DB::transaction(function () use ($agent, $clients, &$created): void {
            foreach ($clients as $index => [$genre, $nom, $prenom, $activite]) {
                $number = $index + 1;
                $suffix = now()->format('ymdHis') . str_pad((string) $number, 2, '0', STR_PAD_LEFT);
                $activation = now()->subDays(random_int(1, 25));
                $duree = $number % 2 === 0 ? '30 jours' : '15 jours';
                $expiration = $activation->copy()->addDays($duree === '30 jours' ? 30 : 15);
                $solde = random_int(10, 90) * 1000;
                $frais = $duree === '30 jours' ? 1000 : 500;

                $client = Client::create([
                    'genre' => $genre,
                    'nom' => $nom,
                    'prenom' => $prenom,
                    'adresse' => 'Avenue Test ' . $number,
                    'ville' => $number % 3 === 0 ? 'Pointe-Noire' : 'Brazzaville',
                    'activite' => $activite,
                    'nationalite' => $number % 5 === 0 ? 'Etranger' : 'Resident',
                    'type_piece' => ['CNI', 'NIU', 'Passeport', 'Permis'][$index % 4],
                    'num_piece' => 'TEST-' . $suffix,
                    'telephone' => '+24206' . str_pad((string) (1000000 + $number), 7, '0', STR_PAD_LEFT),
                    'id_agent' => $agent->id_agent,
                    'id_user' => $agent->id_user,
                    'created_at' => $activation,
                ]);

                Carte::create([
                    'id_client' => $client->id_client,
                    'id_agent' => $agent->id_agent,
                    'id_kiosque' => $agent->id_kiosque,
                    'numero_carte' => 'BC-' . str_pad((string) $client->id_client, 6, '0', STR_PAD_LEFT),
                    'qr_code_uid' => (string) Str::uuid(),
                    'statut' => 'actif',
                    'duree' => $duree,
                    'montant_initial' => $solde,
                    'frais_garde' => $frais,
                    'progression' => random_int(10, 95),
                    'date_creation' => $activation->toDateString(),
                    'date_activation' => $activation->toDateString(),
                    'date_expiration' => $expiration->toDateString(),
                    'reset_date' => now()->toDateString(),
                ]);

                Compte::create([
                    'id_client' => $client->id_client,
                    'solde_total' => $solde,
                    'total_depots' => $solde + $frais,
                    'total_retraits' => 0,
                    'total_retraits_partiels' => 0,
                    'total_penalites' => 0,
                    'total_frais_garde' => $frais,
                    'devise' => 'XAF',
                    'date_ouverture' => $activation,
                ]);

                $created++;
            }
        });

        $this->command?->info("Clients de test crees: {$created}");
    }
}
