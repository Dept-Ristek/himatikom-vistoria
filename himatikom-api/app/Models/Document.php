<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    protected $fillable = [
        'name',
        'type',
        'file_path',
        'size',
        'parent_id',
        'user_id',
    ];

    protected $casts = [
        'size' => 'integer',
        'parent_id' => 'integer',
        'user_id' => 'integer',
    ];

    /**
     * Get the parent folder
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'parent_id');
    }

    /**
     * Get the children (files and folders)
     */
    public function children(): HasMany
    {
        return $this->hasMany(Document::class, 'parent_id');
    }

    /**
     * Get the owner user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if is folder
     */
    public function isFolder(): bool
    {
        return $this->type === 'folder';
    }

    /**
     * Get children count
     */
    public function getChildrenCountAttribute(): int
    {
        return $this->children()->count();
    }
}
