<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Agent;
use App\Models\Kiosque;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AgentTestSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Créer ou récupérer le User agent
        $userAgent = User::firstOrCreate(
            ['email' => 'agent@test.com'],
            [
                'name'     => 'agent_test',
                'password' => Hash::make('Agent@123456'),
                'role'     => 'agent',
                'statut'   => 'actif',
            ]
        );

        // 2. Créer ou récupérer le Kiosque test
        $kiosque = Kiosque::firstOrCreate(
            ['code_kiosque' => 'KIOSK-TEST'],
            [
                'nom_kiosque' => 'Kiosque Test',
                'adresse'      => 'Test Street',
                'ville'        => 'Yaoundé',
                'telephone'    => '123456789',
            ]
        );

        // 3. Créer ou récupérer l'Agent lié au User et au kiosque
        Agent::firstOrCreate(
            ['id_user' => $userAgent->id],
            [
                'id_kiosque'   => $kiosque->id_kiosque,
                'telephone'    => '+242060000000',
                'adresse'      => 'Test Street',
                'statut_ligne' => 'en_ligne',
            ]
        );
    }
}
