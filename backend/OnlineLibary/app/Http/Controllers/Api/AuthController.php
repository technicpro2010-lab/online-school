<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // 1. Role-Based Registration with Secret Passkey Validation
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|in:student,teacher,enroll_dept,admin',
            'invite_code' => 'nullable|string',
        ]);

        $requestedRole = $request->input('role', 'student');
        $assignedRole = 'student'; // Default fallback

        // Check secret passkeys for privileged roles
        if ($requestedRole === 'teacher') {
            if ($request->input('invite_code') !== env('TEACHER_SECRET', 'teach2026')) {
                return response()->json(['message' => 'Invalid Teacher authorization passkey.'], 403);
            }
            $assignedRole = 'teacher';
        } elseif ($requestedRole === 'enroll_dept' || $requestedRole === 'admin') {
            if ($request->input('invite_code') !== env('ADMIN_SECRET', 'admin2026')) {
                return response()->json(['message' => 'Invalid Administrative authorization passkey.'], 403);
            }
            $assignedRole = $requestedRole;
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $assignedRole,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    // 2. User Login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    // 3. User Logout
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}