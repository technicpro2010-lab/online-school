<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use App\Models\Enrollment;
use App\Models\Subject;
use Illuminate\Http\Request;

class ClassSessionController extends Controller
{
    /**
     * Teacher: Schedule a new live class for a subject.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user || !in_array(strtolower($user->role ?? ''), ['teacher', 'admin'], true)) {
            return response()->json(['message' => 'Unauthorized. Teacher access required.'], 403);
        }

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'title'      => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time'   => 'required|date|after:start_time',
            'meet_link'  => 'required|url|max:2048',
        ]);

        // A teacher may only schedule for subjects they teach (admins bypass this).
        if (strtolower($user->role ?? '') === 'teacher') {
            $ownsSubject = Subject::where('id', $validated['subject_id'])
                ->where(function ($query) use ($user) {
                    $query->where('teacher_id', $user->id)
                          ->orWhereNull('teacher_id');
                })
                ->exists();

            if (!$ownsSubject) {
                return response()->json([
                    'message' => 'You can only schedule classes for subjects assigned to you.',
                ], 403);
            }
        }

        $session = ClassSession::create([
            'subject_id' => $validated['subject_id'],
            'teacher_id' => $user->id,
            'title'      => $validated['title'],
            'start_time' => $validated['start_time'],
            'end_time'   => $validated['end_time'],
            'scheduled_at' => $validated['start_time'],
            'meet_link'  => $validated['meet_link'],
            'status'     => 'scheduled',
        ]);

        return response()->json([
            'message' => 'Class scheduled successfully.',
            'session' => $session->load(['subject:id,name,code', 'teacher:id,name']),
        ], 201);
    }

    /**
     * Teacher: List all class sessions they have scheduled.
     */
    public function teacherSessions(Request $request)
    {
        $user = $request->user();

        if (!$user || !in_array(strtolower($user->role ?? ''), ['teacher', 'admin'], true)) {
            return response()->json(['message' => 'Unauthorized. Teacher access required.'], 403);
        }

        $query = ClassSession::with(['subject:id,name,code', 'teacher:id,name'])
            ->orderBy('start_time', 'desc');

        if (strtolower($user->role ?? '') !== 'admin') {
            $query->where('teacher_id', $user->id);
        }

        return response()->json($query->get(), 200);
    }

    /**
     * Student: Fetch scheduled/live sessions for one enrolled subject.
     */
    public function getStudentSessions(Request $request, $subjectId)
    {
        $studentId = $request->user()->id;

        // Verify approved enrollment before exposing sessions.
        $isEnrolled = Enrollment::where('student_id', $studentId)
            ->where('subject_id', $subjectId)
            ->whereIn('status', ['approved', 'active'])
            ->exists();

        if (!$isEnrolled) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $sessions = ClassSession::with(['subject:id,name,code', 'teacher:id,name'])
            ->where('subject_id', $subjectId)
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json($sessions, 200);
    }

    /**
     * Student: Fetch every upcoming live class across all enrolled subjects.
     */
    public function myStudentSessions(Request $request)
    {
        $studentId = $request->user()->id;

        $subjectIds = Enrollment::where('student_id', $studentId)
            ->whereIn('status', ['approved', 'active'])
            ->pluck('subject_id');

        $sessions = ClassSession::with(['subject:id,name,code', 'teacher:id,name'])
            ->whereIn('subject_id', $subjectIds)
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json($sessions, 200);
    }

    /**
     * Teacher/Admin: Update a scheduled class session.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        $session = ClassSession::findOrFail($id);

        if (strtolower($user->role ?? '') !== 'admin' && (int) $session->teacher_id !== (int) $user->id) {
            return response()->json(['message' => 'Unauthorized. You can only edit your own classes.'], 403);
        }

        $validated = $request->validate([
            'title'      => 'sometimes|required|string|max:255',
            'start_time' => 'sometimes|required|date',
            'end_time'   => 'sometimes|required|date|after:start_time',
            'meet_link'  => 'sometimes|required|url|max:2048',
            'status'     => 'sometimes|required|in:scheduled,live,completed,cancelled',
        ]);

        if (isset($validated['start_time'])) {
            $validated['scheduled_at'] = $validated['start_time'];
        }

        $session->update($validated);

        return response()->json([
            'message' => 'Class session updated successfully.',
            'session' => $session->load(['subject:id,name,code', 'teacher:id,name']),
        ], 200);
    }

    /**
     * Teacher/Admin: Cancel/delete a scheduled class session.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        $session = ClassSession::findOrFail($id);

        if (strtolower($user->role ?? '') !== 'admin' && (int) $session->teacher_id !== (int) $user->id) {
            return response()->json(['message' => 'Unauthorized. You can only delete your own classes.'], 403);
        }

        $session->delete();

        return response()->json(['message' => 'Class session deleted successfully.'], 200);
    }
}