<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bank extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function accountTransaction()
    {
        return $this->hasMany(AccountTransaction::class, 'account_id', 'id');
    }
       public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'id');
    }
}
