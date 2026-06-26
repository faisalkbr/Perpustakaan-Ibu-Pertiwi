# Perpustakaan Ibu Pertiwi

Monorepo manajemen perpustakaan: **Laravel 13 API** + **React 19 (Vite)** dalam satu repo,
dikelola dengan **npm workspaces**.

```
.
├── apps/
│   ├── api/        # Laravel 13 — REST API, Sanctum token auth, MySQL
│   └── web/        # React 19 + Vite + TypeScript — SPA (shadcn/ui, TanStack Query, Zustand)
├── package.json    # workspaces + skrip orkestrasi (concurrently)
└── README.md
```

Antarmuka memakai **gaya Harvard Library** — warna *crimson* (`#A51C30`), tipografi serif
akademik (EB Garamond · Source Serif 4 · Libre Franklin), dan ruang putih yang lega.

## Stack

| Layer    | Teknologi |
|----------|-----------|
| Backend  | Laravel 13, PHP 8.3+, Laravel Sanctum (personal access token), MySQL |
| Frontend | React 19, **TypeScript**, Vite, **shadcn/ui** + Radix, Tailwind v4, React Router v7, TanStack Query v5, Zustand, React Hook Form, Zod, sonner |
| Tooling  | npm workspaces, concurrently, oxlint, tsc |

## Peran & alur (member flow)

Domain: **Sistem Informasi Peminjaman**, dengan akses berbasis peran (RBAC).

**Anggota** (login → `/catalog`):

1. **Login** — autentikasi token, panel editorial gaya Harvard.
2. **Katalog Buku** — grid responsif, cari + filter kategori + sort, status ketersediaan.
3. **Detail & Pengajuan Peminjaman** — metadata buku + modal konfirmasi pengajuan.
4. **Riwayat Peminjaman** — tab Semua/Aktif/Selesai, baris dapat di-*expand* (denda, sisa waktu).

**Pustakawan / Kepala Perpustakaan** (login → `/admin`, layout sidebar):

5. **Data Buku** — tabel CRUD buku + modal tambah/edit.
6. **Data Anggota** — tabel CRUD anggota (nama, email, telepon, status aktif).
7. **Konfirmasi Peminjaman** — antrean pengajuan (Menunggu/Disetujui/Ditolak), setujui/tolak.
8. **Pengembalian** — daftar peminjaman aktif, proses pengembalian + hitung denda otomatis.

Routing dijaga di dua sisi: middleware `role:librarian,head` di API dan `ProtectedRoute`
berbasis peran di frontend (anggota tidak bisa membuka `/admin`, dan sebaliknya).

## Prasyarat

- PHP **8.3+**, Composer 2
- Node **20+**, npm 10+
- MySQL (mis. dari Laragon)

## Setup pertama kali

```bash
# 1. Dependencies (root + frontend) dan vendor backend
npm install
composer install --working-dir=apps/api

# 2. Konfigurasi backend
#    Salin apps/api/.env.example -> apps/api/.env, sesuaikan kredensial DB,
#    lalu generate app key:
php apps/api/artisan key:generate

# 3. Buat database `perpustakaan_ibu_pertiwi`, lalu migrate + seed
npm run api:fresh
```

> Ada juga `npm run setup` sebagai shortcut interaktif yang menjalankan langkah di atas.

## Menjalankan (dev)

```bash
npm run dev
```

Menjalankan **kedua** server sekaligus (via `concurrently`):

- API   → http://127.0.0.1:8000  (`/api/v1/...`)
- Web   → http://localhost:5173

Vite mem-*proxy* `/api` ke backend, jadi frontend memakai URL relatif (`/api/v1`).

Jalankan terpisah bila perlu:

```bash
npm run dev:api   # hanya Laravel
npm run dev:web   # hanya React
```

## Akun demo (hasil seeder)

| Peran               | Email                          | Password |
|---------------------|--------------------------------|----------|
| Anggota             | `ahmad@member.test`            | password |
| Pustakawan          | `pustakawan@perpustakaan.test` | password |
| Kepala Perpustakaan | `kepala@perpustakaan.test`     | password |

> Alur Anggota (Katalog/Detail/Riwayat) sudah aktif — login dengan akun **Anggota**.

## Skrip penting (root)

| Skrip                | Aksi |
|----------------------|------|
| `npm run dev`        | Jalankan API + web bersamaan |
| `npm run build`      | Type-check (tsc) + build produksi frontend |
| `npm run lint`       | Lint frontend (oxlint) |
| `npm run api:migrate`| Migrasi DB |
| `npm run api:fresh`  | Drop, migrate ulang, + seed |
| `npm run api:test`   | PHPUnit/Pest backend |

## API

Base URL: `/api/v1`. Auth memakai **Bearer token** (Laravel Sanctum).

| Method | Endpoint            | Auth | Keterangan |
|--------|---------------------|------|------------|
| POST   | `/auth/register`    | —    | Daftar, balikan `{ user, token }` |
| POST   | `/auth/login`       | —    | Login, balikan `{ user, token }` |
| GET    | `/auth/me`          | ✓    | User saat ini |
| POST   | `/auth/logout`      | ✓    | Hapus token aktif |
| GET    | `/categories`       | ✓    | Daftar kategori (untuk filter) |
| GET    | `/books`            | ✓    | List (`?search=&category=&sort_by=&sort_order=&per_page=&page=`) — termasuk `available_copies`, `is_available` |
| POST   | `/books`            | ✓    | Buat buku |
| GET    | `/books/{id}`       | ✓    | Detail |
| PATCH  | `/books/{id}`       | ✓    | Update sebagian |
| DELETE | `/books/{id}`       | ✓    | Hapus |
| GET    | `/loans`            | ✓    | Riwayat peminjaman user (`?group=aktif\|selesai`, `?status=`) |
| POST   | `/loans`            | ✓    | Ajukan peminjaman `{ book_id }` (status `pending`, jatuh tempo +14 hari) |
| GET    | `/loans/{id}`       | ✓    | Detail peminjaman (milik user) |

Khusus **Pustakawan / Kepala** (`role:librarian,head`):

| Method | Endpoint                            | Keterangan |
|--------|-------------------------------------|------------|
| POST   | `/books` · PATCH/DELETE `/books/{id}` | Kelola buku |
| GET/POST/PATCH/DELETE | `/members[/{id}]`    | Kelola anggota |
| GET    | `/librarian/loans`                  | Semua peminjaman (`?status=`) |
| GET    | `/librarian/loans/counts`           | Jumlah `pending` & `active` (badge) |
| POST   | `/librarian/loans/{id}/approve`     | Setujui (pending → active) |
| POST   | `/librarian/loans/{id}/reject`      | Tolak (pending → rejected) |
| POST   | `/librarian/loans/{id}/return`      | Pengembalian (active → returned + denda) |

## Catatan arsitektur

- **Auth**: token-based (Sanctum personal access token). Frontend menyimpan token di
  `localStorage` (`auth-storage`) lewat Zustand; `apiFetch` menambahkan header
  `Authorization: Bearer {token}`. Respons `401` memicu auto-logout.
- **CORS**: `apps/api/config/cors.php` hanya mengizinkan origin `FRONTEND_URL`.
- **Validasi**: backend pakai Form Request; frontend pakai Zod schema yang selaras
  (mis. register mengirim `password_confirmation` sesuai aturan `confirmed` Laravel).
- **State server di frontend**: dikelola TanStack Query; query key terpusat di
  `src/lib/queryKeys.js`; URL search params adalah source of truth untuk list.
