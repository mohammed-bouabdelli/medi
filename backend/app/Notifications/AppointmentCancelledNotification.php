<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AppointmentCancelledNotification extends Notification
{
    use Queueable;

    protected $appointment;
    protected $cancelledBy;

    /**
     * Create a new notification instance.
     */
    public function __construct(Appointment $appointment, $cancelledBy)
    {
        $this->appointment = $appointment;
        $this->cancelledBy = $cancelledBy;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $otherParty = $this->cancelledBy === 'patient' 
            ? 'le patient ' . $this->appointment->patient->full_name 
            : 'le Dr. ' . $this->appointment->doctor->last_name;

        return [
            'appointment_id' => $this->appointment->id,
            'title' => 'Rendez-vous annulé',
            'message' => 'Le rendez-vous du ' . $this->appointment->date->format('d/m/Y') . ' a été annulé par ' . $otherParty,
            'type' => 'appointment_cancelled',
        ];
    }
}
