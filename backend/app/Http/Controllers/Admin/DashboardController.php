<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $totalUsers = User::where('role', '<>', 'admin')->count();
        $activeDoctors = User::where('role', 'medecin')->where('status', 'active')->count();
        $monthlyAppointments = Appointment::whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->count();
        $cancellationRate = Appointment::count() > 0
            ? round(Appointment::where('status', 'cancelled')->count() / Appointment::count() * 100, 1)
            : 0;

        // Chart data: appointments per month (last 7 months)
        $chartData = collect(range(6, 0))->map(function ($i) {
            $date = now()->subMonths($i);
            return [
                'name' => $date->translatedFormat('M'),
                'rdv' => Appointment::whereMonth('date', $date->month)
                    ->whereYear('date', $date->year)
                    ->count(),
            ];
        })->values();

        // Recent users (exclude admin account)
        $recentUsers = User::where('role', '<>', 'admin')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($u) => [
                'name' => $u->role === 'medecin' ? "Dr. {$u->full_name}" : $u->full_name,
                'role' => ucfirst($u->role === 'medecin' ? 'Médecin' : 'Patient'),
                'date' => $u->created_at->diffForHumans(),
            ]);

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'active_doctors' => $activeDoctors,
                'monthly_appointments' => $monthlyAppointments,
                'cancellation_rate' => $cancellationRate,
            ],
            'chart_data' => $chartData,
            'recent_users' => $recentUsers,
        ]);
    }
}
