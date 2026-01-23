<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proker extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'department',
        'start_date',
        'end_date',
    ];

    // Satu Proker punya banyak Lowongan (CommitteePosition)
    public function positions()
    {
        return $this->hasMany(CommitteePosition::class);
    }
}