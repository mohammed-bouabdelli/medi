<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    /**
     * List patients who have appointments with this doctor.
     */
    public function index(Request $request): JsonResponse
    {
        $doctorId = $request->user()->id;

        $patientIds = Appointment::where('doctor_id', $doctorId)
            ->distinct()
            ->pluck('patient_id');

        $query = User::whereIn('id', $patientIds);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $patients = $query->get()->map(function ($patient) use ($doctorId) {
            $appointments = Appointment::where('doctor_id', $doctorId)
                ->where('patient_id', $patient->id);

            $patient->visits_count = $appointments->count();
            $patient->last_visit = $appointments->latest('date')->first()?->date;

            return $patient;
        });

        return response()->json(['patients' => $patients]);
    }

    /**
     * View a single patient's details.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $doctorId = $request->user()->id;

        // Ensure this patient has visited this doctor
        $hasVisited = Appointment::where('doctor_id', $doctorId)
            ->where('patient_id', $id)
            ->exists();

        if (!$hasVisited) {
            return response()->json(['message' => 'Patient non trouvé.'], 404);
        }

        $patient = User::findOrFail($id);

        $appointments = Appointment::where('doctor_id', $doctorId)
            ->where('patient_id', $id)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json([
            'patient' => $patient,
            'appointments' => $appointments,
        ]);
    }
}
