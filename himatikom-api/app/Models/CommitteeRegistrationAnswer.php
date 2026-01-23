<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteeRegistrationAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'committee_registration_id',
        'committee_form_question_id',
        'answer',
    ];

    public function registration()
    {
        return $this->belongsTo(CommitteeRegistration::class);
    }

    public function question()
    {
        return $this->belongsTo(CommitteeFormQuestion::class, 'committee_form_question_id');
    }
}
