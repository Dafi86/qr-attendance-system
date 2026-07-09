<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class Student extends Model
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'photo',
        'nis',
        'name',
        'gender',
        'birth_place',
        'birth_date',
        'address',
        'phone',
        'email',
        'school_class_id',
        'is_active',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
