<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function stocks()
    {
        return $this->hasMany(Stock::class, 'branch_id');
    }

    public function branch_promotion()
    {
        return $this->hasOne(PromotionDetails::class, 'logic', 'id')
            ->where('promotion_type', 'branch');
    }
}
