<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LinkPaymentHistory extends Model
{
    use HasFactory;
      protected $guarded = [];
      public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }
     public function user()
    {
        return $this->belongsTo(User::class, 'linked_by', 'id');
    }
     public function saleInv()
    {
        return $this->belongsTo(Sale::class, 'inv_number', 'invoice_number');
    }
}
