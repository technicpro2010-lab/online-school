<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    // Fetch logged-in student's enrollments
    public function myEnrollments(Request $request)
    {
        $enrollments = Enrollment::with('subject')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($enrollments);
    }

    // Request enrollment in a subject
    public function enroll(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $enrollment = Enrollment::firstOrCreate(
            [
                'user_id'    => $request->user()->id,
                'subject_id' => $validated['subject_id'],
            ],
            [
                'status'     => 'pending',
            ]
        );

        return response()->json([
            'message'    => 'Enrollment request submitted successfully!',
            'enrollment' => $enrollment,
        ], 201);
    }
    public function update(Request $request, $id)
{
    $request->validate([
        'status' => 'required|in:approved,rejected',
    ]);

   $enrollments = Enrollment::where('student_id', auth()->id())
    ->whereIn('status', ['approved', 'active'])
    ->with(['subject', 'subject.books', 'subject.videos']) // Ensure relationships are eager loaded
    ->get();

    return response()->json(['message' => 'Enrollment status updated successfully']);
}
}