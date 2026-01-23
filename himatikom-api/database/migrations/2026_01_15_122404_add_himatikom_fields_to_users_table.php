<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 1. NIM (Wajib & Unik)
            $table->string('nim')->unique()->after('id');
            
            // 2. Role (Anggota, Alumni, Pengurus)
            $table->enum('role', ['anggota', 'alumni', 'pengurus'])->default('anggota')->after('email');
            
            // 3. Avatar
            $table->string('avatar')->nullable()->after('password');

            // 4. Email jadi Opsional (Nullable)
            $table->string('email')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nim', 'role', 'avatar']);
            $table->string('email')->nullable(false)->change();
        });
    }
};