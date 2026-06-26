<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Seeder;

class LoanSeeder extends Seeder
{
    /**
     * Spread some active loans across random books (by extra members) so the
     * catalog shows a realistic mix of available / borrowed availability.
     */
    public function run(): void
    {
        $members = User::factory()->count(6)->role(User::ROLE_MEMBER)->create();

        // Active loans → realistic availability mix in the catalog.
        Book::query()->inRandomOrder()->limit(12)->get()->each(function (Book $book) use ($members): void {
            Loan::factory()
                ->active()
                ->for($members->random())
                ->for($book)
                ->create();
        });

        // Pending requests → populate the librarian "Konfirmasi Peminjaman" queue.
        Book::query()->inRandomOrder()->limit(5)->get()->each(function (Book $book) use ($members): void {
            Loan::factory()
                ->for($members->random())
                ->for($book)
                ->create(); // default state = pending
        });
    }
}
