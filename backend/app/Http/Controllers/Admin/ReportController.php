<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\DoctorProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function index(): JsonResponse
    {
        // Monthly appointment data (last 6 months)
        $monthlyData = collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i);
            return [
                'month' => $date->translatedFormat('M'),
                'rdv' => Appointment::whereMonth('date', $date->month)
                    ->whereYear('date', $date->year)
                    ->count(),
            ];
        })->values();

        // Appointments by specialty
        $specialtyData = DoctorProfile::select('specialty')
            ->selectRaw('(SELECT COUNT(*) FROM appointments WHERE appointments.doctor_id = doctor_profiles.user_id) as appointment_count')
            ->orderByDesc('appointment_count')
            ->take(5)
            ->get()
            ->map(fn($d) => [
                'name' => $d->specialty,
                'value' => $d->appointment_count,
            ]);

        // Stats
        $monthlyAppointments = Appointment::whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->count();

        $newPatients = User::where('role', 'patient')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $avgRating = DoctorProfile::avg('rating');

        return response()->json([
            'stats' => [
                'monthly_appointments' => $monthlyAppointments,
                'new_patients' => $newPatients,
                'satisfaction_rate' => $avgRating ? round($avgRating / 5 * 100) . '%' : 'N/A',
            ],
            'monthly_data' => $monthlyData,
            'specialty_data' => $specialtyData,
        ]);
    }
}
