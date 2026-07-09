<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Riwayat absensi
     */
    public function index()
    {
        $attendance = Attendance::with('student')
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $attendance
        ]);
    }

    /**
     * Scan QR
     */
    public function scan(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string'
        ]);

        // QR berisi NIS siswa
        $student = Student::where('nis', $request->qr_code)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan'
            ], 404);
        }

        $today = Carbon::today();

        $attendance = Attendance::where('student_id', $student->id)
            ->whereDate('date', $today)
            ->first();

        /**
         * BELUM ABSEN
         */
        if (!$attendance) {

            $attendance = Attendance::create([
                'student_id' => $student->id,
                'date' => $today,
                'check_in_time' => now()->format('H:i:s'),
                'status' => 'present',
            ]);

            return response()->json([
                'success' => true,
                'type' => 'checkin',
                'message' => 'Absen masuk berhasil',
                'student' => $student,
                'attendance' => $attendance,
            ]);
        }

        /**
         * SUDAH MASUK BELUM PULANG
         */
        if ($attendance->check_out_time === null) {

            $attendance->update([
                'check_out_time' => now()->format('H:i:s')
            ]);

            return response()->json([
                'success' => true,
                'type' => 'checkout',
                'message' => 'Absen pulang berhasil',
                'student' => $student,
                'attendance' => $attendance,
            ]);
        }

        /**
         * SUDAH ABSEN
         */
        return response()->json([
            'success' => false,
            'message' => 'Siswa sudah melakukan absensi hari ini'
        ], 400);
    }
}
