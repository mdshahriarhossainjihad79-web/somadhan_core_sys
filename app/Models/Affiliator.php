<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Affiliator extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function affliateCommission()
    {
        return $this->hasMany(AffliateCommission::class, 'affiliator_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'branch_id', 'branch_id');
    }
}
