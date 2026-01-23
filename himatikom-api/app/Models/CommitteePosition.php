<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteePosition extends Model
{
    use HasFactory;

    protected $fillable = [
        'proker_id',
        'name',
        'quota',
        'requirements',
        'status',
    ];

    // Lowongan ini milik Proker apa?
    public function proker()
    {
        return $this->belongsTo(Proker::class);
    }

    // Lowongan ini punya banyak pelamar
    public function applications()
    {
        return $this->hasMany(CommitteeApplication::class);
    }
}