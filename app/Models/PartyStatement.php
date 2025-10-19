<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartyStatement extends Model
{
    use HasFactory;
     protected $guarded = [];
         public function sale()
    {
        return $this->belongsTo(Sale::class, 'reference_id');
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class, 'reference_id');
    }
    public function return()
    {
        return $this->belongsTo(Returns::class, 'reference_id');
    }
    public function service_sale()
    {
        return $this->belongsTo(ServiceSale::class, 'reference_id');
    }
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'party_id');
    }
}
