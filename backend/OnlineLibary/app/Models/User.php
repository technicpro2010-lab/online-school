<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // ==========================================
    // RELATIONSHIPS
    // ==========================================
     public function enrollments()
{
    // Explicitly set 'student_id' as the foreign key
    return $this->hasMany(Enrollment::class, 'student_id');
}
    /**
     * 1. Student Relationship: Subjects the student is enrolled in.
     */
    public function enrolledSubjects()
    {
        return $this->belongsToMany(Subject::class, 'enrollments', 'student_id', 'subject_id')
                    ->withTimestamps();
    }

    /**
     * 2. Teacher Relationship: Subjects created/taught by this teacher.
     */
    public function taughtSubjects()
    {
        return $this->hasMany(Subject::class, 'teacher_id');
    }

    /**
     * 3. Content Creator Relationship: Course materials uploaded by this user.
     */
    public function uploadedMaterials()
    {
        return $this->hasMany(Material::class, 'uploaded_by');
    }

    /**
     * 4. Teacher Relationship: Class sessions scheduled by this teacher.
     */
    public function scheduledSessions()
    {
        return $this->hasMany(ClassSession::class, 'teacher_id');
    }

    /**
     * 5. Student Relationship: Class attendance records for this student.
     */
    public function classAttendances()
    {
        return $this->hasMany(ClassAttendance::class, 'student_id');
    }

    // ==========================================
    // ROLE HELPER METHODS
    // ==========================================

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isEnrollDept(): bool
    {
        return $this->role === 'enroll_dept';
    }
}