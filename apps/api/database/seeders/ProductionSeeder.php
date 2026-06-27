<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder AMAN untuk PRODUKSI — tanpa faker/factory.
 *
 * Mengisi data awal yang setara dengan seeder lokal, tetapi dengan nilai
 * eksplisit (bukan acak) sehingga tidak butuh fakerphp/faker:
 *   - 1 Kepala Perpustakaan (head) + 1 Pustakawan (librarian)
 *   - 3 anggota (member)
 *   - katalog 16 buku (via ProductionBookSeeder)
 *   - 6 peminjaman contoh dalam berbagai status
 *
 * Idempoten: aman dijalankan berulang. Akun pakai firstOrCreate, buku
 * updateOrCreate, dan peminjaman hanya dibuat bila tabel loans masih kosong.
 *
 * Jalankan:  php artisan db:seed --class=Database\\Seeders\\ProductionSeeder --force
 */
class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        // ---- Staf: Kepala Perpustakaan ----
        // GANTI email & password sesuai kebutuhan.
        User::firstOrCreate(
            ['email' => 'admin@iplibrary.si-project.my.id'],
            [
                'name' => 'Kepala Perpustakaan',
                'role' => User::ROLE_HEAD,
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => Hash::make('UbahPasswordIni!'),
            ],
        );

        // ---- Staf: Pustakawan ----
        User::firstOrCreate(
            ['email' => 'pustakawan@iplibrary.si-project.my.id'],
            [
                'name' => 'Pustakawan',
                'role' => User::ROLE_LIBRARIAN,
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => Hash::make('UbahPasswordIni!'),
            ],
        );

        // ---- Anggota ----
        $memberData = [
            ['name' => 'Ahmad Rizaldi', 'email' => 'ahmad@member.test', 'phone' => '0812-1111-2222', 'address' => 'Jl. Melati No. 1, Jakarta'],
            ['name' => 'Siti Nurhaliza', 'email' => 'siti@member.test', 'phone' => '0813-3333-4444', 'address' => 'Jl. Mawar No. 7, Bandung'],
            ['name' => 'Budi Santoso', 'email' => 'budi@member.test', 'phone' => '0814-5555-6666', 'address' => 'Jl. Kenanga No. 3, Surabaya'],
        ];

        $members = [];
        foreach ($memberData as $m) {
            $members[] = User::firstOrCreate(
                ['email' => $m['email']],
                [
                    'name' => $m['name'],
                    'role' => User::ROLE_MEMBER,
                    'phone' => $m['phone'],
                    'address' => $m['address'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                    'password' => Hash::make('password123'),
                ],
            );
        }

        // ---- Katalog buku ----
        $this->call(ProductionBookSeeder::class);

        // ---- Peminjaman contoh (hanya bila belum ada, agar idempoten) ----
        if (Loan::count() === 0) {
            [$ahmad, $siti, $budi] = $members;

            // Pending — masuk antrean "Konfirmasi Peminjaman" pustakawan
            $this->makeLoan($ahmad, '9780747532699', Loan::STATUS_PENDING, null, now()->addDays(Loan::LOAN_DAYS), null, 0);

            // Active — sedang dipinjam, belum jatuh tempo
            $this->makeLoan($siti, '9780099590088', Loan::STATUS_ACTIVE, now()->subDays(5), now()->addDays(9), null, 0);
            $this->makeLoan($budi, '9780735211292', Loan::STATUS_ACTIVE, now()->subDays(3), now()->addDays(11), null, 0);

            // Late — masih dipinjam tetapi sudah lewat jatuh tempo
            $this->makeLoan($ahmad, '9780547928227', Loan::STATUS_ACTIVE, now()->subDays(20), now()->subDays(6), null, 0);

            // Returned — dikembalikan tepat waktu
            $this->makeLoan($siti, '9789792248616', Loan::STATUS_RETURNED, now()->subDays(40), now()->subDays(26), now()->subDays(28), 0);

            // Returned late — dikembalikan telat 6 hari + denda
            $this->makeLoan($budi, '9780061120084', Loan::STATUS_RETURNED, now()->subDays(40), now()->subDays(26), now()->subDays(20), 6 * Loan::FINE_PER_DAY);
        }
    }

    /**
     * Buat satu peminjaman yang merujuk buku berdasarkan ISBN.
     */
    private function makeLoan(
        User $user,
        string $bookIsbn,
        string $status,
        ?Carbon $borrowedAt,
        Carbon $dueDate,
        ?Carbon $returnedAt,
        int $fine,
    ): void {
        $book = Book::where('isbn', $bookIsbn)->first();
        if (! $book) {
            return;
        }

        Loan::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'status' => $status,
            'borrowed_at' => $borrowedAt,
            'due_date' => $dueDate,
            'returned_at' => $returnedAt,
            'fine' => $fine,
        ]);
    }
}
