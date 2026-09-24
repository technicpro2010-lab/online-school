<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'teacher_id',
        'title',
        'start_time',
        'end_time',
        'scheduled_at',
        'meet_link',
        'google_event_id',
        'status',
    ];

    protected $casts = [
        'start_time'   => 'datetime',
        'end_time'     => 'datetime',
        'scheduled_at' => 'datetime',
    ];

    /**
     * Get the subject that owns the class session.
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the teacher who scheduled the class session.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the attendance records for this session.
     */
    public function attendances()
    {
        return $this->hasMany(ClassAttendance::class);
    }

    /**
     * Scope to only include upcoming (not yet finished) sessions.
     */
    public function scopeUpcoming($query)
    {
        return $query->where(function ($q) {
            $q->where('end_time', '>=', now())
              ->orWhere('start_time', '>=', now())
              ->orWhereNull('start_time');
        });
    }
}