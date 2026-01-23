<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'category',
        'user_id',
    ];

    // Relasi ke Penulis
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replies()
    {
        return $this->hasMany(Reply::class)->orderBy('created_at', 'asc');
    }

    public function media()
    {
        return $this->hasMany(PostMedia::class);
    }
}
