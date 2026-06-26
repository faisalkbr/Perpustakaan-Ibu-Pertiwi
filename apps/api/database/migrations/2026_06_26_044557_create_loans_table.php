<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            // pending = menunggu, active = dipinjam, returned = dikembalikan, rejected = ditolak
            $table->string('status', 20)->default('pending')->index();
            $table->date('borrowed_at')->nullable();   // tanggal pinjam (saat disetujui)
            $table->date('due_date')->nullable();       // jatuh tempo
            $table->date('returned_at')->nullable();    // tanggal dikembalikan
            $table->unsignedInteger('fine')->default(0); // denda (rupiah)
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
