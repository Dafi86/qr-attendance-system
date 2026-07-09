<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * LOGIN ADMIN
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah'
            ], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login admin berhasil',
            'data' => [
                'account_type' => 'admin',
                'user' => $user,
                'token' => $token,
            ]
        ]);
    }

    /**
     * LOGIN SISWA
     * Nama dipakai sebagai username, NIS dipakai sebagai password.
     */
    public function studentLogin(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'nis' => ['required', 'string'],
        ]);

        $student = Student::with('schoolClass')
            ->where('nis', $validated['nis'])
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($validated['name']))])
            ->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Nama atau NIS siswa tidak sesuai'
            ], 401);
        }

        if (!$student->is_active) {
            throw ValidationException::withMessages([
                'name' => ['Akun siswa sedang nonaktif. Hubungi admin sekolah.'],
            ]);
        }

        $student->tokens()->delete();
        $token = $student->createToken('student_token', ['student'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login siswa berhasil',
            'data' => [
                'account_type' => 'student',
                'student' => $student,
                'token' => $token,
            ]
        ]);
    }

    /**
     * USER LOGIN
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if ($user instanceof Student) {
            $user->load('schoolClass');
        }

        return response()->json([
            'success' => true,
            'account_type' => $user instanceof Student ? 'student' : 'admin',
            'data' => $user,
        ]);
    }

    public function studentDashboard(Request $request)
    {
        $student = $request->user();

        if (!$student instanceof Student) {
            return response()->json([
                'success' => false,
                'message' => 'Dashboard ini hanya untuk akun siswa.'
            ], 403);
        }

        $student->load('schoolClass');

        $today = Carbon::today();
        $todayAttendance = Attendance::where('student_id', $student->id)
            ->whereDate('date', $today)
            ->first();

        $history = Attendance::where('student_id', $student->id)
            ->latest('date')
            ->limit(15)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'student' => $student,
                'today_attendance' => $todayAttendance,
                'attendance_history' => $history,
                'announcements' => $this->announcementData(),
                'school' => [
                    'name' => 'MTs Sunan Drajat Sugiwaras',
                    'description' => 'Sistem absensi digital untuk memantau kehadiran siswa secara cepat dan transparan.',
                ],
            ],
        ]);
    }

    public function announcements()
    {
        return response()->json([
            'success' => true,
            'data' => $this->announcementData(),
        ]);
    }

    /**
     * LOGOUT
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    private function announcementData(): array
    {
        $fallback = [
            [
                'id' => 'default-1',
                'title' => 'Gunakan QR resmi siswa',
                'message' => 'Scan absensi hanya memakai QR yang dibuat oleh admin sekolah.',
                'published_at' => now()->toISOString(),
            ],
            [
                'id' => 'default-2',
                'title' => 'Cek riwayat absensi',
                'message' => 'Siswa dapat memantau status masuk dan pulang melalui akun masing-masing.',
                'published_at' => now()->toISOString(),
            ],
        ];

        if (!Schema::hasTable('announcements')) {
            return $fallback;
        }

        $announcements = Announcement::query()
            ->where('is_active', true)
            ->latest('published_at')
            ->latest()
            ->limit(20)
            ->get()
            ->toArray();

        return $announcements ?: $fallback;
    }
}


