<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\WithEvents;
class ProductsDemoExport implements FromCollection, WithStyles
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return new Collection([
            [
            ['name', 'category', 'subcategory', 'brand', 'unit', 'description', 'barcode','variation_name', 'cost_price', 'b2b_price', 'b2c_price', 'size', 'color', 'model_no', 'quality', 'origin', 'low_stock_alert', 'stock', 'manufacture_date', 'expiry_date','branch_id'], // Column headings
        ],
 // Sample row 1
        ['Apple iPhone 13', 'Electronics', 'Smartphones', 'Apple', 'piece', 'Latest iPhone model', '1234567890123', '128GB', 80000, 85000, 90000, '6.1"', 'Blue', 'A2633', 'Premium', 'USA', 10, 50, '2025-01-01', '2027-01-01',1],

        // Sample row 2
        ['Samsung Galaxy A54', 'Electronics', 'Smartphones', 'Samsung', 'piece', 'Mid-range Android phone', '9876543210987', '128GB', 40000, 45000, 50000, '6.4"', 'Black', 'SM-A546E', 'Standard', 'South Korea', 20, 30, '2025-03-01', '2027-03-01',1],

        // Sample row 3
        ['Nestlé Milk Powder', 'Groceries', 'Dairy Products', 'Nestlé', 'kg', 'Full cream milk powder', '3214569870123', '1kg Pack', 450, 480, 500, '1kg', 'White', 'NP-01', 'High', 'Switzerland', 15, 100, '2024-10-01', '2026-10-01',1],
      ]);
    }

    public function headings(): array
    {
        return ['name', 'category', 'subcategory', 'brand', 'unit', 'description', 'barcode', 'variation_name','cost_price', 'b2b_price', 'b2c_price', 'size', 'color', 'model_no', 'quality', 'origin', 'low_stock_alert', 'stock', 'manufacture_date', 'expiry_date','branch_id']; // Column headers for the demo file
    }
    public function styles(Worksheet $sheet)
    {
        // Required columns: A (name), B (category), D (brand), E (unit), I (cost_price), K (b2c_price)
        return [
            'A1' => ['fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'F44336']]], // name
            'B1' => ['fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'F44336']]], // category
            'D1' => ['fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'F44336']]], // brand
            'E1' => ['fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'F44336']]], // unit
            'I1' => ['fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'F44336']]], // cost_price
            'L1' => ['fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'F44336']]], // size
            'U1'  => ['fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'F44336']]],
            // Special fields
            'J1' => ['fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'BBDEFB']]], // b2b_price - Light Blue
            'K1' => ['fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'C8E6C9']]], // b2c_price - Light Green
        ];
    }



}
