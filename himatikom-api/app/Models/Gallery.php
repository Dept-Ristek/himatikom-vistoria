<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    protected $table = 'galleries';
    protected $fillable = ['title', 'description', 'thumbnail_url', 'order', 'featured', 'user_id'];

    public function media()
    {
        return $this->hasMany(GalleryMedia::class)->orderBy('order', 'asc');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Get first media as thumbnail
    public function getFirstMediaUrl()
    {
        $firstMedia = $this->media()->first();
        return $firstMedia ? $firstMedia->media_url : $this->thumbnail_url;
    }

    // Get first media type
    public function getFirstMediaType()
    {
        $firstMedia = $this->media()->first();
        return $firstMedia ? $firstMedia->media_type : 'image';
    }
}

