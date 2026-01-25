<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('category_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Store price in cents (e.g. 1999 = €19.99)
            $table->unsignedInteger('price');
            $table->unsignedInteger('stock')->default(0);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(['category_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
