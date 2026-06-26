<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;

class CategoryController extends Controller
{
    /**
     * GET /api/v1/categories — distinct book categories for filter dropdowns.
     */
    public function index()
    {
        $categories = Book::query()
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json(['data' => $categories]);
    }
}
