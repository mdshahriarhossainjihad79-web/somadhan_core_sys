<?php

namespace App\Exports;

use App\Models\Sale;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Spatie\QueryBuilder\QueryBuilder;

class SalesExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return QueryBuilder::for(Sale::class)
            ->with(['customer', 'saleBy', 'accountReceive'])
            ->get();
    }

    public function headings(): array
    {
        return [
            'SL No',
            'Invoice Number',
            'Customer',
            'Quantity',
            'Date',
            'Total',
            'Discount',
            'Receivable',
            'Paid',
            'Due',
            'Purchase Cost',
            'Profit',
            'Receive Account',
            'Sale By',
            'Status',
            'Sale Status',
        ];
    }
}
