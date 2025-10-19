<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ProductsDemoMultiSheetExport implements WithMultipleSheets
{
    /**
    * @return \Illuminate\Support\Collection
    */
     public function sheets(): array
    {
        return [
            'Demo Data' => new ProductsDemoExport(),
            'Notes'     => new ProductsDemoNoteExport(),
        ];
    }
}
