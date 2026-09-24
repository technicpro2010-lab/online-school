<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Subject;
use App\Models\Enrollment;
use App\Models\User;

class SubjectController extends Controller
{
    /**
     * Display a listing of all active subjects.
     */
    public function index()
    {
        $subjects = Subject::all();
        return response()->json($subjects, 200);
    }

    /**
     * Submit a new enrollment request (Student).
     */
    public function enroll(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
         $studentId = $user->id;
        // Prevent duplicate requests using student_id
        $existing = Enrollment::where('student_id', $studentId)
            ->where('subject_id', $id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already requested or been enrolled in this subject.',
                'status'  => $existing->status
            ], 400);
        }

        // Create enrollment request
        $enrollment = Enrollment::create([
            'student_id' => $studentId,
            'subject_id' => $id,
            'status'     => 'pending',
        ]);

        return response()->json([
            'message'    => 'Enrollment request submitted successfully.',
            'enrollment' => $enrollment
        ], 201);
    }

    /**
     * Get current logged-in student's enrollments.
     */
    public function myEnrollments(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $enrollments = Enrollment::where('student_id', $user->id)->get();

        return response()->json($enrollments, 200);
    }

    /**
     * Get all pending enrollment requests (Admin Only).
     */
    public function getPendingEnrollments(Request $request)
    {
        if (strtolower($request->user()->role ?? '') !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $pending = Enrollment::with(['student:id,name,email', 'subject:id,name,code'])
            ->where('status', 'pending')
            ->get();

        return response()->json($pending, 200);
    }

    /**
     * Approve or reject an enrollment request (Admin Only).
     */
    public function updateEnrollmentStatus(Request $request, $id)
    {
        if (strtolower($request->user()->role ?? '') !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $enrollment = Enrollment::findOrFail($id);
        $enrollment->status = $request->status;
        $enrollment->save();

        if ($request->status === 'approved') {
            $student = User::find($enrollment->student_id);
            if ($student && method_exists($student, 'enrolledSubjects')) {
                $student->enrolledSubjects()->syncWithoutDetaching([$enrollment->subject_id]);
            }
        }

        return response()->json([
            'message' => "Enrollment request has been {$request->status}."
        ], 200);
    }
}