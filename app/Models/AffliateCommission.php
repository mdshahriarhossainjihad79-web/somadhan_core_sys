<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffliateCommission extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function sale()
    {
        return $this->belongsTo(Sale::class, 'sale_id', 'id');
    }

    public function affliator()
    {
        return $this->belongsTo(Affiliator::class, 'affiliator_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'branch_id', 'branch_id');
    }
}
