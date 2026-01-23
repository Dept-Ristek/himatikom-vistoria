<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteeRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'committee_form_id',
        'committee_form_division_id',
        'division_ids',
        'status',
    ];

    protected $casts = [
        'division_ids' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function form()
    {
        return $this->belongsTo(CommitteeForm::class, 'committee_form_id');
    }

    public function division()
    {
        return $this->belongsTo(CommitteeFormDivision::class, 'committee_form_division_id');
    }

    public function answers()
    {
        return $this->hasMany(CommitteeRegistrationAnswer::class);
    }
}
