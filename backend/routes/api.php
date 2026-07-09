<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StudentController;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/student-login', [AuthController::class, 'studentLogin']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/student-dashboard', [AuthController::class, 'studentDashboard'])
            ->middleware('abilities:student');

        Route::middleware('abilities:admin')->group(function () {
            Route::get('/announcements', [AnnouncementController::class, 'index']);
            Route::post('/announcements', [AnnouncementController::class, 'store']);
            Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);

            Route::get('/dashboard', [DashboardController::class, 'index']);
            Route::get('/students', [StudentController::class, 'index']);
            Route::post('/students', [StudentController::class, 'store']);
            Route::get('/students/{id}/qr', [StudentController::class, 'qr']);

            Route::post('/attendance/scan', [AttendanceController::class, 'scan']);
            Route::get('/attendance', [AttendanceController::class, 'index']);
        });
    });
});

