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
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->string('author', 100);
            $table->string('isbn', 20)->nullable()->unique();
            $table->string('category', 60)->nullable();
            $table->unsignedSmallInteger('published_year')->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('title');
            $table->index('author');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
