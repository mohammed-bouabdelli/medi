<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin — idempotent: only created if it doesn't already exist
        User::firstOrCreate(
            ['email' => 'admin@medi.ma'],
            [
                'first_name' => 'Medi',
                'last_name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );
    }
}
