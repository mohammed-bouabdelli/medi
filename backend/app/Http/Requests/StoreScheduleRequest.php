<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'day_of_week' => 'required|string|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi,Dimanche',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ];
    }

    public function messages(): array
    {
        return [
            'day_of_week.required' => 'Le jour est obligatoire.',
            'day_of_week.in' => 'Jour invalide.',
            'start_time.required' => "L'heure de début est obligatoire.",
            'end_time.required' => "L'heure de fin est obligatoire.",
            'end_time.after' => "L'heure de fin doit être après l'heure de début.",
        ];
    }
}
