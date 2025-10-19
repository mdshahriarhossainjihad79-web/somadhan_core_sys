<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\AdditionalChargeName;
use App\Models\Affiliator;
use App\Models\Bank;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\Customer;
use App\Models\PosSetting;
use App\Models\PromotionDetails;
use App\Models\Psize;
use App\Models\SubCategory;
use App\Models\Tax;
use App\Models\Unit;
use App\Models\Variation;
use App\Models\WarehouseSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PosPageController extends Controller
{
    public function index()
    {
        // try {
        $user = Auth::user();
        $setting = PosSetting::latest()->first();
        $warehouseSetting = WarehouseSetting::latest()->first();
        $affiliates = Affiliator::where('branch_id', Auth::user()->branch_id)
            ->whereNull('user_id')
            ->get();
        $customers = Customer::where('branch_id', Auth::user()->branch_id)->where('party_type', '<>', 'supplier')->get();
        $products = Variation::where('productStatus', 'active')
            ->whereHas('product', function ($query) {
                $query->where('status', 'active');
            })
            ->with(['product.productUnit', 'variationSize', 'colorName', 'stocks.warehouse', 'stocks.racks', 'variant_promotion.promotion'])
            ->get();

        $quickPurchaseProducts = Variation::where('productStatus', 'active')
            ->whereHas('product', function ($query) {
                $query->where('status', 'active');
                $query->where('product_type', 'via_goods');
            })
            ->with(['product.productUnit', 'variationSize', 'colorName', 'stocks.warehouse', 'stocks.racks'])
            ->get();

        $banks = Bank::get();
        $taxes = Tax::get();
        $additionalChargeNames = AdditionalChargeName::get();

        $colors = Color::latest()->get();
        $sizes = Psize::latest()->get();
        $units = Unit::latest()->get();
        $categories = Category::where('status', 1)
            ->whereHas('products', function ($query) {
                $query->where('status', 'active')
                    ->whereHas('variation');
            })
            ->latest()
            ->get();
        $subcategories = SubCategory::where('status', 1)->latest()->get();
        $brands = Brand::latest()->get();

        $suppliers = Customer::where('branch_id', Auth::user()->branch_id)->where('party_type', '<>', 'customer')->get();

        $promotionDetails = PromotionDetails::with('promotion')->get();

        return Inertia::render('Sale/PosPage', [
            'setting' => $setting,
            'affiliates' => $affiliates,
            'customers' => $customers,
            'products' => $products,
            'banks' => $banks,
            'taxes' => $taxes,
            'warehouseSetting' => $warehouseSetting,
            'additionalChargeNames' => $additionalChargeNames,
            'user' => $user,
            'quickPurchaseProducts' => $quickPurchaseProducts,
            'colors' => $colors,
            'sizes' => $sizes,
            'units' => $units,
            'categories' => $categories,
            'subcategories' => $subcategories,
            'brands' => $brands,
            'suppliers' => $suppliers,
            'promotionDetails' => $promotionDetails,
        ]);
        // } catch (\Exception $e) {
        //     // Log the exception message for debugging purposes
        //     Log::error('Error in index method: ' . $e->getMessage());

        //     // Return a custom error view with a user-friendly message and a 500 status code
        //     return response()->view('errors.500', ['message' => 'Something went wrong. Please try again later.'], 500);
        // }
    }
}
