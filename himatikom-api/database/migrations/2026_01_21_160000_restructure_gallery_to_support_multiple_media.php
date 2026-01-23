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
        // Rename gallery_photos to galleries
        Schema::rename('gallery_photos', 'galleries');

        // Create gallery_media table
        Schema::create('gallery_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_id')->constrained('galleries')->cascadeOnDelete();
            $table->string('media_url');
            $table->string('media_path');
            $table->enum('media_type', ['image', 'video'])->default('image');
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('gallery_id');
            $table->index('order');
        });

        // Add thumbnail_url to galleries
        Schema::table('galleries', function (Blueprint $table) {
            $table->string('thumbnail_url')->nullable()->after('title');
            $table->dropColumn(['image_url', 'image_path', 'file_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gallery_media');
        
        Schema::table('galleries', function (Blueprint $table) {
            $table->string('image_url')->after('title');
            $table->string('image_path')->after('image_url');
            $table->enum('file_type', ['image', 'video'])->default('image')->after('image_path');
            $table->dropColumn('thumbnail_url');
        });

        Schema::rename('galleries', 'gallery_photos');
    }
};
