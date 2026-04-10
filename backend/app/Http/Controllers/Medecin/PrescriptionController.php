<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrescriptionRequest;
use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    /**
     * List doctor's prescriptions.
     */
    public function index(Request $request): JsonResponse
    {
        $prescriptions = Prescription::where('doctor_id', $request->user()->id)
            ->with('patient')
            ->orderBy('date', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($prescriptions);
    }

    /**
     * Create a new prescription.
     */
    public function store(StorePrescriptionRequest $request): JsonResponse
    {
        $prescription = Prescription::create([
            'patient_id' => $request->patient_id,
            'doctor_id' => $request->user()->id,
            'appointment_id' => $request->appointment_id,
            'medications' => $request->medications,
            'status' => 'active',
            'date' => now()->toDateString(),
        ]);

        $prescription->load('patient');

        return response()->json([
            'message' => 'Ordonnance créée avec succès.',
            'prescription' => $prescription,
        ], 201);
    }

    /**
     * Download prescription as text/pdf file.
     */
    public function download(Request $request, $id)
    {
        $prescription = Prescription::with(['patient', 'doctor'])
            ->findOrFail($id);
            
        // Security check
        if ($request->user()->id !== $prescription->doctor_id && $request->user()->id !== $prescription->patient_id) {
             abort(403);
        }

        $content = "ORDONNANCE MEDICALE\n";
        $content .= "--------------------\n";
        $content .= "Date: " . $prescription->date->format('d/m/Y') . "\n";
        $content .= "Médecin: Dr. " . $prescription->doctor->last_name . "\n";
        $content .= "Patient: " . $prescription->patient->first_name . " " . $prescription->patient->last_name . "\n\n";
        $content .= "MEDICAMENTS:\n";
        $content .= $prescription->medications . "\n\n";
        $content .= "--------------------\n";
        $content .= "Medi Platform - Votre santé simplifiée";

        $filename = "ordonnance-" . $prescription->id . ".txt";
        
        return response($content)
            ->withHeaders([
                'Content-Type' => 'text/plain',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
    }
}
