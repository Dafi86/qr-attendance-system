<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SchoolClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'homeroom_teacher',
        'academic_year',
    ];

    public function students()
    {
        return $this->hasMany(Student::class);
    }
}
