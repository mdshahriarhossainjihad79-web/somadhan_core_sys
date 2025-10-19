<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\PromotionDetails;
use App\Models\Variation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
// use Validator;
use Illuminate\Support\Facades\Validator;

class PromotionController extends Controller
{
    public function PromotionAdd()
    {
        return view('pos.promotion.promotion_add');
    }

    //
    public function PromotionStore(Request $request)
    {
        Promotion::insert([
            'promotion_name' => $request->promotion_name,
            'branch_id' => Auth::user()->branch_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'description' => $request->description,
            'created_at' => Carbon::now(),
        ]);
        $notification = [
            'message' => 'Promotion Added Successfully',
            'alert-type' => 'info',
        ];

        return redirect()->route('promotion.view')->with($notification);
    } // End Method

    public function PromotionView()
    {
        if (Auth::user()->role === 'superadmin' || Auth::user()->role === 'admin') {
            $promotions = Promotion::all();
        } else {
            $promotions = Promotion::where('branch_id', Auth::user()->branch_id)->latest()->get();
        }

        return view('pos.promotion.promotion_view', compact('promotions'));
    }

    // End Method
    public function PromotionEdit($id)
    {
        $promotion = Promotion::findOrFail($id);

        return view('pos.promotion.promotion_edit', compact('promotion'));
    }

    // End Method
    public function PromotionUpdate(Request $request, $id)
    {
        $promotion = Promotion::findOrFail($id)->update([
            'promotion_name' => $request->promotion_name,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'description' => $request->description,
            'updated_at' => Carbon::now(),
        ]);
        $notification = [
            'message' => 'Promotion Updated Successfully',
            'alert-type' => 'info',
        ];

        return redirect()->route('promotion.view')->with($notification);
    }

    // End Method
    public function PromotionDelete($id)
    {
        Promotion::findOrFail($id)->delete();
        $notification = [
            'message' => 'Promotion Deleted Successfully',
            'alert-type' => 'info',
        ];

        return redirect()->route('promotion.view')->with($notification);
    }

    // End Method
    // find
    public function find($id)
    {
        $promotion = Promotion::findOrFail($id);

        return response()->json([
            'status' => 200,
            'data' => $promotion,
        ]);
    } // End Method

    // /////////////////////Start Promotion Details All Method ////////////////////////
    public function PromotionDetailsAdd()
    {
        if (Auth::user()->role === 'superadmin' || Auth::user()->role === 'admin') {
            $product = Product::latest()->get();
            $promotions = Promotion::latest()->get();
        } else {
            $product = Product::where('branch_id', Auth::user()->branch_id)->latest()->get();
            $promotions = Promotion::where('branch_id', Auth::user()->branch_id)->latest()->get();
        }

        return view('pos.promotion.promotion_details_add', compact('product', 'promotions'));
    }

    //
    public function PromotionDetailsStore(Request $request)
    {
        try {

            $validator = Validator::make($request->all(), [
                'promotion_id' => 'required',
                'promotion_type' => 'required|in:wholesale,products,customers,branch,category,subcategory,brand',
                'logic' => 'required_if:promotion_type,!=,wholesale',
                'additional_conditions' => 'nullable',
            ]);


            if ($validator->fails()) {
                return response()->json([
                    'status' => 422,
                    'errors' => $validator->errors(),
                ], 422);
            }


            $promotion_id = $request->promotion_id;
            $promotion_type = $request->promotion_type;
            $logic = $request->logic;
            $additional_conditions = $request->additional_conditions;
            $branch_id = Auth::user()->branch_id;
            $created_at = Carbon::now();


            if ($promotion_type === 'wholesale') {
                $promotionDetails = new PromotionDetails();
                $promotionDetails->branch_id = $branch_id;
                $promotionDetails->promotion_id = $promotion_id;
                $promotionDetails->promotion_type = $promotion_type;
                $promotionDetails->logic = $logic;
                $promotionDetails->additional_conditions = $additional_conditions;
                $promotionDetails->created_at = $created_at;
                $promotionDetails->save();
            } else {

                $logicIds = array_filter(array_map('trim', explode(',', $logic)));


                foreach ($logicIds as $logicId) {
                    $promotionDetails = new PromotionDetails();
                    $promotionDetails->branch_id = $branch_id;
                    $promotionDetails->promotion_id = $promotion_id;
                    $promotionDetails->promotion_type = $promotion_type;
                    $promotionDetails->logic = $logicId;
                    $promotionDetails->additional_conditions = $additional_conditions;
                    $promotionDetails->created_at = $created_at;
                    $promotionDetails->save();
                }
            }


            return response()->json([
                'status' => 200,
                'message' => 'Promotion Details Added Successfully',
            ], 200);
        } catch (\Exception $e) {

            return response()->json([
                'status' => 500,
                'message' => 'An error occurred while adding promotion details.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // End Method
    public function PromotionDetailsView()
    {
        if (Auth::user()->role === 'superadmin' || Auth::user()->role === 'admin') {
            $promotion_details = PromotionDetails::all();
        } else {
            $promotion_details = PromotionDetails::where('branch_id', Auth::user()->branch_id)->latest()->get();
        }

        return view('pos.promotion.promotion_details_view', compact('promotion_details'));
    }

    // End Method
    public function PromotionDetailsEdit($id)
    {
        // $product = Product::latest()->get();
        if (Auth::user()->role === 'superadmin' || Auth::user()->role === 'admin') {
            $promotions = Promotion::latest()->get();
        } else {
            $promotions = Promotion::where('branch_id', Auth::user()->branch_id)->latest()->get();
        }

        $promotion_details = PromotionDetails::findOrFail($id);

        return view('pos.promotion.promotion_details_edit', compact('promotion_details', 'promotions'));
    }

    // End Method
    // public function PromotionDetailsUpdate(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'promotion_id' => 'required',
    //         'promotion_type' => 'required|in:wholesale,products,customers,branch,category,subcategory,brand',
    //         'logic' => 'required_if:promotion_type,!=,wholesale',
    //         'additional_conditions' => 'nullable',
    //     ]);

    //     if ($validator->passes()) {
    //         // dd($request->all());
    //         $promotionalDetails = PromotionDetails::findOrFail($id);
    //         $promotionalDetails->promotion_id = $request->promotion_id;
    //         $promotionalDetails->promotion_type = $request->promotion_type;
    //         $promotionalDetails->logic = $request->logic;
    //         $promotionalDetails->additional_conditions = $request->additional_conditions;
    //         $promotionalDetails->created_at = Carbon::now();
    //         $promotionalDetails->save();

    //         return response()->json([
    //             'status' => 200,
    //             'message' => 'Promotion Details Added Successfully',
    //         ]);
    //     } else {
    //         return response()->json([
    //             'status' => 500,
    //             'errors' => $validator->errors(),
    //         ]);
    //     }
    // }
    public function PromotionDetailsUpdate(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'promotion_id' => 'required|exists:promotions,id',
            'promotion_type' => 'required|in:wholesale,products,customers,branch,category,subcategory,brand',
            'logic' => 'required_if:promotion_type,!=,wholesale|regex:/^[\d,]+$/',
            'additional_conditions' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {

            return DB::transaction(function () use ($request, $id) {

                $promotionalDetails = PromotionDetails::findOrFail($id);


                $logicIds = $request->promotion_type !== 'wholesale'
                    ? array_filter(explode(',', $request->logic))
                    : [$request->logic];


                $promotionalDetails->promotion_id = $request->promotion_id;
                $promotionalDetails->promotion_type = $request->promotion_type;
                $promotionalDetails->logic = $request->promotion_type !== 'wholesale' && !empty($logicIds)
                    ? $logicIds[0]
                    : $request->logic;
                $promotionalDetails->additional_conditions = $request->additional_conditions;
                $promotionalDetails->updated_at = Carbon::now();
                $promotionalDetails->save();


                if ($request->promotion_type !== 'wholesale' && count($logicIds) > 1) {
                    $newRecords = [];
                    for ($i = 1; $i < count($logicIds); $i++) {
                        $newRecords[] = [
                            'branch_id' => Auth::user()->branch_id,
                            'promotion_id' => $request->promotion_id,
                            'promotion_type' => $request->promotion_type,
                            'logic' => $logicIds[$i],
                            'additional_conditions' => $request->additional_conditions,
                            'created_at' => Carbon::now(),
                            'updated_at' => Carbon::now(),
                        ];
                    }

                    PromotionDetails::insert($newRecords);
                }

                return response()->json([
                    'status' => 200,
                    'message' => 'Promotion Details Updated Successfully',
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'An error occurred while updating promotion details.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    //
    public function PromotionDetailsDelete($id)
    {
        PromotionDetails::findOrFail($id)->delete();
        $notification = [
            'message' => 'Promotion Details Deleted Successfully',
            'alert-type' => 'info',
        ];

        return redirect()->route('promotion.details.view')->with($notification);
    }

    public function PromotionDetailsFind(Request $request)
    {
        $type = $request->type;

        if ($type) {
            if ($type == 'wholesale') {
                // $wholesale = Product::where('branch_id', Auth::user()->branch_id)->where('stock', ">", 0)->get();
                $wholesale = Variation::where('productStatus', 'active')
                    ->whereHas('product', function ($query) {
                        $query->where('status', 'active');
                        $query->where('product_type', 'own_goods');
                    })
                    ->get();

                return response()->json([
                    'status' => 200,
                    'wholesale' => $wholesale,
                ]);
            } elseif ($type == 'products') {
                $products = Variation::where('productStatus', 'active')
                    ->whereHas('product', function ($query) {
                        $query->where('status', 'active');
                        $query->where('product_type', 'own_goods');
                    })
                    ->with(['product', 'variationSize', 'colorName', 'stocks'])
                    ->get();

                return response()->json([
                    'status' => 200,
                    'products' => $products,
                ]);
            } elseif ($type == 'customers') {
                $customers = Customer::where('party_type', 'customer')->where('branch_id', Auth::user()->branch_id)->get();

                return response()->json([
                    'status' => 200,
                    'customers' => $customers,
                ]);
            } elseif ($type == 'branch') {
                $branch = Branch::get();

                return response()->json([
                    'status' => 200,
                    'branch' => $branch,
                ]);
            } elseif ($type == 'category') {
                $categories = Category::where('status', 1)->with('subcategories')->get();

                return response()->json([
                    'status' => 200,
                    'categories' => $categories,
                ]);
            } elseif ($type == 'brand') {
                $brands = Brand::get();

                return response()->json([
                    'status' => 200,
                    'brands' => $brands,
                ]);
            } else {
                return response()->json([
                    'status' => 200,
                    'message' => 'Data not found',
                ]);
            }
        } else {
            return response()->json([
                'status' => 500,
                'message' => 'Data not found',
            ]);
        }
    }

    public function allProduct()
    {
        $products = Variation::where('productStatus', 'active')
            ->whereHas('product', function ($query) {
                $query->where('status', 'active');
                $query->where('product_type', 'own_goods');
            })
            ->with(['product', 'variationSize', 'colorName', 'stocks'])
            ->get();

        return response()->json([
            'status' => 200,
            'products' => $products,
        ]);
    }

    public function allCustomers()
    {
        $customers = Customer::where('party_type', 'customer')->where('branch_id', Auth::user()->branch_id)->get();

        return response()->json([
            'status' => 200,
            'customers' => $customers,
        ]);
    }

    public function allBranch()
    {
        $branch = Branch::get();

        return response()->json([
            'status' => 200,
            'branch' => $branch,
        ]);
    }

    public function getCategories()
    {
        $categories = Category::where('status', 1)->get(['id', 'name']);

        return response()->json([
            'status' => 200,
            'categories' => $categories,
        ]);
    }

    public function getBrands()
    {
        $brands = Brand::get(['id', 'name']);

        return response()->json([
            'status' => 200,
            'brands' => $brands,
        ]);
    }
}
