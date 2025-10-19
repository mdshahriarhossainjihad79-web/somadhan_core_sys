<?php

namespace App\Exports;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;

class ProductsDemoNoteExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
       return new Collection([
            ['name: Product name (required)'],
            ['category: Must match existing or will be created'],
            ['subcategory: Optional'],
            ['brand: Must match existing or will be created'],
            ['unit: piece, kg, litre etc. (required)'],
            ['description: Optional'],
            ['barcode: Optional (auto-generated if empty)'],
            ['variation_name: Optional'],
            ['cost_price: Required'],
            ['b2b_price: Optional'],
            ['b2c_price: Optional'],
            ['size: Required for variations'],
            ['color: Optional'],
            ['model_no: Optional'],
            ['quality: Optional'],
            ['origin: Optional'],
            ['low_stock_alert: Will notify when stock is low'],
            ['stock: Initial stock quantity'],
            ['manufacture_date: Optional'],
            ['expiry_date: Optional'],
            ['branch_id: Your branch ID (required)'],
        ]);
    }
}
