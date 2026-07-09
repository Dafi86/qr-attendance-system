<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\SchoolClassSeeder;
use Database\Seeders\StudentSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            SchoolClassSeeder::class,
            StudentSeeder::class,
        ]);
    }
}
