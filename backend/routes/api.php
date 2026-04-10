<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\Patient;
use App\Http\Controllers\Medecin;
use App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/doctors', [PublicController::class, 'doctors']);
Route::get('/doctors/{id}', [PublicController::class, 'doctor']);
Route::get('/doctors/{id}/time-slots', [PublicController::class, 'timeSlots']);
Route::get('/stats', [PublicController::class, 'stats']);
Route::post('/contact', [PublicController::class, 'contact']);

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/password', [AuthController::class, 'changePassword']);
        Route::delete('/account', [AuthController::class, 'deleteAccount']);
    });
});

/*
|--------------------------------------------------------------------------
| Patient Routes
|--------------------------------------------------------------------------
*/
Route::prefix('patient')
    ->middleware(['auth:sanctum', 'role:patient'])
    ->group(function () {
        Route::get('/dashboard', [Patient\DashboardController::class, 'index']);

        Route::get('/appointments', [Patient\AppointmentController::class, 'index']);
        Route::post('/appointments', [Patient\AppointmentController::class, 'store']);
        Route::patch('/appointments/{id}/cancel', [Patient\AppointmentController::class, 'cancel']);

        Route::get('/documents', [Patient\DocumentController::class, 'index']);
        Route::post('/documents', [Patient\DocumentController::class, 'store']);
        Route::get('/documents/{id}', [Patient\DocumentController::class, 'show']);
        Route::get('/documents/{id}/download', [Patient\DocumentController::class, 'download']);

        Route::get('/profile', [Patient\ProfileController::class, 'show']);
        Route::put('/profile', [Patient\ProfileController::class, 'update']);
        Route::post('/profile/avatar', [Patient\ProfileController::class, 'updateAvatar']);
    });

/*
|--------------------------------------------------------------------------
| Médecin Routes
|--------------------------------------------------------------------------
*/
Route::prefix('medecin')
    ->middleware(['auth:sanctum', 'role:medecin'])
    ->group(function () {
        Route::get('/dashboard', [Medecin\DashboardController::class, 'index']);

        Route::get('/appointments', [Medecin\AppointmentController::class, 'index']);
        Route::patch('/appointments/{id}/confirm', [Medecin\AppointmentController::class, 'confirm']);
        Route::patch('/appointments/{id}/reject', [Medecin\AppointmentController::class, 'reject']);

        Route::get('/patients', [Medecin\PatientController::class, 'index']);
        Route::get('/patients/{id}', [Medecin\PatientController::class, 'show']);

        Route::get('/prescriptions', [Medecin\PrescriptionController::class, 'index']);
        Route::post('/prescriptions', [Medecin\PrescriptionController::class, 'store']);
        Route::get('/prescriptions/{id}/download', [Medecin\PrescriptionController::class, 'download']);

        Route::get('/schedule', [Medecin\ScheduleController::class, 'index']);
        Route::post('/schedule', [Medecin\ScheduleController::class, 'store']);
        Route::delete('/schedule/{id}', [Medecin\ScheduleController::class, 'destroy']);
        Route::patch('/schedule/{id}/toggle', [Medecin\ScheduleController::class, 'toggle']);

        Route::get('/profile', [Medecin\ProfileController::class, 'show']);
        Route::put('/profile', [Medecin\ProfileController::class, 'update']);
        Route::post('/profile/avatar', [Medecin\ProfileController::class, 'updateAvatar']);
    });

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::prefix('admin')
    ->middleware(['auth:sanctum', 'role:admin'])
    ->group(function () {
        Route::get('/dashboard', [Admin\DashboardController::class, 'index']);

        Route::get('/users', [Admin\UserController::class, 'index']);
        Route::post('/users', [Admin\UserController::class, 'store']);
        Route::patch('/users/{id}/toggle-status', [Admin\UserController::class, 'toggleStatus']);
        Route::delete('/users/{id}', [Admin\UserController::class, 'destroy']);

        Route::get('/doctors', [Admin\DoctorController::class, 'index']);
        Route::patch('/doctors/{id}/approve', [Admin\DoctorController::class, 'approve']);
        Route::patch('/doctors/{id}/reject', [Admin\DoctorController::class, 'reject']);
        Route::delete('/doctors/{id}', [Admin\DoctorController::class, 'destroy']);

        Route::get('/appointments', [Admin\AppointmentController::class, 'index']);
        Route::delete('/appointments/{id}', [Admin\AppointmentController::class, 'destroy']);

        Route::get('/reports', [Admin\ReportController::class, 'index']);

        Route::get('/profile', [Admin\ProfileController::class, 'show']);
        Route::put('/profile', [Admin\ProfileController::class, 'update']);
        Route::post('/profile/avatar', [Admin\ProfileController::class, 'updateAvatar']);
    });
