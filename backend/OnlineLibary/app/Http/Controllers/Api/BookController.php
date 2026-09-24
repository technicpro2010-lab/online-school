<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Enrollment;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    // GET /api/books
    public function index(Request $request)
    {
        $user = $request->user();

        $subjectId = null;
        if ($request->filled('subject_id') && $request->subject_id !== null && $request->subject_id !== 'undefined') {
            $subjectId = (int) $request->subject_id;
        }

        // If the user is a student, restrict to their enrolled subjects
        $enrolledSubjectIds = null;
        if ($user && strtolower($user->role ?? '') === 'student') {
            $enrolledSubjectIds = Enrollment::where('student_id', $user->id)
                ->whereIn('status', ['approved', 'active'])
                ->pluck('subject_id');
        }

        $bookQuery = Book::with('subject');
        if ($subjectId) {
            $bookQuery->where('subject_id', $subjectId);
        }
        if ($enrolledSubjectIds !== null) {
            $bookQuery->whereIn('subject_id', $enrolledSubjectIds);
        }
        $books = $bookQuery->latest()->get();

        // Also retrieve materials of type book
        $materialQuery = Material::where('type', 'book')->with('subject');
        if ($subjectId) {
            $materialQuery->where('subject_id', $subjectId);
        }
        if ($enrolledSubjectIds !== null) {
            $materialQuery->whereIn('subject_id', $enrolledSubjectIds);
        }
        $materialBooks = $materialQuery->latest()->get();

        // Merge books, deduplicating by subject_id + title
        $seen = [];
        $merged = collect();

        foreach ($books as $b) {
            $key = $b->subject_id . '_' . strtolower($b->title);
            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $merged->push($b);
            }
        }

        foreach ($materialBooks as $m) {
            $key = $m->subject_id . '_' . strtolower($m->title);
            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $merged->push([
                    'id'          => $m->id,
                    'title'       => $m->title,
                    'author'      => $m->author ?? 'Teacher',
                    'subject_id'  => $m->subject_id,
                    'file_path'   => $m->file_path,
                    'url'         => $m->url,
                    'description' => $m->description,
                    'subject'     => $m->subject,
                    'created_at'  => $m->created_at,
                    'updated_at'  => $m->updated_at,
                ]);
            }
        }

        return response()->json($merged->values(), 200);
    }

    // POST /api/books
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'subject_id' => 'required|exists:subjects,id',
            'file'       => 'required|file|mimes:pdf,epub,docx|max:20480', // Max 20MB
            'type'       => 'nullable|string|in:book,ebook',
        ]);

        // 1. Handle File Upload
        if ($request->hasFile('file')) {
            $validated['file_path'] = $request->file('file')->store('books', 'public');
        }

        // 2. Remove the raw UploadedFile object so mass-assignment doesn't crash
        unset($validated['file']);

        // 3. Attach authenticated user if logged in
        if (auth()->check()) {
            $validated['uploaded_by'] = auth()->id();
        }

        $book = Book::create($validated);

        return response()->json($book->load('subject'), 201);
    }

    // GET /api/books/{id}
    public function show($id)
    {
        $book = Book::with('subject')->find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        return response()->json($book, 200);
    }

    // PUT /api/books/{id}
    public function update(Request $request, $id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'subject_id' => 'required|exists:subjects,id',
            'file'       => 'nullable|file|mimes:pdf,epub,docx|max:20480',
            'type'       => 'nullable|string|in:book,ebook',
        ]);

        if ($request->hasFile('file')) {
            if ($book->file_path) {
                Storage::disk('public')->delete($book->file_path);
            }
            $validated['file_path'] = $request->file('file')->store('books', 'public');
        }

        // Remove the raw UploadedFile object before updating
        unset($validated['file']);

        $book->update($validated);

        return response()->json($book->load('subject'), 200);
    }

    // DELETE /api/books/{id}
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        // Check matching Material if applicable
        $material = Material::where('subject_id', $book->subject_id)
            ->where('title', $book->title)
            ->first();

        if (strtolower($user->role ?? '') !== 'admin') {
            $isOwner = false;
            if (isset($book->uploaded_by) && (int)$book->uploaded_by === (int)$user->id) {
                $isOwner = true;
            } elseif ($material && (int)$material->teacher_id === (int)$user->id) {
                $isOwner = true;
            } elseif (strtolower($user->role ?? '') === 'teacher') {
                $isOwner = true;
            }

            if (!$isOwner) {
                return response()->json(['message' => 'Unauthorized. You can only delete your own uploaded books.'], 403);
            }
        }

        if ($book->file_path && Storage::disk('public')->exists($book->file_path)) {
            Storage::disk('public')->delete($book->file_path);
        }

        if ($material) {
            if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
                Storage::disk('public')->delete($material->file_path);
            }
            $material->delete();
        }

        $book->delete();

        return response()->json(['message' => 'Book deleted successfully'], 200);
    }
}