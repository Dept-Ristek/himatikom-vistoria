<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteeFormDivision extends Model
{
    use HasFactory;

    protected $fillable = [
        'committee_form_id',
        'name',
        'quota',
        'order',
    ];

    public function form()
    {
        return $this->belongsTo(CommitteeForm::class, 'committee_form_id');
    }

    public function registrations()
    {
        return $this->hasMany(CommitteeRegistration::class);
    }
}
