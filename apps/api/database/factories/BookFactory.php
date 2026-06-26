<?php

namespace Database\Factories;

use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => rtrim($this->faker->sentence(nbWords: 4), '.'),
            'author' => $this->faker->name(),
            'publisher' => $this->faker->randomElement([
                'Gramedia Pustaka Utama', 'Lentera Dipantara', 'Mizan', 'Bentang Pustaka',
                'Erlangga', 'Penerbit Andi', 'Informatika', 'Kompas',
            ]),
            'isbn' => $this->faker->unique()->isbn13(),
            'category' => $this->faker->randomElement([
                'Fiksi', 'Non-Fiksi', 'Sejarah', 'Sains', 'Teknologi',
                'Biografi', 'Anak', 'Religi', 'Pendidikan',
            ]),
            'published_year' => $this->faker->numberBetween(1980, (int) date('Y')),
            'stock' => $this->faker->numberBetween(0, 50),
            'description' => $this->faker->paragraph(),
        ];
    }
}
