<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Models\DoctorProfile;
use App\Models\User;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user (patient or medecin).
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'password' => $request->password,
            'role' => $request->role,
        ]);

        // Create doctor profile if registering as medecin
        if ($request->role === 'medecin') {
            DoctorProfile::create([
                'user_id' => $user->id,
                'specialty' => $request->specialty,
                'location' => $request->address, // Map selected city/address to location
                'experience' => $request->experience ?? '0',
                'price' => $request->price ?? 200, // Default price for test
                'verification_status' => 'verified', // Auto-verify for testing visibility
            ]);

            // Create initial schedules if provided
            if ($request->has('schedules')) {
                foreach ($request->schedules as $sched) {
                    if ($sched['is_active']) {
                        Schedule::create([
                            'doctor_id' => $user->id,
                            'day_of_week' => $sched['day_of_week'],
                            'start_time' => $sched['start_time'],
                            'end_time' => $sched['end_time'],
                            'is_active' => true,
                        ]);
                    }
                }
            }
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie.',
            'user' => $user->load('doctorProfile'),
            'token' => $token,
        ], 201);
    }

    /**
     * Login an existing user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        if ($user->status === 'inactive') {
            return response()->json([
                'message' => 'Votre compte est désactivé. Contactez l\'administrateur: admin@medi.ma',
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'user' => $user->load('doctorProfile'),
            'token' => $token,
        ]);
    }

    /**
     * Logout (revoke current token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('doctorProfile'),
        ]);
    }

    /**
     * Change password.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $request->user()->update([
            'password' => $request->password,
        ]);

        return response()->json([
            'message' => 'Mot de passe modifié avec succès.',
        ]);
    }

    /**
     * Delete own account.
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Compte supprimé avec succès.',
        ]);
    }
}
