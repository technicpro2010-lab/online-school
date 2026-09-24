<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_session_id',
        'student_id',
        'subject_id',
        'joined_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
    ];

    /**
     * Get the class session this attendance belongs to.
     */
    public function classSession()
    {
        return $this->belongsTo(ClassSession::class);
    }

    /**
     * Get the student who attended.
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the subject the attendance was logged against.
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}