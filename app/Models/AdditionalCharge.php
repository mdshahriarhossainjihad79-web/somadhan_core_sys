<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdditionalCharge extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function additional_charge_name()
    {
        return $this->belongsTo(AdditionalChargeName::class, 'additional_charge_name_id', 'id');
    }
}
