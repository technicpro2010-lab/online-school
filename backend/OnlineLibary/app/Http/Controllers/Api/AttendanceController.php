<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassAttendance;
use App\Models\ClassSession;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Student: Log attendance when they launch a live class.
     */
    public function logAttendance(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'class_session_id' => 'nullable|exists:class_sessions,id',
            'subject_id'       => 'nullable|exists:subjects,id',
        ]);

        // Resolve the subject from the session when not supplied explicitly.
        $subjectId = $validated['subject_id'] ?? null;
        if (!$subjectId && !empty($validated['class_session_id'])) {
            $session = ClassSession::find($validated['class_session_id']);
            $subjectId = $session?->subject_id;
        }

        // Ensure the student is actually enrolled in the subject.
        if ($subjectId) {
            $isEnrolled = Enrollment::where('student_id', $user->id)
                ->where('subject_id', $subjectId)
                ->whereIn('status', ['approved', 'active'])
                ->exists();

            if (!$isEnrolled) {
                return response()->json(['message' => 'You are not enrolled in this class.'], 403);
            }
        }

        $attendance = ClassAttendance::firstOrCreate(
            [
                'class_session_id' => $validated['class_session_id'] ?? null,
                'student_id'       => $user->id,
            ],
            [
                'subject_id' => $subjectId,
                'joined_at'  => now(),
            ]
        );

        // If the record already existed but was missing a join timestamp, refresh it.
        if (!$attendance->wasRecentlyCreated && !$attendance->joined_at) {
            $attendance->update(['joined_at' => now()]);
        }

        return response()->json([
            'message'    => 'Attendance logged successfully.',
            'attendance' => $attendance,
        ], 201);
    }

    /**
     * Teacher/Admin: View attendance for a specific class session.
     */
    public function sessionAttendance(Request $request, $sessionId)
    {
        $user = $request->user();
        $session = ClassSession::findOrFail($sessionId);

        if (strtolower($user->role ?? '') !== 'admin' && (int) $session->teacher_id !== (int) $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $attendance = ClassAttendance::with('student:id,name,email')
            ->where('class_session_id', $sessionId)
            ->orderBy('joined_at', 'asc')
            ->get();

        return response()->json($attendance, 200);
    }
}