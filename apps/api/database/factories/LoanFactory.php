<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Loan>
 */
class LoanFactory extends Factory
{
    /**
     * Define the model's default state — a freshly submitted (pending) request.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'book_id' => Book::factory(),
            'status' => Loan::STATUS_PENDING,
            'borrowed_at' => null,
            'due_date' => now()->addDays(Loan::LOAN_DAYS),
            'returned_at' => null,
            'fine' => 0,
        ];
    }

    /** Currently borrowed (approved, not yet returned). */
    public function active(): static
    {
        return $this->state(function () {
            $borrowedAt = now()->subDays(fake()->numberBetween(1, 7));

            return [
                'status' => Loan::STATUS_ACTIVE,
                'borrowed_at' => $borrowedAt,
                'due_date' => $borrowedAt->copy()->addDays(Loan::LOAN_DAYS),
            ];
        });
    }

    /** Borrowed and already returned on time. */
    public function returned(): static
    {
        return $this->state(function () {
            $borrowedAt = now()->subDays(fake()->numberBetween(30, 90));
            $dueDate = $borrowedAt->copy()->addDays(Loan::LOAN_DAYS);

            return [
                'status' => Loan::STATUS_RETURNED,
                'borrowed_at' => $borrowedAt,
                'due_date' => $dueDate,
                'returned_at' => $dueDate->copy()->subDays(fake()->numberBetween(0, 4)),
                'fine' => 0,
            ];
        });
    }

    /** Active and overdue (late). */
    public function late(): static
    {
        return $this->state(function () {
            $borrowedAt = now()->subDays(fake()->numberBetween(20, 30));
            $dueDate = $borrowedAt->copy()->addDays(Loan::LOAN_DAYS);

            return [
                'status' => Loan::STATUS_ACTIVE,
                'borrowed_at' => $borrowedAt,
                'due_date' => $dueDate,
                'returned_at' => null,
                'fine' => 0,
            ];
        });
    }

    /** Returned late, with a fine. */
    public function returnedLate(): static
    {
        return $this->state(function () {
            $borrowedAt = now()->subDays(fake()->numberBetween(30, 90));
            $dueDate = $borrowedAt->copy()->addDays(Loan::LOAN_DAYS);
            $lateDays = fake()->numberBetween(2, 8);

            return [
                'status' => Loan::STATUS_RETURNED,
                'borrowed_at' => $borrowedAt,
                'due_date' => $dueDate,
                'returned_at' => $dueDate->copy()->addDays($lateDays),
                'fine' => $lateDays * Loan::FINE_PER_DAY,
            ];
        });
    }
}
