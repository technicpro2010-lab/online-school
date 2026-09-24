<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Teacher account
        User::updateOrCreate(
            ['email' => 'teach@gmail.com'], // Search condition
            [
                'name'     => 'Khudadad Ahmadi',
                'password' => Hash::make('12365478'),
                'passkey'  => 'teach2026',
                'role'     => 'Teacher',
            ]
        );

        // Student account
        User::updateOrCreate(
            ['email' => 'students@gmail.com'], // Search condition
            [
                'name'     => 'Ali Ahmadi',
                'password' => Hash::make('32145698'),
                'passkey'  => null,
                'role'     => 'Student',
            ]
        );

        // Admin account
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'], // Search condition
            [
                'name'     => 'ghani Ahmadi',
                'password' => Hash::make('98765432'),
                'passkey'  => 'admin2026',
                'role'     => 'Admin',
            ]
        );
    }
}