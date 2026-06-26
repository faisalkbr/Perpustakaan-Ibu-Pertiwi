<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class BookController extends Controller
{
    /** Columns the client is allowed to sort by. */
    private const SORTABLE = ['title', 'author', 'published_year', 'stock', 'created_at'];

    /**
     * GET /api/v1/books
     * Supports ?search=, ?category=, ?sort_by=, ?sort_order=, ?per_page=, ?page=
     */
    public function index(Request $request)
    {
        $sortBy = in_array($request->query('sort_by'), self::SORTABLE, true)
            ? $request->query('sort_by')
            : 'created_at';

        $sortOrder = $request->query('sort_order') === 'asc' ? 'asc' : 'desc';

        $perPage = min(max((int) $request->query('per_page', 12), 1), 100);

        $books = Book::query()
            ->withOpenLoansCount()
            ->search($request->query('search'))
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->query('category')))
            ->orderBy($sortBy, $sortOrder)
            ->paginate($perPage)
            ->withQueryString();

        return BookResource::collection($books);
    }

    /**
     * POST /api/v1/books
     */
    public function store(StoreBookRequest $request)
    {
        $book = Book::create($request->validated());

        return BookResource::make($book)->response()->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * GET /api/v1/books/{book}
     */
    public function show(Book $book)
    {
        $book->loadCount(['loans as open_loans_count' => function ($q): void {
            $q->whereIn('status', Loan::OPEN_STATUSES);
        }]);

        return BookResource::make($book);
    }

    /**
     * PATCH /api/v1/books/{book}
     */
    public function update(UpdateBookRequest $request, Book $book)
    {
        $book->update($request->validated());

        return BookResource::make($book);
    }

    /**
     * DELETE /api/v1/books/{book}
     */
    public function destroy(Book $book)
    {
        $book->delete();

        return response()->noContent();
    }
}
