<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLoanRequest;
use App\Http\Resources\LoanResource;
use App\Models\Book;
use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class LoanController extends Controller
{
    /**
     * GET /api/v1/loans — the authenticated member's loan history.
     * Supports ?status=active|returned|pending and ?group=aktif|selesai.
     */
    public function index(Request $request)
    {
        $loans = Loan::query()
            ->forUser($request->user()->id)
            ->with('book')
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('group') === 'aktif', fn ($q) => $q->whereIn('status', [Loan::STATUS_PENDING, Loan::STATUS_ACTIVE]))
            ->when($request->query('group') === 'selesai', fn ($q) => $q->whereIn('status', [Loan::STATUS_RETURNED, Loan::STATUS_REJECTED]))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return LoanResource::collection($loans);
    }

    /**
     * POST /api/v1/loans — submit a borrow request for a book.
     */
    public function store(StoreLoanRequest $request)
    {
        $user = $request->user();
        $book = Book::findOrFail($request->validated('book_id'));

        // Block duplicate open requests for the same book by the same member.
        $alreadyOpen = Loan::query()
            ->forUser($user->id)
            ->where('book_id', $book->id)
            ->whereIn('status', Loan::OPEN_STATUSES)
            ->exists();

        if ($alreadyOpen) {
            throw ValidationException::withMessages([
                'book_id' => ['Anda sudah memiliki peminjaman aktif untuk buku ini.'],
            ]);
        }

        if ($book->availableCopies() < 1) {
            throw ValidationException::withMessages([
                'book_id' => ['Buku ini sedang tidak tersedia.'],
            ]);
        }

        $loan = Loan::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'status' => Loan::STATUS_PENDING,
            'due_date' => now()->addDays(Loan::LOAN_DAYS),
        ]);

        return LoanResource::make($loan->load('book'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * GET /api/v1/loans/{loan} — a single loan owned by the member.
     */
    public function show(Request $request, Loan $loan)
    {
        abort_unless($loan->user_id === $request->user()->id, Response::HTTP_FORBIDDEN);

        return LoanResource::make($loan->load('book'));
    }
}
