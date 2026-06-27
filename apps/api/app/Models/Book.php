<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'author', 'publisher', 'isbn', 'category', 'published_year', 'stock', 'description', 'cover_url'])]
class Book extends Model
{
    /** @use HasFactory<\Database\Factories\BookFactory> */
    use HasFactory;

    /**
     * @return HasMany<Loan, Book>
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    /**
     * Copies currently held by open loans (pending or active).
     * Uses the `open_loans_count` aggregate when eager-loaded, else queries.
     */
    public function availableCopies(): int
    {
        $taken = $this->open_loans_count
            ?? $this->loans()->whereIn('status', Loan::OPEN_STATUSES)->count();

        return max(0, (int) $this->stock - (int) $taken);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_year' => 'integer',
            'stock' => 'integer',
        ];
    }

    /**
     * Eager-load the count of open (pending/active) loans as `open_loans_count`
     * so availability can be computed without N+1 queries.
     *
     * @param  Builder<Book>  $query
     */
    public function scopeWithOpenLoansCount(Builder $query): void
    {
        $query->withCount(['loans as open_loans_count' => function ($q): void {
            $q->whereIn('status', Loan::OPEN_STATUSES);
        }]);
    }

    /**
     * Free-text search across title, author and ISBN.
     *
     * @param  Builder<Book>  $query
     */
    public function scopeSearch(Builder $query, ?string $term): void
    {
        if (blank($term)) {
            return;
        }

        $query->where(function (Builder $q) use ($term): void {
            $q->where('title', 'like', "%{$term}%")
                ->orWhere('author', 'like', "%{$term}%")
                ->orWhere('isbn', 'like', "%{$term}%");
        });
    }
}
