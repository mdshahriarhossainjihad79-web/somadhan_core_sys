<?php

namespace Database\Seeders;

use App\Models\Stock;
use App\Models\StockTracking;
use App\Models\Variation;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Get all variations
        $variations = Variation::all();

        // Loop through each variation
        foreach ($variations as $variation) {
            // Create a stock entry for each variation
            $stock = Stock::create([
                // 'barcode' => $variation->barcode,
                'branch_id' => 1, // Assuming you have a branch with id 1
                'product_id' => $variation->product_id,
                'variation_id' => $variation->id,
                'stock_quantity' => $faker->numberBetween(0, 100),
                'stock_age' => $faker->randomElement(['new', 'old', 'very old']),
                'is_Current_stock' => false,
                'status' => $faker->randomElement(['stock_out', 'available', 'low_stock']),
            ]);

            StockTracking::create([
                'branch_id' => 1,
                'product_id' =>  $variation->product_id,
                'variant_id' => $variation->id,
                'stock_id' => $stock->id,
                'batch_number' => $faker->numberBetween(100000, 999999),
                'reference_type' => 'opening_stock',
                'quantity' => $stock->stock_quantity,
            ]);
        }
    }
}
