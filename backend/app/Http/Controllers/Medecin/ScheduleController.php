<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScheduleRequest;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    /**
     * Get doctor's weekly schedule.
     */
    public function index(Request $request): JsonResponse
    {
        $days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        $doctorId = $request->user()->id;

        $schedules = Schedule::where('doctor_id', $doctorId)->get();

        $weekSchedule = collect($days)->map(function ($day) use ($schedules) {
            $daySlots = $schedules->where('day_of_week', $day);
            return [
                'day' => $day,
                'active' => $daySlots->contains('is_active', true),
                'slots' => $daySlots->map(function ($s) {
                    return [
                        'id' => $s->id,
                        'start_time' => substr($s->start_time, 0, 5),
                        'end_time' => substr($s->end_time, 0, 5),
                        'is_active' => $s->is_active,
                    ];
                })->values(),
            ];
        });

        return response()->json(['schedule' => $weekSchedule]);
    }

    /**
     * Add a new time slot.
     */
    public function store(StoreScheduleRequest $request): JsonResponse
    {
        $schedule = Schedule::create([
            'doctor_id' => $request->user()->id,
            'day_of_week' => $request->day_of_week,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Créneau ajouté.',
            'slot' => $schedule,
        ], 201);
    }

    /**
     * Remove a time slot.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $schedule = Schedule::where('doctor_id', $request->user()->id)
            ->findOrFail($id);

        $schedule->delete();

        return response()->json(['message' => 'Créneau supprimé.']);
    }

    /**
     * Toggle a slot's active status.
     */
    public function toggle(Request $request, $id): JsonResponse
    {
        $schedule = Schedule::where('doctor_id', $request->user()->id)
            ->findOrFail($id);

        $schedule->update(['is_active' => !$schedule->is_active]);

        return response()->json([
            'message' => 'Statut mis à jour.',
            'slot' => $schedule,
        ]);
    }
}
