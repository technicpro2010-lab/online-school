<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\VideoController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\ClassSessionController;
use App\Http\Controllers\Api\AttendanceController;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);
Route::get('/subjects', [SubjectController::class, 'index']);
Route::get('/articles', [ArticleController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Requires Sanctum Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User Profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Student Fetching
    Route::get('/students', function () {
        return User::where('role', 'student')->get(['id', 'name', 'email']);
    });

    // Articles
    Route::post('/articles', [ArticleController::class, 'store']);

    // Enrollment & Student Material Routes
    Route::post('/subjects/{id}/enroll', [SubjectController::class, 'enroll']);
    Route::get('/my-enrollments', [SubjectController::class, 'myEnrollments']);
    
    // FIX: Corrected controller target to MaterialController
    Route::get('/my-materials', [MaterialController::class, 'myMaterials']);
    Route::get('/materials', [MaterialController::class, 'index']);
    Route::post('/materials', [MaterialController::class, 'store']);
    Route::get('/teacher/materials', [MaterialController::class, 'teacherMaterials']);
    Route::delete('/materials/{id}', [MaterialController::class, 'destroy']);

    // Admin-Only Enrollment Approval Dashboard Routes
    Route::get('/admin/pending-enrollments', [SubjectController::class, 'getPendingEnrollments']);
    Route::put('/admin/enrollments/{id}', [SubjectController::class, 'updateEnrollmentStatus']);

    // Books Routes
    Route::get('/books', [BookController::class, 'index']);
    Route::post('/books', [BookController::class, 'store']);
    Route::get('/books/{id}', [BookController::class, 'show']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);

    // Video Routes
    Route::get('/videos', [VideoController::class, 'index']);
    Route::post('/videos', [VideoController::class, 'store']);
    Route::delete('/videos/{id}', [VideoController::class, 'destroy']);

    // ==========================================
    // Class Scheduling Routes (Teacher/Admin)
    // ==========================================
    Route::post('/class-sessions', [ClassSessionController::class, 'store']);
    Route::get('/teacher/class-sessions', [ClassSessionController::class, 'teacherSessions']);
    Route::put('/class-sessions/{id}', [ClassSessionController::class, 'update']);
    Route::delete('/class-sessions/{id}', [ClassSessionController::class, 'destroy']);
    Route::get('/class-sessions/{sessionId}/attendance', [AttendanceController::class, 'sessionAttendance']);

    // ==========================================
    // Class Joining Routes (Student)
    // ==========================================
    // 1. Fetch live/scheduled class sessions for enrolled students (per subject)
    Route::get('/student/subjects/{subjectId}/sessions', [ClassSessionController::class, 'getStudentSessions']);

    // 2. Fetch all upcoming class sessions across every enrolled subject (for dashboard)
    Route::get('/student/class-sessions', [ClassSessionController::class, 'myStudentSessions']);

    // 3. Log attendance when a student clicks "Launch Class" inside JoinClassModal
    Route::post('/attendance/log', [AttendanceController::class, 'logAttendance']);
});