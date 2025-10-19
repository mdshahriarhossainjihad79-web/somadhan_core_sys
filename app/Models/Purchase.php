<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function supplier()
    {
        return $this->belongsTo(Customer::class, 'party_id', 'id');
    }

    public function purchaseItem()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function purchaseCostItems()
    {
        return $this->hasMany(PurchaseCostDetails::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'particulars')
            ->where('particulars', 'like', 'Purchase#%');
    }

    public function purchaseBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
