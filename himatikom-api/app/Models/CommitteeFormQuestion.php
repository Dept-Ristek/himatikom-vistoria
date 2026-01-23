<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteeFormQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'committee_form_id',
        'question',
        'type',
        'options',
        'required',
        'order',
    ];

    protected $casts = [
        'options' => 'array',
        'required' => 'boolean',
    ];

    public function form()
    {
        return $this->belongsTo(CommitteeForm::class, 'committee_form_id');
    }

    public function answers()
    {
        return $this->hasMany(CommitteeRegistrationAnswer::class);
    }
}
