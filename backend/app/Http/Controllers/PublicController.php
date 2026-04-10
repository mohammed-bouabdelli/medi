<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Models\Appointment;
use App\Models\ContactMessage;
use App\Models\DoctorProfile;
use App\Models\Schedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    /**
     * List doctors with search & filter.
     */
    public function doctors(Request $request): JsonResponse
    {
        $query = User::where('role', 'medecin')
            ->where('status', 'active')
            ->whereHas('doctorProfile', function ($q) {
                $q->where('verification_status', 'verified');
            })
            ->with('doctorProfile');

        // Search by name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        // Filter by specialty
        if ($request->filled('specialty')) {
            $query->whereHas('doctorProfile', function ($q) use ($request) {
                $q->where('specialty', $request->specialty);
            });
        }

        // Filter by location
        if ($request->filled('location')) {
            $query->whereHas('doctorProfile', function ($q) use ($request) {
                $q->where('location', 'like', "%{$request->location}%");
            });
        }

        $doctors = $query->paginate($request->per_page ?? 12);

        return response()->json($doctors);
    }

    /**
     * Get single doctor details.
     */
    public function doctor($id): JsonResponse
    {
        $doctor = User::where('role', 'medecin')
            ->with(['doctorProfile', 'schedules' => function ($q) {
                $q->where('is_active', true);
            }])
            ->findOrFail($id);

        return response()->json(['doctor' => $doctor]);
    }

    /**
     * Get available time slots for a doctor on a given date.
     */
    public function timeSlots(Request $request, $id): JsonResponse
    {
        $request->validate(['date' => 'required|date']);

        $doctor = User::where('role', 'medecin')->findOrFail($id);
        $date = Carbon::parse($request->date);

        // Map Carbon dayOfWeekIso to French day names
        $dayMap = [1 => 'Lundi', 2 => 'Mardi', 3 => 'Mercredi', 4 => 'Jeudi', 5 => 'Vendredi', 6 => 'Samedi', 7 => 'Dimanche'];
        $dayName = $dayMap[$date->dayOfWeekIso];

        // Get schedule slots for this day
        $schedules = Schedule::where('doctor_id', $id)
            ->where('day_of_week', $dayName)
            ->where('is_active', true)
            ->get();

        // Get already booked times for this date
        $bookedTimes = Appointment::where('doctor_id', $id)
            ->where('date', $date->toDateString())
            ->whereIn('status', ['pending', 'confirmed'])
            ->pluck('time')
            ->map(fn($t) => Carbon::parse($t)->format('H:i'))
            ->toArray();

        // Generate 30-min slots from each schedule block
        $slots = [];
        foreach ($schedules as $schedule) {
            $start = Carbon::parse($schedule->start_time);
            $end = Carbon::parse($schedule->end_time);

            while ($start->lt($end)) {
                $timeStr = $start->format('H:i');
                $slots[] = [
                    'time' => $timeStr,
                    'available' => !in_array($timeStr, $bookedTimes),
                ];
                $start->addMinutes(30);
            }
        }

        return response()->json(['slots' => $slots, 'date' => $date->toDateString()]);
    }

    /**
     * Landing page stats.
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'doctors_count' => User::where('role', 'medecin')->where('status', 'active')->count(),
            'patients_count' => User::where('role', 'patient')->count(),
            'appointments_count' => Appointment::count(),
            'average_rating' => DoctorProfile::avg('rating') ?? 0,
        ]);
    }

    /**
     * Submit contact form.
     */
    public function contact(ContactRequest $request): JsonResponse
    {
        ContactMessage::create($request->validated());

        return response()->json([
            'message' => 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        ], 201);
    }
}
