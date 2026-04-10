<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * List all users with search and role filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', '!=', 'admin');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role') && $request->role !== 'all') {
            $roleMap = ['Patient' => 'patient', 'Médecin' => 'medecin', 'patient' => 'patient', 'medecin' => 'medecin', 'admin' => 'admin'];
            if (isset($roleMap[$request->role])) {
                $query->where('role', $roleMap[$request->role]);
            }
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($users);
    }

    /**
     * Create a new user.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'role' => 'required|in:Patient,Médecin,patient,medecin,admin',
        ]);

        // Split name into first and last
        $nameParts = array_filter(explode(' ', trim($request->name)));
        $firstName = array_shift($nameParts);
        $lastName = implode(' ', $nameParts);

        $roleMap = ['Patient' => 'patient', 'Médecin' => 'medecin'];
        $role = $roleMap[$request->role] ?? $request->role;

        $user = User::create([
            'first_name' => $firstName,
            'last_name' => $lastName ?? '',
            'email' => $request->email,
            'password' => Hash::make('password'),
            'role' => $role,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Utilisateur ajouté.',
            'user' => $user,
        ], 201);
    }

    /**
     * Toggle user active/inactive status.
     */
    public function toggleStatus($id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update([
            'status' => $user->status === 'active' ? 'inactive' : 'active',
        ]);

        return response()->json([
            'message' => 'Statut modifié.',
            'user' => $user,
        ]);
    }

    /**
     * Delete a user.
     */
    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
