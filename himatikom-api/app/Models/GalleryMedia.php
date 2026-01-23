<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryMedia extends Model
{
    protected $table = 'gallery_media';
    protected $fillable = ['gallery_id', 'media_url', 'media_path', 'media_type', 'order'];

    public function gallery()
    {
        return $this->belongsTo(Gallery::class);
    }
}
