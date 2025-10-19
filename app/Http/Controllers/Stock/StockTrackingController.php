<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\StockTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class StockTrackingController extends Controller
{
    public function index()
    {
        try {
            $stockTrackings = StockTracking::with([
                'product',
                'branch',
                'warehouse',
                'racks',
                'variation.variationSize',
                'variation.colorName',
                'stock',
                'party',
                'stock_by',
                'reference'
            ])->latest()->get();

            return Inertia::render('Stock/StockTracking', [
                'stockTrackings' => $stockTrackings,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in SaleTable method: ' . $e->getMessage());
            return response()->view('errors.500', ['message' => 'Something went wrong. Please try again later.'], 500);
        }
    }
}
