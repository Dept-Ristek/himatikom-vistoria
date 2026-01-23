<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    protected $fillable = ['user_id', 'name', 'description', 'contact_person', 'email', 'phone', 'address', 'category'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
