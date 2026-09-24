<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Material;
use App\Models\Enrollment;
use App\Models\Subject;
use App\Models\Book;
use App\Models\ClassSession;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    /**
     * Get materials and subjects for the logged-in student.
     */
    public function myMaterials(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Fetch subject IDs for both 'approved' and 'active' status values
        $approvedSubjectIds = Enrollment::where('student_id', $user->id)
            ->whereIn('status', ['approved', 'active'])
            ->pluck('subject_id');

        // Fetch subject details for the enrolled subjects header
        $enrolledSubjects = Subject::whereIn('id', $approvedSubjectIds)
            ->select('id', 'name', 'code')
            ->get();

        // Retrieve study materials linked to those approved subjects
        $materials = Material::whereIn('subject_id', $approvedSubjectIds)
            ->with('subject:id,name,code')
            ->get();

        // Retrieve books from books table linked to those approved subjects
        $booksTableItems = Book::whereIn('subject_id', $approvedSubjectIds)
            ->with('subject:id,name,code')
            ->get();

        // Retrieve upcoming/live scheduled class sessions for those approved subjects
        $classSessions = ClassSession::whereIn('subject_id', $approvedSubjectIds)
            ->where('status', '!=', 'cancelled')
            ->with(['subject:id,name,code', 'teacher:id,name'])
            ->orderBy('start_time', 'asc')
            ->get()
            ->map(function ($session) {
                return [
                    'id'           => $session->id,
                    'subject_id'   => $session->subject_id,
                    'title'        => $session->title,
                    'start_time'   => $session->start_time,
                    'end_time'     => $session->end_time,
                    'meet_link'    => $session->meet_link,
                    'meeting_link' => $session->meet_link,
                    'status'       => $session->status,
                    'subject_name' => $session->subject->name ?? null,
                    'teacher_name' => $session->teacher->name ?? null,
                ];
            });

        // Filter materials into books (PDF/documents)
        $booksFromMaterials = $materials->filter(function ($item) {
            return (isset($item->type) && $item->type === 'book') 
                || (!empty($item->file_path) && empty($item->url));
        })->values();

        // Merge books from both sources, deduplicating by subject_id and lowercase title
        $seen = [];
        $mergedBooks = collect();

        foreach ($booksTableItems as $b) {
            $key = $b->subject_id . '_' . strtolower($b->title);
            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $mergedBooks->push($b);
            }
        }

        foreach ($booksFromMaterials as $m) {
            $key = $m->subject_id . '_' . strtolower($m->title);
            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $mergedBooks->push($m);
            }
        }

        // Filter materials into video lessons (YouTube or direct video URLs)
        $videos = $materials->filter(function ($item) {
            return !empty($item->url) || !empty($item->file_path) || (isset($item->type) && $item->type === 'video');
        })->map(function ($item) {
            return [
                'id'          => $item->id,
                'title'       => $item->title,
                'url'         => $item->url ?? $item->file_path ?? '',
                'subject'     => $item->subject,
                'description' => $item->description,
            ];
        })->values();

        // Return structured JSON payload expected by StudentDashboard.jsx
        return response()->json([
            'enrolled_subjects' => $enrolledSubjects,
            'books'             => $mergedBooks->values(),
            'videos'            => $videos,
            'class_sessions'    => $classSessions->values(),
        ], 200);
    }

    /**
     * Display a listing of all materials (Admin/Teacher view, enrollment-filtered for students).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Material::with('subject:id,name,code');

        // If the user is a student, restrict to their enrolled subjects
        if ($user && strtolower($user->role ?? '') === 'student') {
            $enrolledSubjectIds = Enrollment::where('student_id', $user->id)
                ->whereIn('status', ['approved', 'active'])
                ->pluck('subject_id');
            $query->whereIn('subject_id', $enrolledSubjectIds);
        }

        $materials = $query->get();
        return response()->json($materials, 200);
    }

    /**
     * Upload a new study material (Admin/Teacher view).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'subject_id'  => 'required|exists:subjects,id',
            'type'        => 'required|string',
            'url'         => 'nullable|string',
            'description' => 'nullable|string',
            'file'        => 'nullable|file|mimes:pdf,epub,docx,doc,txt,mp4,webm|max:51200',
        ]);

        // Handle file upload if present
        if ($request->hasFile('file')) {
            $folder = ($request->type === 'book') ? 'books' : 'materials';
            $validated['file_path'] = $request->file('file')->store($folder, 'public');
        }

        // Attach current authenticated user / teacher ID if available
        if (auth()->check()) {
            $validated['teacher_id'] = auth()->id();
        }

        // Unset raw file object to avoid mass-assignment error
        unset($validated['file']);

        $material = Material::create($validated);

        // If it is a book, synchronize with books table
        if ($material->type === 'book') {
            try {
                Book::create([
                    'title'              => $material->title,
                    'subject_id'         => $material->subject_id,
                    'description'        => $material->description,
                    'file_path'          => $material->file_path ?? ($material->url ?? ''),
                    'author'             => auth()->user()?->name ?? 'Teacher',
                    'quantity'           => 1,
                    'available_quantity' => 1,
                ]);
            } catch (\Exception $e) {
                \Log::warning('Book synchronization notice: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message'  => 'Material uploaded successfully',
            'material' => $material->load('subject:id,name,code')
        ], 201);
    }

    /**
     * Display a specific material item.
     */
    public function show(string $id)
    {
        $material = Material::with('subject:id,name,code')->findOrFail($id);
        return response()->json($material, 200);
    }

    /**
     * Update material details.
     */
    public function update(Request $request, string $id)
    {
        $material = Material::findOrFail($id);
        $material->update($request->all());

        return response()->json([
            'message'  => 'Material updated successfully.',
            'material' => $material
        ], 200);
    }

    /**
     * Get materials uploaded by the logged-in teacher (or all for admin).
     */
    public function teacherMaterials(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $query = Material::with('subject:id,name,code');
        if (strtolower($user->role ?? '') !== 'admin') {
            $query->where('teacher_id', $user->id);
        }

        return response()->json($query->latest()->get(), 200);
    }

    /**
     * Remove a study material item (owner teacher or admin only).
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $material = Material::findOrFail($id);

        // Check ownership: only the teacher who uploaded or admin can delete
        if (strtolower($user->role ?? '') !== 'admin' && (int)$material->teacher_id !== (int)$user->id) {
            return response()->json(['message' => 'Unauthorized. You can only delete your own uploaded files.'], 403);
        }

        // Delete physical file if present
        if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
            Storage::disk('public')->delete($material->file_path);
        }

        // If this material is a book, also clean up the synchronized book in books table
        if ($material->type === 'book') {
            Book::where('subject_id', $material->subject_id)
                ->where('title', $material->title)
                ->delete();
        }

        $material->delete();

        return response()->json(['message' => 'File deleted successfully.'], 200);
    }
}