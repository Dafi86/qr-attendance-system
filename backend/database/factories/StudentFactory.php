<?php

namespace Database\Factories;

use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    public function definition(): array
    {
        return [

            'photo' => null,

            'nis' => fake()->unique()->numerify('2026######'),

            'name' => fake()->name(),

            'gender' => fake()->randomElement(['L', 'P']),

            'birth_place' => fake()->city(),

            'birth_date' => fake()->date(),

            'address' => fake()->address(),

            'phone' => fake()->phoneNumber(),

            'email' => fake()->unique()->safeEmail(),

            // 🔥 FIX DI SINI
            'school_class_id' => SchoolClass::query()->inRandomOrder()->value('id'),

            'is_active' => true,
        ];
    }
}
