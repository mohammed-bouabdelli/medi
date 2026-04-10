<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoctorProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    /**
     * List all doctors with search and status filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'medecin')
            ->with('doctorProfile');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhereHas('doctorProfile', function ($q2) use ($search) {
                      $q2->where('specialty', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->whereHas('doctorProfile', function ($q) use ($request) {
                $q->where('verification_status', $request->status);
            });
        }

        $doctors = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($doctors);
    }

    /**
     * Approve (verify) a doctor.
     */
    public function approve($id): JsonResponse
    {
        $doctor = User::where('role', 'medecin')->findOrFail($id);
        $doctor->doctorProfile->update(['verification_status' => 'verified']);

        return response()->json([
            'message' => 'Médecin approuvé.',
            'doctor' => $doctor->load('doctorProfile'),
        ]);
    }

    /**
     * Reject a doctor.
     */
    public function reject($id): JsonResponse
    {
        $doctor = User::where('role', 'medecin')->findOrFail($id);
        $doctor->doctorProfile->update(['verification_status' => 'rejected']);

        return response()->json([
            'message' => 'Médecin refusé.',
        ]);
    }

    /**
     * Delete a doctor.
     */
    public function destroy($id): JsonResponse
    {
        $doctor = User::where('role', 'medecin')->findOrFail($id);
        $doctor->delete();

        return response()->json(['message' => 'Médecin supprimé.']);
    }
}
