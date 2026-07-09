<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class StudentController extends Controller
{
    /**
     * Daftar siswa
     */
    public function index()
    {
        $students = Student::with('schoolClass')
            ->latest()
            ->get();

        return response()->json($students);
    }

    /**
     * Tambah siswa
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nis' => ['required', 'string', 'max:50', 'unique:students,nis'],
            'name' => ['required', 'string', 'max:255'],
            'class_name' => ['required', 'string', 'max:100'],
            'gender' => ['required', Rule::in(['L', 'P'])],
            'birth_place' => ['required', 'string', 'max:100'],
            'birth_date' => ['required', 'date'],
            'address' => ['required', 'string'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:255', 'unique:students,email'],
        ]);

        $schoolClass = SchoolClass::firstOrCreate(
            ['name' => $validated['class_name']],
            [
                'homeroom_teacher' => '-',
                'academic_year' => now()->year . '/' . now()->addYear()->year,
            ]
        );

        $student = Student::create([
            'nis' => $validated['nis'],
            'name' => $validated['name'],
            'gender' => $validated['gender'],
            'birth_place' => $validated['birth_place'],
            'birth_date' => $validated['birth_date'],
            'address' => $validated['address'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'],
            'school_class_id' => $schoolClass->id,
            'is_active' => true,
        ])->load('schoolClass');

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil ditambahkan',
            'data' => $student,
        ], 201);
    }

    /**
     * Generate QR siswa
     */
    public function qr($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan'
            ], 404);
        }

        return response(
            QrCode::format('svg')
                ->size(300)
                ->generate($student->nis)
        )->header(
            'Content-Type',
            'image/svg+xml'
        );
    }
}
