<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SchoolClassFactory extends Factory
{
    public function definition(): array
    {
        $kelas = [
            'X RPL 1',
            'X RPL 2',
            'XI RPL 1',
            'XI RPL 2',
            'XII RPL 1',
            'XII RPL 2',
            'X TKJ 1',
            'XI TKJ 1',
            'XII TKJ 1',
            'X MM 1',
        ];

        return [
            'name' => fake()->unique()->randomElement($kelas),
            'homeroom_teacher' => fake()->name(),
            'academic_year' => '2026/2027',
        ];
    }
}
