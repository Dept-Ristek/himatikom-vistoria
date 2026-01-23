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
        Schema::table('committee_registrations', function (Blueprint $table) {
            // Store array of division IDs as JSON (e.g., [1, 2])
            $table->json('division_ids')->nullable()->after('committee_form_division_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('committee_registrations', function (Blueprint $table) {
            $table->dropColumn('division_ids');
        });
    }
};
