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
        Schema::table('gallery_photos', function (Blueprint $table) {
            $table->enum('file_type', ['image', 'video'])->default('image')->after('image_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gallery_photos', function (Blueprint $table) {
            $table->dropColumn('file_type');
        });
    }
};
