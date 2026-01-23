<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        // Try dropping constraints - wrap in try-catch for safety
        try {
            DB::statement('ALTER TABLE committee_registrations DROP INDEX committee_registrations_user_id_committee_form_id_unique');
        } catch (\Exception $e) {
            // Index might not exist, continue
        }
        
        try {
            DB::statement('ALTER TABLE committee_registrations DROP INDEX unique_user_form_division');
        } catch (\Exception $e) {
            // Index might not exist, continue
        }
        
        // Add new unique constraint (user_id, committee_form_id, committee_form_division_id)
        try {
            DB::statement('ALTER TABLE committee_registrations ADD CONSTRAINT unique_user_form_division UNIQUE (user_id, committee_form_id, committee_form_division_id)');
        } catch (\Exception $e) {
            // Constraint might already exist, continue
        }
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        // Drop the new unique constraint and restore old one
        try {
            DB::statement('ALTER TABLE committee_registrations DROP INDEX unique_user_form_division');
        } catch (\Exception $e) {
            // Index might not exist
        }
        
        try {
            DB::statement('ALTER TABLE committee_registrations ADD CONSTRAINT committee_registrations_user_id_committee_form_id_unique UNIQUE (user_id, committee_form_id)');
        } catch (\Exception $e) {
            // Constraint might already exist
        }
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
