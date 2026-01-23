<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PostMedia extends Model
{
    protected $table = 'post_media';
    protected $fillable = ['post_id', 'filename', 'type', 'mime_type', 'size'];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function getUrlAttribute()
    {
        return url('/api/ngestuck/media/' . $this->id . '/' . $this->filename);
    }

    protected $appends = ['url'];
}
