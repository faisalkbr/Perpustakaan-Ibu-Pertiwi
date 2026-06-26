<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LoanResource;
use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LibrarianLoanController extends Controller
{
    /**
     * GET /api/v1/librarian/loans — all loans (any member) for staff.
     * ?status=pending|active|returned|rejected
     */
    public function index(Request $request)
    {
        $loans = Loan::query()
            ->with(['book', 'user'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return LoanResource::collection($loans);
    }

    /**
     * GET /api/v1/librarian/loans/counts — quick badge counts per status.
     */
    public function counts()
    {
        return response()->json([
            'data' => [
                'pending' => Loan::where('status', Loan::STATUS_PENDING)->count(),
                'active' => Loan::where('status', Loan::STATUS_ACTIVE)->count(),
            ],
        ]);
    }

    /**
     * POST /api/v1/librarian/loans/{loan}/approve — pending -> active.
     */
    public function approve(Loan $loan)
    {
        $this->assertStatus($loan, Loan::STATUS_PENDING, 'Hanya pengajuan yang menunggu dapat disetujui.');

        if ($loan->book->availableCopies() < 1) {
            throw ValidationException::withMessages([
                'loan' => ['Stok buku habis, tidak dapat disetujui.'],
            ]);
        }

        $loan->update([
            'status' => Loan::STATUS_ACTIVE,
            'borrowed_at' => now(),
            'due_date' => now()->addDays(Loan::LOAN_DAYS),
        ]);

        return LoanResource::make($loan->load(['book', 'user']));
    }

    /**
     * POST /api/v1/librarian/loans/{loan}/reject — pending -> rejected.
     */
    public function reject(Loan $loan)
    {
        $this->assertStatus($loan, Loan::STATUS_PENDING, 'Hanya pengajuan yang menunggu dapat ditolak.');

        $loan->update(['status' => Loan::STATUS_REJECTED]);

        return LoanResource::make($loan->load(['book', 'user']));
    }

    /**
     * POST /api/v1/librarian/loans/{loan}/return — active -> returned, compute fine.
     */
    public function returnBook(Loan $loan)
    {
        $this->assertStatus($loan, Loan::STATUS_ACTIVE, 'Hanya peminjaman aktif yang dapat dikembalikan.');

        $returnedAt = now();
        $lateDays = $loan->due_date && $returnedAt->gt($loan->due_date)
            ? (int) $loan->due_date->startOfDay()->diffInDays($returnedAt->startOfDay())
            : 0;

        $loan->update([
            'status' => Loan::STATUS_RETURNED,
            'returned_at' => $returnedAt,
            'fine' => $lateDays * Loan::FINE_PER_DAY,
        ]);

        return LoanResource::make($loan->load(['book', 'user']));
    }

    private function assertStatus(Loan $loan, string $expected, string $message): void
    {
        if ($loan->status !== $expected) {
            throw ValidationException::withMessages(['loan' => [$message]]);
        }
    }
}
