<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Kepala Perpustakaan
        User::factory()->role(User::ROLE_HEAD)->create([
            'name' => 'Kepala Perpustakaan',
            'email' => 'kepala@perpustakaan.test',
            'password' => 'password',
        ]);

        // Pustakawan
        User::factory()->role(User::ROLE_LIBRARIAN)->create([
            'name' => 'Pustakawan',
            'email' => 'pustakawan@perpustakaan.test',
            'password' => 'password',
        ]);

        // Anggota demo (cocok dengan desain — "Ahmad R.")
        $member = User::factory()->role(User::ROLE_MEMBER)->create([
            'name' => 'Ahmad Rizaldi',
            'email' => 'ahmad@member.test',
            'password' => 'password',
        ]);

        $this->call(BookSeeder::class);
        $this->call(LoanSeeder::class);

        // Beberapa peminjaman milik anggota demo dalam berbagai status.
        $books = \App\Models\Book::query()->inRandomOrder()->limit(8)->get();

        \App\Models\Loan::factory()->active()->for($member)->for($books[0])->create();
        \App\Models\Loan::factory()->active()->for($member)->for($books[1])->create();
        \App\Models\Loan::factory()->returned()->for($member)->for($books[2])->create();
        \App\Models\Loan::factory()->returned()->for($member)->for($books[3])->create();
        \App\Models\Loan::factory()->late()->for($member)->for($books[4])->create();
        \App\Models\Loan::factory()->for($member)->for($books[5])->create(); // pending
    }
}
