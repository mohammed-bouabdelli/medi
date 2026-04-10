<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalAppointments = Appointment::forPatient($user->id)->count();
        $upcomingAppointments = Appointment::forPatient($user->id)->upcoming()->count();
        $completedAppointments = Appointment::forPatient($user->id)->where('status', 'completed')->count();
        $documentsCount = Document::where('patient_id', $user->id)->count();

        $nextAppointments = Appointment::forPatient($user->id)
            ->upcoming()
            ->with(['doctor.doctorProfile'])
            ->orderBy('date')
            ->orderBy('time')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_appointments' => $totalAppointments,
                'upcoming_appointments' => $upcomingAppointments,
                'completed_appointments' => $completedAppointments,
                'documents_count' => $documentsCount,
            ],
            'next_appointments' => $nextAppointments,
        ]);
    }
}
