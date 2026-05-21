<?php

namespace Database\Factories;

use App\Models\Cour;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourFactory extends Factory
{
    public function definition(): array
    {
        return [
            'titre' => $this->faker->sentence(3),
            'slug' => $this->faker->slug(),
            'description' => $this->faker->paragraph(),
            'image_couverture' => null,
            'organisation_id' => 1,
            'prof_id' => User::factory(),
            'statut' => 'brouillon',
            'type_planification' => 'flexible',
        ];
    }
}
