<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'address' => 'required|string|max:500',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:patient,medecin',
            // Doctor-specific fields
            'specialty' => 'required_if:role,medecin|string|max:255',
            'location' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:100',
            'price' => 'nullable|numeric|min:0',
            'schedules' => 'nullable|array',
            'schedules.*.day_of_week' => 'required|string|max:20',
            'schedules.*.start_time' => 'required|string|date_format:H:i',
            'schedules.*.end_time' => 'required|string|date_format:H:i',
            'schedules.*.is_active' => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Le prénom est obligatoire.',
            'last_name.required' => 'Le nom est obligatoire.',
            'email.required' => "L'email est obligatoire.",
            'email.unique' => 'Cet email est déjà utilisé.',
            'phone.required' => 'Le téléphone est obligatoire.',
            'phone.unique' => 'Ce numéro de téléphone est déjà utilisé.',
            'address.required' => "L'adresse est obligatoire.",
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
            'role.required' => 'Le rôle est obligatoire.',
            'specialty.required_if' => 'La spécialité est obligatoire pour un médecin.',
        ];
    }
}
