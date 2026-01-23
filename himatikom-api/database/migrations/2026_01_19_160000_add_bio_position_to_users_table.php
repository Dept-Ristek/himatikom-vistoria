<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Tambahkan bio (opsional)
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('avatar');
            }

            // Tambahkan position/jabatan (opsional)
            if (!Schema::hasColumn('users', 'position')) {
                $table->string('position')->nullable()->after('role');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'bio')) {
                $table->dropColumn('bio');
            }
            if (Schema::hasColumn('users', 'position')) {
                $table->dropColumn('position');
            }
        });
    }
};
