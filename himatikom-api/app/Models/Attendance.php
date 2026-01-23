<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'agenda_id',
        'scanned_at',
    ];

    /**
     * Relasi ke User (Siapa yang melakukan absensi)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Agenda
     */
    public function agenda(): BelongsTo
    {
        return $this->belongsTo(Agenda::class);
    }
}