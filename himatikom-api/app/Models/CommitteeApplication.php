<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteeApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'committee_position_id',
        'status',
        'motivation_letter',
    ];

    // Siapa yang melamar?
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Melamar posisi apa?
    public function position()
    {
        return $this->belongsTo(CommitteePosition::class);
    }
}