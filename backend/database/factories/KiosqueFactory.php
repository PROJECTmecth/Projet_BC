<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class KiosqueFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code_kiosque'   => 'KSQ-' . fake()->unique()->numberBetween(1000, 9999),
            'nom_kiosque'    => fake()->company(),
            'adresse'        => fake()->address(),
            'ville'          => fake()->city(),
            'telephone'      => fake()->phoneNumber(),
            'statut_service' => 'actif',
        ];
    }
}