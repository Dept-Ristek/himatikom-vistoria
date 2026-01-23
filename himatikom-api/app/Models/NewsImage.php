<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsImage extends Model
{
    protected $fillable = ['news_article_id', 'filename', 'order'];

    public function newsArticle()
    {
        return $this->belongsTo(NewsArticle::class);
    }

    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        return url('/api/news/image/' . $this->filename);
    }
}
