<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        $rules = [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => "sometimes|string|email|max:255|unique:users,email,{$userId}",
            'phone' => 'sometimes|string|max:20',
        ];

        // Doctor-specific fields
        if ($this->user()->role === 'medecin') {
            $rules['specialty'] = 'sometimes|string|max:255';
            $rules['location'] = 'sometimes|string|max:255';
            $rules['experience'] = 'sometimes|string|max:100';
            $rules['price'] = 'sometimes|numeric|min:0';
            $rules['bio'] = 'sometimes|string|max:2000';
            $rules['consultation_duration'] = 'sometimes|integer|min:5|max:120';
        }


        return $rules;
    }
}
