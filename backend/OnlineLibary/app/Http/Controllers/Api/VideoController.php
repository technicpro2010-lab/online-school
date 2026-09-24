<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Video;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Video::with(['subject','user']);

        // Filter by subject_id if passed in request query
        if($request->has('subject_id') && $request->subject_id != ''){
            $query->where('subject_id', $request->subject_id);
        }

        // If the user is a student, restrict to their enrolled subjects
        if ($user && strtolower($user->role ?? '') === 'student') {
            $enrolledSubjectIds = Enrollment::where('student_id', $user->id)
                ->whereIn('status', ['approved', 'active'])
                ->pluck('subject_id');
            $query->whereIn('subject_id', $enrolledSubjectIds);
        }

        return response()->json($query->latest()->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'video_url'   => 'required|url',
            'subject_id'  => 'required|exists:subjects,id',
        ]);

        $video = Video::create([
            'title'       => $request->title,
            'description' => $request->description ?? null,
            'video_url'   => $request->video_url,
            'subject_id'  => $request->subject_id,
            'user_id'     => $request->user()?->id, // Fixed syntax error here
        ]);

        return response()->json([
            'message' => 'Video Uploaded Successfully',
            'video'   => $video->load(['user','subject']),
        ], 201);
    }

    public function destroy($id)
    {
        $video = Video::findOrFail($id);
        $video->delete();

        return response()->json(['message' => 'Video deleted successfully'], 200);
    }
}