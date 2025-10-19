<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function saleItem()
    {
        return $this->hasMany(SaleItem::class, 'sale_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function saleBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function variation()
    {
        return $this->hasMany(Variation::class, 'variant_id', 'id');
    }

    public function affliateCommission()
    {
        return $this->hasMany(AffliateCommission::class, 'affiliator_id', 'id');
    }

    public function CouerierOrder()
    {
        return $this->hasMany(CouerierOrder::class, 'sale_id', 'id');
    }

    public function accountReceive()
    {
        return $this->hasMany(AccountTransaction::class, 'reference_id', 'id')
            ->where('purpose', 'sale');
    }

    public function additional_charges()
    {
        return $this->hasMany(AdditionalCharge::class, 'reference_id', 'id');
    }
}
