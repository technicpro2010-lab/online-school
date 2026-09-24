<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
   protected $fillable = [
    'title',
    'description',
    'type',
    'file_path',
    'url',
    'teacher_id',
    'subject_id',
];

    /**
     * Relationship: A material belongs to a subject.
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}