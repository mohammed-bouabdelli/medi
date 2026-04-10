<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * List doctor's appointments.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::forDoctor($request->user()->id)
            ->with('patient');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($appointments);
    }

    /**
     * Confirm a pending appointment.
     */
    public function confirm(Request $request, $id): JsonResponse
    {
        $appointment = Appointment::where('doctor_id', $request->user()->id)
            ->where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        $appointment->update(['status' => 'confirmed']);

        return response()->json([
            'message' => 'Rendez-vous confirmé.',
            'appointment' => $appointment->load('patient'),
        ]);
    }

    /**
     * Reject/cancel a pending appointment.
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $appointment = Appointment::where('doctor_id', $request->user()->id)
            ->where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        $appointment->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Rendez-vous refusé.',
            'appointment' => $appointment->load('patient'),
        ]);
    }
}
