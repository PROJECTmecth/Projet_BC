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
        User::firstOrCreate(
            ['email' => 'admin@bomba.com'],
            [
                'name'     => 'admin',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
                'statut'   => 'actif',
            ]
        );

        $this->call([
            AgentTestSeeder::class,
            TestClientsSeeder::class,
            MouvementCaisseSeeder::class,
        ]);
    }
}