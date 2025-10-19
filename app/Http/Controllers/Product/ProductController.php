<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Variation;
use App\Services\ImageOptimizerService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    protected $imageService;

    public function __construct(ImageOptimizerService $imageService)
    {
        $this->imageService = $imageService;
    }
    public function store(Request $request)
    {
        // dd($request->all());
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'unit' => 'required|exists:units,id',
                'category_id' => 'nullable|exists:categories,id',
                'subcategory_id' => 'nullable|exists:sub_categories,id',
                'brand_id' => 'nullable|exists:brands,id',
                'description' => 'nullable|string',
                'variation_cost_price' => 'required|numeric|min:0',
                'variation_b2b_price' => 'nullable|numeric|min:0',
                'variation_b2c_price' => 'nullable|numeric|min:0',
                'variation_size' => 'nullable|exists:psizes,id',
                'variation_color' => 'nullable|exists:colors,id',
                'variation_model_no' => 'nullable|string|max:100',
                'variation_quality' => 'nullable|string|max:100',
                'variation_origin' => 'nullable|string|max:100',
                'variation_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 422,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Start a database transaction
            return DB::transaction(function () use ($request) {
                // Create the product
                $product = Product::create([
                    'name' => $request->name,
                    'unit' => $request->unit,
                    'category_id' => $request->category_id,
                    'subcategory_id' => $request->subcategory_id,
                    'brand_id' => $request->brand_id,
                    'description' => $request->description,
                    'product_type' => 'via_goods',
                    'status' => 'active',
                ]);

                // Handle image upload
                $imageName = null;
                if ($request->hasFile('variation_image')) {
                    $destinationPath = public_path('uploads/products');
                    $imageName = $this->imageService->resizeAndOptimize($request->file('variation_image'), $destinationPath);
                }

                $barcode = generate_unique_invoice(Variation::class, 'barcode', 6);

                // Create the variation
                $variation = Variation::create([
                    'product_id' => $product->id,
                    'variation_name' => $request->variant_name ?? $request->name . ' Variant',
                    'barcode' => $barcode, // Generate or set if needed
                    'cost_price' => $request->input('variation_cost_price'),
                    'b2b_price' => $request->input('variation_b2b_price'),
                    'b2c_price' => $request->input('variation_b2c_price'),
                    'size' => $request->input('variation_size'),
                    'color' => $request->input('variation_color'),
                    'model_no' => $request->input('variation_model_no'),
                    'quality' => $request->input('variation_quality'),
                    'image' => $imageName,
                    'origin' => $request->input('variation_origin'),
                    'low_stock_alert' => null,
                    'status' => 'default',
                    'productStatus' => 'active',
                ]);

                $variation = Variation::with(['product', 'variationSize', 'colorName', 'stocks'])
                    ->find($variation->id);

                // Return success response with product and variation data
                return response()->json([
                    'status' => 201,
                    'message' => 'Product and variation created successfully.',
                    'product' => $product,
                    'variation' => $variation,
                ], 201);
            });
        } catch (\Exception $e) {
            Log::error('Error in ProductController::store: ' . $e->getMessage());
            return response()->json([
                'status' => 500,
                'message' => 'Something went wrong. Please try again later.',
            ], 500);
        }
    }
}
