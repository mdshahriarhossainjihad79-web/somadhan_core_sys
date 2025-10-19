<?php

namespace App\Helpers;

use App\Models\Stock;
use App\Models\StockTracking;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class StockHelper
{
    /**
     * Deduct stock and handle stock tracking dynamically
     * 
     * @param object $stock
     * @param float &$remainingQty
     * @param int &$remainingStockCount
     * @param array &$stocksToUpdate
     * @param array &$stockTrackingsArray
     * @param int $branchId
     * @param int $variantId
     * @param object $allVariants
     * @param int $referenceId
     * @param string $referenceType
     * @return void
     */
    public static function deductStock($stock, &$remainingQty, &$remainingStockCount, &$stocksToUpdate, &$stockTrackingsArray, $branchId, $variantId, $allVariants, $referenceId, $referenceType = 'sale', $partyId)
    {
        if (!$stock || $remainingQty <= 0) {
            return;
        }

        // Determine deductible quantity
        $deductible = ($remainingStockCount > 1) ? min($remainingQty, $stock->stock_quantity) : $remainingQty;

        // Update stock quantity
        $stock->stock_quantity -= $deductible;
        $remainingQty -= $deductible;

        // Add stock tracking entry
        $stockTrackingsArray[] = [
            'branch_id' => $branchId,
            'product_id' => $allVariants->firstWhere('id', $variantId)->product_id,
            'variant_id' => $variantId,
            'stock_id' => $stock->id,
            'batch_number' => $stock->batch_number ?? null,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'quantity' => -$deductible,
            'warehouse_id' => $stock->warehouse_id ?? null,
            'rack_id' => $stock->rack_id ?? null,
            'party_id' => $partyId ?? null,
            'created_by' => Auth::user()->id ?? null,
            'created_at' => Carbon::now(),
        ];

        // Handle stock deletion or update
        if ($stock->stock_quantity <= 0 && $remainingStockCount > 1) {
            $stock->delete();
            $remainingStockCount--;
            $stockTrackingsArray[count($stockTrackingsArray) - 1]['stock_id'] = null;
        } else {
            $stocksToUpdate[] = [
                'id' => $stock->id,
                'branch_id' => $branchId,
                'stock_quantity' => $stock->stock_quantity,
                'is_Current_stock' => $stock->is_Current_stock
            ];
        }
    }

    /**
     * Process stock operations for a list of variants
     * 
     * @param array $variants
     * @param int $branchId
     * @param object $allVariants
     * @param int $referenceId
     * @param string $referenceType
     * @return array
     */
    public static function processStockOperations($variants, $branchId, $allVariants, $referenceId, $referenceType = 'sale', $partyId)
    {
        $stocksToUpdate = [];
        $stockTrackingsArray = [];

        foreach ($variants as $item) {
            $remainingQty = $item['qty'];
            $variantId = $item['variantId'];
            $stockWarehouseId = isset($item['stockWarehouseId']) ? $item['stockWarehouseId'] : null;

            // Count stock rows for the variant
            $stockRowCount = Stock::where('branch_id', $branchId)
                ->where('variation_id', $variantId)
                ->count();
            $remainingStockCount = $stockRowCount;

            // Process specific warehouse stock if provided
            if ($stockWarehouseId !== null) {
                $specificStock = Stock::where('id', $stockWarehouseId)
                    ->where('branch_id', $branchId)
                    ->where('variation_id', $variantId)
                    ->first();

                self::deductStock($specificStock, $remainingQty, $remainingStockCount, $stocksToUpdate, $stockTrackingsArray, $branchId, $variantId, $allVariants, $referenceId, $referenceType, $partyId);
            }

            // Process current stock
            if ($remainingQty > 0) {
                $currentStock = Stock::where('branch_id', $branchId)
                    ->where('variation_id', $variantId)
                    ->where('is_Current_stock', 1)
                    ->orderBy('created_at', 'asc')
                    ->first();

                self::deductStock($currentStock, $remainingQty, $remainingStockCount, $stocksToUpdate, $stockTrackingsArray, $branchId, $variantId, $allVariants, $referenceId, $referenceType, $partyId);
            }

            // Process remaining stocks
            while ($remainingQty > 0) {
                $nextStock = Stock::where('branch_id', $branchId)
                    ->where('variation_id', $variantId)
                    ->where('is_Current_stock', 0)
                    ->orderBy('created_at', 'asc')
                    ->first();

                if (!$nextStock) {
                    break;
                }

                self::deductStock($nextStock, $remainingQty, $remainingStockCount, $stocksToUpdate, $stockTrackingsArray, $branchId, $variantId, $allVariants, $referenceId, $referenceType, $partyId);
            }
        }

        // Insert stock tracking records
        if (!empty($stockTrackingsArray)) {
            StockTracking::insert($stockTrackingsArray);
        }

        // Update or insert stock records
        if (!empty($stocksToUpdate)) {
            Stock::upsert($stocksToUpdate, ['id'], ['branch_id', 'stock_quantity', 'is_Current_stock']);
        }

        return [
            'stocksToUpdate' => $stocksToUpdate,
            'stockTrackingsArray' => $stockTrackingsArray
        ];
    }
}
