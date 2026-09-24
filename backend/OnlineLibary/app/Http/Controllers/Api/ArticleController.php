<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    // Fetch all articles
    public function index()
    {
        return response()->json(Article::latest()->get());
    }

    // Store a new article published by a teacher
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'category'    => 'required|string',
            'author_name' => 'required|string',
            'excerpt'     => 'required|string|max:500',
            'content'     => 'required|string',
        ]);

        $article = Article::create($validated);

        return response()->json(['message' => 'Article published successfully!', 'article' => $article], 201);
    }
}