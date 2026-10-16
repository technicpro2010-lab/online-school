<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('teacher can log in and receive a sanctum token', function () {
    $user = User::factory()->create([
        'role' => 'teacher',
        'password' => Hash::make('teacher-password'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'teacher-password',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('user.role', 'teacher')
        ->assertJsonPath('token_type', 'Bearer')
        ->assertJsonStructure(['access_token']);
});

test('login rejects an incorrect password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('correct-password'),
    ]);

    $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'incorrect-password',
    ])
        ->assertUnauthorized()
        ->assertJsonPath('message', 'Invalid credentials');
});
