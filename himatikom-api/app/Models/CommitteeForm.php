<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteeForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'status',
        'open_at',
        'close_at',
    ];

    protected $casts = [
        'open_at' => 'datetime',
        'close_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function divisions()
    {
        return $this->hasMany(CommitteeFormDivision::class)->orderBy('order');
    }

    public function questions()
    {
        return $this->hasMany(CommitteeFormQuestion::class)->orderBy('order');
    }

    public function registrations()
    {
        return $this->hasMany(CommitteeRegistration::class);
    }
}
