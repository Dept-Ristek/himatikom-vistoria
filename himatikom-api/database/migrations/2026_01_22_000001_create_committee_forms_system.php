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
        // 1. Tabel Form Kepanitiaan
        Schema::create('committee_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'closed'])->default('active');
            $table->timestamp('open_at')->nullable();
            $table->timestamp('close_at')->nullable();
            $table->timestamps();
        });

        // 2. Tabel Divisi dalam Form
        Schema::create('committee_form_divisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('committee_form_id')->references('id')->on('committee_forms')->onDelete('cascade');
            $table->string('name');
            $table->integer('quota')->default(0);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 3. Tabel Pertanyaan dalam Form
        Schema::create('committee_form_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('committee_form_id')->references('id')->on('committee_forms')->onDelete('cascade');
            $table->string('question');
            $table->enum('type', ['text', 'textarea', 'multiple_choice', 'radio'])->default('text');
            $table->json('options')->nullable();
            $table->boolean('required')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 4. Tabel Pendaftaran Anggota
        Schema::create('committee_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreignId('committee_form_id')->references('id')->on('committee_forms')->onDelete('cascade');
            $table->foreignId('committee_form_division_id')->references('id')->on('committee_form_divisions')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();

            // Kunci unik: 1 user hanya bisa mendaftar 1x per form
            $table->unique(['user_id', 'committee_form_id']);
        });

        // 5. Tabel Jawaban Pertanyaan
        Schema::create('committee_registration_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('committee_registration_id');
            $table->unsignedBigInteger('committee_form_question_id');
            $table->foreign('committee_registration_id', 'creg_id_fk')
                  ->references('id')
                  ->on('committee_registrations')
                  ->onDelete('cascade');
            $table->foreign('committee_form_question_id', 'cfq_id_fk')
                  ->references('id')
                  ->on('committee_form_questions')
                  ->onDelete('cascade');
            $table->longText('answer');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committee_registration_answers');
        Schema::dropIfExists('committee_registrations');
        Schema::dropIfExists('committee_form_questions');
        Schema::dropIfExists('committee_form_divisions');
        Schema::dropIfExists('committee_forms');
    }
};
