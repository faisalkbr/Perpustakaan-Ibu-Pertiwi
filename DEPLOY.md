# Panduan Deploy ke cPanel

Arsitektur: **dua subdomain terpisah**

| Subdomain                  | Isi                       | Document Root            |
| -------------------------- | ------------------------- | ------------------------ |
| `iplibrary.si-project.my.id`    | React (hasil build statis) | folder berisi isi `dist/` |
| `apilibrary.si-project.my.id`    | Laravel API               | `.../apps/api/public`    |

Auth memakai Bearer token (Sanctum, tanpa cookie), jadi dua domain berbeda aman tanpa kerumitan cookie.

---

## A. Deploy Backend (Laravel API)

1. **Buat subdomain** `apilibrary.si-project.my.id` di cPanel. Arahkan document root-nya ke `apps/api/public`.
2. **Kirim kode** ke server. `vendor/` TIDAK ikut git (di-ignore), jadi pilih salah satu:
   - **Via FTP/File Manager:** upload seluruh `apps/api/` termasuk folder `vendor/` dari lokal (tidak perlu Composer di server).
   - **Via git pull** (lihat bagian "Alur update" di bawah): wajib jalankan `composer install --no-dev --optimize-autoloader` di server (butuh SSH + Composer).
3. **Buat database** di cPanel → *MySQL Databases*. Catat nama DB, user, password.
4. **Buat file `.env`** di `apps/api/.env` berdasarkan `.env.production.example`:
   - Isi `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
   - Set `APP_URL=https://apilibrary.si-project.my.id` dan `FRONTEND_URL=https://iplibrary.si-project.my.id`.
5. **Generate APP_KEY** (lewat Terminal cPanel kalau ada SSH):
   ```bash
   php artisan key:generate
   php artisan migrate --force        # buat tabel
   php artisan db:seed --force        # opsional: data awal
   ```
   > Tanpa SSH: generate `APP_KEY` di lokal (`php artisan key:generate --show`) lalu tempel ke `.env` server. Migrasi bisa dijalankan via fitur *Terminal*/*Cron* cPanel atau impor SQL manual.
6. **Optimasi** (opsional tapi disarankan):
   ```bash
   php artisan config:cache
   php artisan route:cache
   ```
7. Pastikan **PHP 8.3** dipilih untuk subdomain ini (MultiPHP Manager).

Tes: buka `https://apilibrary.si-project.my.id/api/v1/...` atau endpoint health yang ada.

---

## B. Deploy Frontend (React)

Build dilakukan **di komputer lokal**, lalu hasilnya diupload.

1. Pastikan `apps/web/.env.production` berisi URL API yang benar:
   ```
   VITE_API_BASE_URL=https://apilibrary.si-project.my.id/api/v1
   ```
2. Build:
   ```bash
   cd apps/web
   npm install
   npm run build      # menghasilkan folder dist/
   ```
3. **Buat subdomain** `iplibrary.si-project.my.id` di cPanel.
4. **Upload seluruh isi `dist/`** (termasuk file `.htaccess`) ke document root subdomain itu.
   - `.htaccess` sudah otomatis ikut ter-build dari `apps/web/public/.htaccess` — pastikan ikut terupload (file tersembunyi, aktifkan "Show Hidden Files" di File Manager).

Tes: buka `https://iplibrary.si-project.my.id`, login, lalu **refresh** di halaman dalam (mis. `/products`) — harus tetap tampil, bukan 404.

---

## Checklist sebelum go-live

- [ ] `APP_ENV=production`, `APP_DEBUG=false` di `.env` API
- [ ] `APP_KEY` terisi
- [ ] Migrasi DB sudah jalan
- [ ] `FRONTEND_URL` = origin frontend (untuk CORS)
- [ ] `VITE_API_BASE_URL` di build = URL API produksi
- [ ] HTTPS aktif (AutoSSL/Let's Encrypt) di kedua subdomain
- [ ] `.htaccess` SPA ikut terupload di subdomain frontend
- [ ] File `.env` asli TIDAK diupload ke folder publik / tidak masuk git

---

## Alur update / menambah fitur setelah live

Sumber kebenaran tetap **kode di lokal + GitHub** (`github.com/faisalkbr/Perpustakaan-Ibu-Pertiwi`).
Kembangkan di lokal (Laragon) → commit → push → deploy ke server. Hindari mengedit langsung di server
agar perubahan tidak hilang saat update berikutnya dan tidak bentrok dengan git.

### Frontend (React) — TIDAK bisa diedit langsung di server
File di server sudah ter-compile & minified (hasil `dist/`). Jadi setiap kali menambah/ubah fitur:
1. Edit kode di lokal (`apps/web/`), uji dengan `npm run dev`.
2. `npm run build` → folder `dist/` baru.
3. Upload isi `dist/` ke document root `iplibrary.si-project.my.id`, timpa yang lama
   (pastikan `.htaccess` tetap ada).

### Backend (Laravel) — boleh diedit, tapi lewat git
Secara teknis PHP bisa diubah langsung di server, tapi **disarankan tetap via lokal + git**.
Cara update:

**Opsi 1 — cPanel "Git Version Control" (tanpa SSH penuh):**
- Di cPanel → *Git Version Control* → Create, arahkan ke repo GitHub, lalu gunakan tombol *Pull or Deploy*.

**Opsi 2 — SSH/Terminal:**
```bash
cd ~/path/ke/apps/api
git pull origin main
composer install --no-dev --optimize-autoloader   # hanya jika ada dependency baru
php artisan migrate --force                        # hanya jika ada migrasi baru
php artisan config:cache && php artisan route:cache # refresh cache config/route
```

> **Aman:** file `.env` di server di-ignore git, jadi `git pull` TIDAK menimpa konfigurasi produksimu.
> Kalau kamu sebelumnya pakai `config:cache`, jalankan ulang setelah mengubah `.env`,
> atau `php artisan config:clear` agar perubahan `.env` terbaca.

### Ringkas
| Mau ubah | Edit di | Cara naikkan ke server |
|---|---|---|
| Tampilan / logika React | lokal saja | build ulang → upload `dist/` |
| Endpoint / logika API Laravel | lokal (push git) | `git pull` + (composer/migrate bila perlu) |
| Konfigurasi (DB, URL, dll) | langsung `.env` server | edit `.env`, lalu `config:clear` |
