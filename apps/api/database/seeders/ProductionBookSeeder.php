<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;

/**
 * Katalog buku contoh untuk produksi — tanpa faker.
 *
 * Sampul memakai Open Library Covers API (berdasarkan ISBN). URL memakai
 * `?default=false` sehingga jika sampul tidak ada, server mengembalikan 404
 * dan frontend (BookCover) otomatis menampilkan placeholder garis-garis.
 *
 * Idempoten: di-keyed pada ISBN, jadi menjalankan ulang akan memperbarui
 * data yang ada, bukan menggandakannya.
 */
class ProductionBookSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->books() as $book) {
            $book['cover_url'] = "https://covers.openlibrary.org/b/isbn/{$book['isbn']}-L.jpg?default=false";

            Book::updateOrCreate(['isbn' => $book['isbn']], $book);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function books(): array
    {
        return [
            ['isbn' => '9789792248616', 'title' => 'Negeri 5 Menara', 'author' => 'Ahmad Fuadi', 'publisher' => 'Gramedia Pustaka Utama', 'category' => 'Fiksi', 'published_year' => 2009, 'stock' => 8, 'description' => 'Kisah Alif dan kelima sahabatnya di pondok pesantren dengan mantra "man jadda wajada".'],
            ['isbn' => '9780747532699', 'title' => "Harry Potter and the Philosopher's Stone", 'author' => 'J.K. Rowling', 'publisher' => 'Bloomsbury', 'category' => 'Fiksi', 'published_year' => 1997, 'stock' => 10, 'description' => 'Petualangan pertama Harry Potter di sekolah sihir Hogwarts.'],
            ['isbn' => '9780099590088', 'title' => 'Sapiens: A Brief History of Humankind', 'author' => 'Yuval Noah Harari', 'publisher' => 'Vintage', 'category' => 'Sejarah', 'published_year' => 2011, 'stock' => 6, 'description' => 'Tinjauan sejarah singkat tentang evolusi dan peradaban manusia.'],
            ['isbn' => '9780735211292', 'title' => 'Atomic Habits', 'author' => 'James Clear', 'publisher' => 'Avery', 'category' => 'Pengembangan Diri', 'published_year' => 2018, 'stock' => 9, 'description' => 'Cara membangun kebiasaan baik dan menghapus kebiasaan buruk melalui perubahan kecil.'],
            ['isbn' => '9780061120084', 'title' => 'To Kill a Mockingbird', 'author' => 'Harper Lee', 'publisher' => 'Harper Perennial', 'category' => 'Fiksi', 'published_year' => 1960, 'stock' => 5, 'description' => 'Novel klasik tentang keadilan dan rasialisme di Amerika Selatan melalui mata Scout Finch.'],
            ['isbn' => '9780547928227', 'title' => 'The Hobbit', 'author' => 'J.R.R. Tolkien', 'publisher' => 'Houghton Mifflin', 'category' => 'Fiksi', 'published_year' => 1937, 'stock' => 7, 'description' => 'Petualangan Bilbo Baggins bersama para kurcaci merebut kembali harta dari naga Smaug.'],
            ['isbn' => '9780451524935', 'title' => '1984', 'author' => 'George Orwell', 'publisher' => 'Signet Classics', 'category' => 'Fiksi', 'published_year' => 1949, 'stock' => 6, 'description' => 'Distopia totaliter di bawah pengawasan Big Brother.'],
            ['isbn' => '9780743273565', 'title' => 'The Great Gatsby', 'author' => 'F. Scott Fitzgerald', 'publisher' => 'Scribner', 'category' => 'Fiksi', 'published_year' => 1925, 'stock' => 5, 'description' => 'Kisah Jay Gatsby dan impian Amerika di era Jazz.'],
            ['isbn' => '9780061122415', 'title' => 'The Alchemist', 'author' => 'Paulo Coelho', 'publisher' => 'HarperOne', 'category' => 'Fiksi', 'published_year' => 1988, 'stock' => 8, 'description' => 'Perjalanan Santiago mengejar takdir dan harta karunnya.'],
            ['isbn' => '9780141439518', 'title' => 'Pride and Prejudice', 'author' => 'Jane Austen', 'publisher' => 'Penguin Classics', 'category' => 'Fiksi', 'published_year' => 1813, 'stock' => 4, 'description' => 'Romansa klasik antara Elizabeth Bennet dan Mr. Darcy.'],
            ['isbn' => '9780374533557', 'title' => 'Thinking, Fast and Slow', 'author' => 'Daniel Kahneman', 'publisher' => 'Farrar, Straus and Giroux', 'category' => 'Non-Fiksi', 'published_year' => 2011, 'stock' => 5, 'description' => 'Dua sistem berpikir yang membentuk cara kita mengambil keputusan.'],
            ['isbn' => '9780062457714', 'title' => 'The Subtle Art of Not Giving a F*ck', 'author' => 'Mark Manson', 'publisher' => 'HarperOne', 'category' => 'Pengembangan Diri', 'published_year' => 2016, 'stock' => 7, 'description' => 'Pendekatan kontra-intuitif untuk menjalani hidup yang lebih baik.'],
            ['isbn' => '9781612680194', 'title' => 'Rich Dad Poor Dad', 'author' => 'Robert T. Kiyosaki', 'publisher' => 'Plata Publishing', 'category' => 'Non-Fiksi', 'published_year' => 1997, 'stock' => 9, 'description' => 'Pelajaran literasi finansial dari dua sosok ayah yang berbeda.'],
            ['isbn' => '9780441013593', 'title' => 'Dune', 'author' => 'Frank Herbert', 'publisher' => 'Ace', 'category' => 'Fiksi', 'published_year' => 1965, 'stock' => 6, 'description' => 'Epik fiksi ilmiah tentang Paul Atreides di planet gurun Arrakis.'],
            ['isbn' => '9780316769488', 'title' => 'The Catcher in the Rye', 'author' => 'J.D. Salinger', 'publisher' => 'Little, Brown and Company', 'category' => 'Fiksi', 'published_year' => 1951, 'stock' => 5, 'description' => 'Kisah Holden Caulfield dan kegelisahan masa remaja.'],
            ['isbn' => '9780544003415', 'title' => 'The Lord of the Rings', 'author' => 'J.R.R. Tolkien', 'publisher' => 'Houghton Mifflin', 'category' => 'Fiksi', 'published_year' => 1954, 'stock' => 4, 'description' => 'Trilogi epik perjalanan menghancurkan Cincin Utama di Middle-earth.'],
        ];
    }
}
