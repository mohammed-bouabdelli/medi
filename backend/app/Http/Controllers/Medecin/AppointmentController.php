<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Prescription;
use App\Models\Document;
use App\Notifications\AppointmentConfirmedNotification;
use App\Notifications\AppointmentCancelledNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $appointment->load(['patient', 'doctor']);

        // Notify Patient
        $appointment->patient->notify(new AppointmentConfirmedNotification($appointment));

        return response()->json([
            'message' => 'Rendez-vous confirmé.',
            'appointment' => $appointment,
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
        $appointment->load(['patient', 'doctor']);

        // Notify Patient
        $appointment->patient->notify(new AppointmentCancelledNotification($appointment, 'medecin'));

        return response()->json([
            'message' => 'Rendez-vous refusé.',
            'appointment' => $appointment,
        ]);
    }

    /**
     * Mark an appointment as completed and generate documents.
     */
    public function complete(Request $request, $id): JsonResponse
    {
        $request->validate([
            'medications' => 'required|string|max:2000',
            'certificate_content' => 'required|string|max:2000',
        ]);

        $appointment = Appointment::where('doctor_id', $request->user()->id)
            ->where('id', $id)
            ->where('status', 'confirmed')
            ->firstOrFail();

        return DB::transaction(function () use ($appointment, $request) {
            // 1. Update Appointment status
            $appointment->update(['status' => 'completed']);

            // 2. Create Prescription
            $prescription = Prescription::create([
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'appointment_id' => $appointment->id,
                'medications' => $request->medications,
                'status' => 'active',
                'date' => now()->toDateString(),
            ]);

            // 3. Create Document: Certificat
            Document::create([
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'appointment_id' => $appointment->id,
                'title' => 'Certificat Médical - ' . now()->format('d/m/Y'),
                'type' => 'certificat',
                'content' => $request->certificate_content,
                'date' => now(),
            ]);

            // 4. Create Document: Ordonnance (for unified document view)
            Document::create([
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'appointment_id' => $appointment->id,
                'title' => 'Ordonnance - ' . now()->format('d/m/Y'),
                'type' => 'ordonnance',
                'content' => $request->medications,
                'date' => now(),
            ]);

            $appointment->load(['patient', 'doctor', 'prescription']);

            // Notify Patient
            $appointment->patient->notify(new AppointmentConfirmedNotification($appointment));

            return response()->json([
                'message' => 'Rendez-vous terminé et documents générés.',
                'appointment' => $appointment,
            ]);
        });
    }
}
