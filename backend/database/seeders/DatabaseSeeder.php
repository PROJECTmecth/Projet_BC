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
    }
}