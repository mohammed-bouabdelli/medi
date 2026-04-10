<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * List patient's appointments with optional status filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::forPatient($request->user()->id)
            ->with(['doctor.doctorProfile']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($appointments);
    }

    /**
     * Book a new appointment.
     */
    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        // Check for time slot conflict
        $conflict = Appointment::where('doctor_id', $request->doctor_id)
            ->where('date', $request->date)
            ->where('time', $request->time)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Ce créneau est déjà réservé. Veuillez en choisir un autre.',
            ], 422);
        }

        $appointment = Appointment::create([
            'patient_id' => $request->user()->id,
            'doctor_id' => $request->doctor_id,
            'date' => $request->date,
            'time' => $request->time,
            'type' => $request->type,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        $appointment->load(['doctor.doctorProfile']);

        return response()->json([
            'message' => 'Rendez-vous réservé avec succès.',
            'appointment' => $appointment,
        ], 201);
    }

    /**
     * Cancel an appointment.
     */
    public function cancel(Request $request, $id): JsonResponse
    {
        $appointment = Appointment::where('patient_id', $request->user()->id)
            ->where('id', $id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->firstOrFail();

        $appointment->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Rendez-vous annulé.',
            'appointment' => $appointment,
        ]);
    }
}
