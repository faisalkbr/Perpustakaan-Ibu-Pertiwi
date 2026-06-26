<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    private const TYPES = ['peminjaman', 'denda', 'koleksi'];

    /** Indonesian short month labels, indexed 1–12. */
    private const MONTHS = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
        7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
    ];

    /**
     * GET /api/v1/reports/summary — recap for the head librarian.
     * ?type=peminjaman|denda|koleksi & ?start=YYYY-MM-DD & ?end=YYYY-MM-DD
     */
    public function summary(Request $request)
    {
        $validated = $request->validate([
            'type' => ['nullable', Rule::in(self::TYPES)],
            'start' => ['nullable', 'date'],
            'end' => ['nullable', 'date', 'after_or_equal:start'],
        ]);

        $type = $validated['type'] ?? 'peminjaman';
        $start = isset($validated['start'])
            ? CarbonImmutable::parse($validated['start'])->startOfDay()
            : CarbonImmutable::now()->subMonths(11)->startOfMonth();
        $end = isset($validated['end'])
            ? CarbonImmutable::parse($validated['end'])->endOfDay()
            : CarbonImmutable::now()->endOfDay();

        $inPeriod = fn () => Loan::query()->whereBetween('created_at', [$start, $end]);

        $totals = [
            'loans' => $inPeriod()->count(),
            'fines' => (int) $inPeriod()->sum('fine'),
            'active' => $inPeriod()->where('status', Loan::STATUS_ACTIVE)->count(),
            'returned' => $inPeriod()->where('status', Loan::STATUS_RETURNED)->count(),
            'members' => User::query()->members()->count(),
            'books' => (int) Book::query()->sum('stock'),
        ];

        return response()->json([
            'data' => [
                'type' => $type,
                'period' => ['start' => $start->toDateString(), 'end' => $end->toDateString()],
                'totals' => $totals,
                'top_book' => $this->topBook($start, $end),
                'trend' => $this->monthlyTrend($start, $end, $type),
                'transactions' => $this->transactions($start, $end, $type),
            ],
        ]);
    }

    /**
     * Most-borrowed book within the period.
     *
     * @return array{title: string, count: int}|null
     */
    private function topBook(CarbonImmutable $start, CarbonImmutable $end): ?array
    {
        $row = Loan::query()
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('book_id, COUNT(*) as total')
            ->groupBy('book_id')
            ->orderByDesc('total')
            ->with('book:id,title')
            ->first();

        if (! $row) {
            return null;
        }

        return ['title' => $row->book?->title ?? '—', 'count' => (int) $row->total];
    }

    /**
     * Per-month buckets between start and end (capped at 12 months).
     * Value = loan count, except for the "denda" report where it is the fine total.
     *
     * @return list<array{label: string, value: int}>
     */
    private function monthlyTrend(CarbonImmutable $start, CarbonImmutable $end, string $type): array
    {
        $cursor = $start->startOfMonth();
        $last = $end->startOfMonth();
        $buckets = [];

        while ($cursor->lessThanOrEqualTo($last) && count($buckets) < 12) {
            $monthStart = $cursor;
            $monthEnd = $cursor->endOfMonth();

            $query = Loan::query()->whereBetween('created_at', [$monthStart, $monthEnd]);
            $value = $type === 'denda' ? (int) $query->sum('fine') : $query->count();

            $buckets[] = [
                'label' => self::MONTHS[$cursor->month].' '.$cursor->format('y'),
                'value' => $value,
            ];

            $cursor = $cursor->addMonth();
        }

        return $buckets;
    }

    /**
     * Detail rows for the report table; shape depends on the report type.
     *
     * @return list<array<string, mixed>>
     */
    private function transactions(CarbonImmutable $start, CarbonImmutable $end, string $type): array
    {
        if ($type === 'koleksi') {
            return Book::query()
                ->withCount(['loans as loan_count' => fn ($q) => $q->whereBetween('created_at', [$start, $end])])
                ->orderByDesc('loan_count')
                ->orderBy('title')
                ->limit(20)
                ->get()
                ->map(fn (Book $book) => [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author' => $book->author,
                    'category' => $book->category,
                    'stock' => (int) $book->stock,
                    'loan_count' => (int) $book->loan_count,
                ])
                ->all();
        }

        return Loan::query()
            ->with(['book:id,title', 'user:id,name'])
            ->whereBetween('created_at', [$start, $end])
            ->when($type === 'denda', fn ($q) => $q->where('fine', '>', 0))
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (Loan $loan) => [
                'id' => $loan->id,
                'member' => $loan->user?->name ?? '—',
                'book' => $loan->book?->title ?? '—',
                'status' => $loan->status,
                'display_status' => $loan->displayStatus(),
                'borrowed_at' => $loan->borrowed_at?->toDateString(),
                'returned_at' => $loan->returned_at?->toDateString(),
                'fine' => (int) $loan->fine,
                'created_at' => $loan->created_at?->toDateString(),
            ])
            ->all();
    }
}
