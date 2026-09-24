<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'description', 'teacher_id'];

    /**
     * Get the teacher who owns/teaches the subject.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the enrolled students for the subject.
     */
    public function students()
    {
        return $this->belongsToMany(User::class, 'enrollments', 'subject_id', 'student_id')
                    ->withTimestamps();
    }

    /**
     * Get all scheduled class sessions for the subject.
     */
    public function classSessions()
    {
        return $this->hasMany(ClassSession::class);
    }
}