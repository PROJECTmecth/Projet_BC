<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Supprimer l'admin existant s'il y a
        User::where('role', 'admin')->delete();

        // Créer un nouvel admin
        User::create([
            'name'     => 'admin',
            'email'    => 'admin@bombacash.com',
            'password' => Hash::make('Admin@123456'),
            'role'     => 'admin',
            'statut'   => 'actif',
            'email_verified_at' => now(),
        ]);
    }
}
