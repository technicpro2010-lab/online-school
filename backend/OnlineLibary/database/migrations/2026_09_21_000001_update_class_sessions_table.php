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
        Schema::table('class_sessions', function (Blueprint $table) {
            // Teacher who owns/schedules the session
            $table->foreignId('teacher_id')
                ->nullable()
                ->after('subject_id')
                ->constrained('users')
                ->onDelete('cascade');

            // Explicit start/end timestamps for the live class window
            $table->dateTime('start_time')->nullable()->after('title');
            $table->dateTime('end_time')->nullable()->after('start_time');

            // Google Calendar event id (when Meet is generated via Google API)
            $table->string('google_event_id')->nullable()->after('meet_link');

            // Session lifecycle status
            $table->enum('status', ['scheduled', 'live', 'completed', 'cancelled'])
                ->default('scheduled')
                ->after('google_event_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_sessions', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
            $table->dropColumn([
                'teacher_id',
                'start_time',
                'end_time',
                'google_event_id',
                'status',
            ]);
        });
    }
};