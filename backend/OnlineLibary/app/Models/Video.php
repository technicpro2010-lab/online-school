<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Video extends Model
{
    use HasFactory;
    
    protected $fillable=[
        'title','description','video_url','user_id','subject_id'
    ];
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function subject(){
        return $this->belongsTo(Subject::class);
    }
}
