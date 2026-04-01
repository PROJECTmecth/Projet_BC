<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Agent;
use App\Models\Kiosque;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->create([
            'name'     => 'admin',
            'email'    => 'admin@bomba.com',
            'password' => Hash::make('admin123'),
            'role'     => 'admin',
            'statut'   => 'actif',
        ]);

        $kiosque1 = Kiosque::create([
            'code_kiosque'   => 'KBC-01-MGI',
            'nom_kiosque'    => 'Kiosque Moungali',
            'adresse'        => '25 rue MAKOTIPOKO',
            'ville'          => 'Moungali',
            'telephone'      => '06 888 45 45',
            'statut_service' => 'actif',
        ]);

        $kiosque2 = Kiosque::create([
            'code_kiosque'   => 'KBC-02-BCZ',
            'nom_kiosque'    => 'Kiosque Bacongo',
            'adresse'        => '12 avenue de la Paix',
            'ville'          => 'Bacongo',
            'telephone'      => '06 777 32 32',
            'statut_service' => 'actif',
        ]);

        $userAgent = User::factory()->create([
            'name'     => 'agent',
            'email'    => 'agent@bomba.com',
            'password' => Hash::make('agent123'),
            'role'     => 'agent',
            'statut'   => 'actif',
        ]);

        Agent::create([
            'id_user'      => $userAgent->id,
            'id_kiosque'   => $kiosque1->id_kiosque,
            'telephone'    => '06 888 45 45',
            'adresse'      => '25 rue MAKOTIPOKO, Moungali',
            'statut_ligne' => 'en_ligne',
        ]);

        $userMabala = User::factory()->create([
            'name'     => 'mabala',
            'email'    => 'mabala@bomba.com',
            'password' => Hash::make('mabala123'),
            'role'     => 'agent',
            'statut'   => 'actif',
        ]);

        Agent::create([
            'id_user'      => $userMabala->id,
            'id_kiosque'   => $kiosque2->id_kiosque,
            'telephone'    => '06 777 32 32',
            'adresse'      => '12 avenue de la Paix, Bacongo',
            'statut_ligne' => 'hors_ligne',
        ]);
    }
}