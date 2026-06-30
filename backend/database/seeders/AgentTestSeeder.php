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
        // 1. Créer User agent
        $userAgent = User::create([
            'name'     => 'agent_test',
            'email'    => 'agent@test.com',
            'password' => Hash::make('Agent@123456'),
            'role'     => 'agent',
            'statut'   => 'actif',
        ]);

        // 2. Créer Kiosque test
        $kiosque = Kiosque::create([
            'code_kiosque' => 'KIOSK-TEST',
            'nom_kiosque'  => 'Kiosque Test',
            'adresse'      => 'Test Street',
            'ville'        => 'Yaoundé',
            'telephone'    => '123456789',
        ]);

        // 3. Créer Agent lié au User
        Agent::create([
            'id_user'      => $userAgent->id,
            'id_kiosque'   => $kiosque->id_kiosque,
            'nom'          => 'Test',
            'prenom'       => 'Agent',
            'statut'       => 'actif',
        ]);
    }
}
