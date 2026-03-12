<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Connexion via le champ "name" (nom d'utilisateur court)
     *
     * Lancer : php artisan migrate:fresh --seed
     */
    public function run(): void
    {
        User::factory()->create([
            'name'     => 'admin',
            'email'    => 'admin@bomba.com',
            'password' => Hash::make('admin123'),
            'role'     => 'admin',
            'statut'   => 'actif',
        ]);

        User::factory()->create([
            'name'     => 'agent',
            'email'    => 'agent@bomba.com',
            'password' => Hash::make('agent123'),
            'role'     => 'agent',
            'statut'   => 'actif',
        ]);

        User::factory()->create([
            'name'     => 'mabala',
            'email'    => 'mabala@bomba.com',
            'password' => Hash::make('mabala123'),
            'role'     => 'agent',
            'statut'   => 'actif',
        ]);
    }
}