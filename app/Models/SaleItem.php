<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use HasFactory;
    // protected $guarded = [];

    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function variant()
    {
        return $this->belongsTo(Variation::class, 'variant_id', 'id');
    }

    public function saleId()
    {
        return $this->belongsTo(Sale::class, 'sale_id', 'id');
    }

    public function warranty()
    {
        return $this->hasOne(Warranty::class, 'sale_item_id', 'id');
    }
}
