<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder AMAN untuk PRODUKSI — tidak memakai faker/factory.
 *
 * Membuat satu akun Kepala Perpustakaan (head) sebagai admin awal, lalu
 * mengisi katalog buku contoh lewat ProductionBookSeeder.
 *
 * Idempoten: aman dijalankan berulang kali (tidak menggandakan data).
 *
 * Jalankan:  php artisan db:seed --class=Database\\Seeders\\ProductionSeeder --force
 */
class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        // GANTI email & password ini sesuai kebutuhan sebelum/ sesudah dijalankan.
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

        $this->call(ProductionBookSeeder::class);
    }
}
