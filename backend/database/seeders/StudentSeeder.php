<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $schoolClassId = SchoolClass::query()->value('id');

        if ($schoolClassId) {
            Student::updateOrCreate(
                ['nis' => '2026001'],
                [
                    'photo' => null,
                    'name' => 'Siswa Demo',
                    'gender' => 'L',
                    'birth_place' => 'Lamongan',
                    'birth_date' => '2010-01-01',
                    'address' => 'MTs Sunan Drajat Sugiwaras',
                    'phone' => '080000000001',
                    'email' => 'siswa.demo@school.test',
                    'school_class_id' => $schoolClassId,
                    'is_active' => true,
                ]
            );
        }

        Student::factory()->count(200)->create();
    }
}
