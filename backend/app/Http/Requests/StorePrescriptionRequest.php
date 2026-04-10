<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => 'required|exists:users,id',
            'medications' => 'required|string|max:2000',
            'appointment_id' => 'nullable|exists:appointments,id',
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required' => 'Le patient est obligatoire.',
            'patient_id.exists' => "Ce patient n'existe pas.",
            'medications.required' => 'Les médicaments sont obligatoires.',
        ];
    }
}
