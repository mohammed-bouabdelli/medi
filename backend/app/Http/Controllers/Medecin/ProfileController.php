<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Get doctor profile.
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('doctorProfile'),
        ]);
    }

    /**
     * Update doctor profile.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->update($request->only(['first_name', 'last_name', 'email', 'phone']));

        if ($user->doctorProfile) {
            $user->doctorProfile->update($request->only([
                'specialty', 'location', 'experience', 'price', 'bio', 'consultation_duration',
            ]));
        }

        return response()->json([
            'message' => 'Profil mis à jour.',
            'user' => $user->fresh()->load('doctorProfile'),
        ]);
    }
    /**
     * Update medecin avatar.
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();
        
        if ($user->avatar && !\Str::startsWith($user->avatar, 'http')) {
            \Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $avatarUrl = \Storage::url($path);
        
        $user->update(['avatar' => $avatarUrl]);

        return response()->json([
            'message' => 'Photo de profil mise à jour.',
            'avatar' => $avatarUrl,
            'user' => $user->fresh('doctorProfile'),
        ]);
    }
}
