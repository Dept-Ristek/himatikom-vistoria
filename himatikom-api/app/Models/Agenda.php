<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agenda extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'qr_code',
        'start_time',
        'end_time',
        'user_id',
        'type',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}