<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $doctorId = $request->user()->id;
        $today = now()->toDateString();

        $todayAppointments = Appointment::forDoctor($doctorId)
            ->where('date', $today)
            ->with('patient')
            ->orderBy('time')
            ->get();

        $totalAppointments = Appointment::forDoctor($doctorId)->count();

        $totalPatients = Appointment::forDoctor($doctorId)
            ->distinct('patient_id')
            ->count('patient_id');

        $pendingCount = Appointment::forDoctor($doctorId)
            ->where('status', 'pending')
            ->count();

        $monthlyPrescriptions = Prescription::where('doctor_id', $doctorId)
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->count();

        return response()->json([
            'stats' => [
                'total_appointments' => $totalAppointments,
                'today_appointments' => $todayAppointments->count(),
                'total_patients' => $totalPatients,
                'pending_count' => $pendingCount,
                'monthly_prescriptions' => $monthlyPrescriptions,
            ],
            'today_appointments' => $todayAppointments,
        ]);
    }
}
