<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        $totalStudents = Student::count();

        $presentToday = Attendance::whereDate(
            'date',
            $today
        )->count();

        $checkedOut = Attendance::whereDate(
            'date',
            $today
        )->whereNotNull('check_out_time')
            ->count();

        $absent = $totalStudents - $presentToday;

        $recentAttendance = Attendance::with('student')
            ->whereDate('date', $today)
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'success' => true,
            'statistics' => [
                'total_students' => $totalStudents,
                'present_today' => $presentToday,
                'checked_out' => $checkedOut,
                'absent' => $absent,
            ],
            'recent_attendance' => $recentAttendance,
        ]);
    }
}
