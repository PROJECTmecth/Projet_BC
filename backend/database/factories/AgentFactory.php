<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AgentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id_user'      => \App\Models\User::factory(),
            'id_kiosque'   => \App\Models\Kiosque::factory(),
            'telephone'    => fake()->phoneNumber(),
            'adresse'      => fake()->address(),
            'statut_ligne' => 'hors_ligne',
        ];
    }
}