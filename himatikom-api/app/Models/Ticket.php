<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    // TAMBAHKAN INI AGAR LARAVEL TAHU TABELNYA 'tickets_ristek', BUKAN 'tickets'
    protected $table = 'tickets_ristek';

    protected $fillable = [
        'user_id',
        'category',
        'description',
        'status',
        'solution',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}