<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'book_id', 'status', 'borrowed_at', 'due_date', 'returned_at', 'fine'])]
class Loan extends Model
{
    /** @use HasFactory<\Database\Factories\LoanFactory> */
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_RETURNED = 'returned';
    public const STATUS_REJECTED = 'rejected';

    /** Statuses that count against book availability. */
    public const OPEN_STATUSES = [self::STATUS_PENDING, self::STATUS_ACTIVE];

    public const LOAN_DAYS = 14;
    public const FINE_PER_DAY = 5000;

    protected function casts(): array
    {
        return [
            'borrowed_at' => 'date',
            'due_date' => 'date',
            'returned_at' => 'date',
            'fine' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, Loan>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Book, Loan>
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Display status used by the UI: an active loan past its due date is "late".
     */
    public function displayStatus(): string
    {
        // Still out and past due.
        if ($this->status === self::STATUS_ACTIVE && $this->due_date && $this->due_date->isPast()) {
            return 'late';
        }

        // Returned after the due date (incurred a fine).
        if ($this->status === self::STATUS_RETURNED
            && $this->due_date
            && $this->returned_at
            && $this->returned_at->gt($this->due_date)) {
            return 'late';
        }

        return $this->status;
    }

    /** Days remaining until due (negative if overdue); null when not active. */
    public function daysRemaining(): ?int
    {
        if ($this->status !== self::STATUS_ACTIVE || ! $this->due_date) {
            return null;
        }

        return (int) now()->startOfDay()->diffInDays($this->due_date->startOfDay(), false);
    }

    /**
     * @param  Builder<Loan>  $query
     */
    public function scopeForUser(Builder $query, int $userId): void
    {
        $query->where('user_id', $userId);
    }
}
