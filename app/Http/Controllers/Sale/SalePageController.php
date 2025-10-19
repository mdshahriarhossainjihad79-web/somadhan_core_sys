<?php

namespace App\Http\Controllers\Sale;

use App\Http\Controllers\Controller;
use App\Models\AccountTransaction;
use App\Models\AdditionalCharge;
use App\Models\AdditionalChargeName;
use App\Models\Affiliator;
use App\Models\AffliateCommission;
use App\Models\Bank;
use App\Models\Branch;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\Customer;
use App\Models\PartyBalance;
use App\Models\PartyStatement;
use App\Models\PosSetting;
use App\Models\PromotionDetails;
use App\Models\Psize;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use App\Models\StockTracking;
use App\Models\SubCategory;
use App\Models\Tax;
use App\Models\Transaction;
use App\Models\Unit;
use App\Models\Variation;
use App\Models\WarehouseSetting;
use App\Models\Warranty;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SalePageController extends Controller
{
    public function index()
    {
        try {
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
                    $query->where('product_type', 'own_goods');
                })
                ->with(['product', 'variationSize', 'colorName', 'stocks.warehouse', 'stocks.racks'])
                ->get();

            $quickPurchaseProducts = Variation::where('productStatus', 'active')
                ->whereHas('product', function ($query) {
                    $query->where('status', 'active');
                    $query->where('product_type', 'via_goods');
                })
                ->with(['product', 'variationSize', 'colorName', 'stocks.warehouse', 'stocks.racks'])
                ->get();

            $banks = Bank::get();
            $taxes = Tax::get();
            $additionalChargeNames = AdditionalChargeName::get();

            $colors = Color::latest()->get();
            $sizes = Psize::latest()->get();
            $units = Unit::latest()->get();
            $categories = Category::where('status', 1)->latest()->get();
            $subcategories = SubCategory::where('status', 1)->latest()->get();
            $brands = Brand::latest()->get();

            $suppliers = Customer::where('branch_id', Auth::user()->branch_id)->where('party_type', '<>', 'customer')->get();


            return Inertia::render('Sale/Sale', [
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
            ]);
        } catch (\Exception $e) {
            // Log the exception message for debugging purposes
            Log::error('Error in index method: ' . $e->getMessage());

            // Return a custom error view with a user-friendly message and a 500 status code
            return response()->view('errors.500', ['message' => 'Something went wrong. Please try again later.'], 500);
        }
    }

    public function generatedInvoiceNumber(Request $request)
    {
        try {
            if ($request->isMethod('post')) {
                // Validate POST request for invoice number
                $request->validate([
                    'invoice_number' => [
                        'required',
                        'digits:6',
                        'numeric',
                    ],
                ]);

                $invoice = $request->input('invoice_number');

                // Check if invoice number exists
                if (Sale::where('invoice_number', $invoice)->exists()) {
                    return response()->json(['status' => 'exists', 'message' => 'Invoice number already exists.'], 422);
                }

                return response()->json(['status' => 'valid', 'invoice' => $invoice]);
            }

            // Handle GET request to generate unique invoice
            $invoice = generate_unique_invoice(Sale::class, 'invoice_number', 6);
            return response()->json(['invoice' => $invoice]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function updatePosSetting(Request $request)
    {
        try {
            $request->validate([
                'field' => 'required|in:barcode,auto_genarate_invoice,affliate_program,elastic_search,sale_hands_on_discount,sale_without_stock,drag_and_drop,color_view,size_view,warranty,via_sale,sale_price_type,rate_kit,rate_kit_type,selling_price_edit,selected_product_alert,discount,tax,sale_with_low_price,multiple_payment,set_default_customer,customer_details_show',
                'value' => 'required',
            ]);

            $setting = Cache::remember('pos_setting', 3600, function () {
                return PosSetting::latest()->first();
            });

            if (!$setting) {
                return response()->json(['error' => 'No POS settings found'], 404);
            }

            // Handle boolean and string values appropriately
            $value = in_array($request->field, ['sale_price_type', 'rate_kit_type'])
                ? $request->value
                : filter_var($request->value, FILTER_VALIDATE_BOOLEAN);

            // Validate sale_price_type and rate_kit_type values
            if ($request->field === 'sale_price_type' && !in_array($request->value, ['b2c_price', 'b2b_price'])) {
                return response()->json(['error' => 'Invalid value for sale_price_type'], 400);
            }
            if ($request->field === 'rate_kit_type' && !in_array($request->value, ['normal', 'party'])) {
                return response()->json(['error' => 'Invalid value for rate_kit_type'], 400);
            }

            $setting->update([$request->field => $value]);
            Cache::put('pos_setting', $setting, 3600);

            return response()->json(['setting' => $setting]);
        } catch (\Exception $e) {
            Log::error('Error updating POS setting: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }


    public function addCustomer(Request $request)
    {
        // dd($request->all());
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'phone' => 'required|unique:users,phone',
                'opening_receivable' => 'nullable|numeric|max_digits:12',
                'address' => 'nullable|string|max:250',
                'email' => 'nullable|email|unique:users,email',
                'credit_limit' => 'nullable|numeric|max_digits:12',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 400,
                    'error' => $validator->messages(),
                ]);
            }

            $customer = new Customer;
            $customer->branch_id = Auth::user()->branch_id;
            $customer->name = $request->name;
            $customer->phone = $request->phone;
            $customer->email = $request->email;
            $customer->address = $request->address;
            $customer->opening_receivable = $request->opening_receivable ?? 0;
            $customer->total_receivable = $request->opening_receivable ?? 0;
            $customer->wallet_balance = $request->opening_receivable ?? 0;
            $customer->credit_limit = $request->credit_limit ?? 0;
            $customer->party_type = 'customer';
            $customer->created_at = Carbon::now();
            $customer->save();

            // if ($request->opening_receivable > 0) {
            //     // ------------------------------------Party Statement-------------------------------//
            //     $party_statement =  new PartyStatement();
            //     $party_statement->branch_id = Auth::user()->branch_id;
            //     $party_statement->date = Carbon::now();
            //     $party_statement->created_by = Auth::user()->id;
            //     $party_statement->reference_type = 'opening_due';
            //     $party_statement->reference_id = null;
            //     $party_statement->party_id = $customer->id;
            //     $party_statement->debit = $request->opening_receivable;
            //     $party_statement->credit  = 0;
            //     $party_statement->save();
            //     // ------------------------------------Party Statement End-------------------------------//
            // }

            return response()->json([
                'status' => 200,
                'message' => 'Successfully Saved',
                'customer' => $customer,
            ]);
        } catch (\Exception $e) {
            Log::error($e);

            return response()->json([
                'status' => 500,
                'error' => 'An unexpected error occurred. Please try again later.',
            ]);
        }
    }

    public function getStockData(Request $request)
    {
        try {
            $request->variant_id;
            $stocks = Stock::where('variation_id', $request->variant_id)->with('warehouse', 'racks')->get();
            return response()->json([
                'status' => 200,
                'data' => $stocks,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating POS setting: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    private function validateSaleRequest(Request $request, string $paymentType = 'none')
    {
        $rules = [
            'customer_id' => 'required|numeric|exists:customers,id',
            'sale_date' => 'required|date',
            'variants' => 'required|array',
            'variants.*.variantId' => 'required|exists:variations,id',
            'variants.*.qty' => 'required|numeric|min:1',
            'invoice_number' => 'nullable|unique:sales,invoice_number',
            'invoice_total' => 'required|numeric|min:0.01',
            'paid' => 'nullable|numeric|min:0',
        ];

        if ($paymentType === 'single' && $request->filled('paid') && $request->paid > 0) {
            $rules['payment_method'] = 'required|numeric|exists:banks,id';
        }

        if ($paymentType === 'multiple') {
            $rules['multiplePaymentMethods'] = 'required|array';
            $rules['multiplePaymentMethods.*.bankId'] = 'required|numeric|exists:banks,id';
            $rules['multiplePaymentMethods.*.amount'] = 'required|numeric|min:0.01';
        }

        return Validator::make($request->all(), $rules, [
            'customer_id.numeric' => 'Please add a valid customer.',
            'customer_id.exists' => 'The selected customer does not exist.',
            'payment_method.exists' => 'The selected payment method does not exist.',
            'multiplePaymentMethods.*.bankId.exists' => 'One or more selected bank IDs do not exist.',
        ]);
    }

    private function saveSaleData(Request $request, $orderStatus = 'completed')
    {

        // dd($request->all());
        $settings = PosSetting::first();
        $variantIds = collect($request->variants)->pluck('variantId');
        $variations = Variation::whereIn('id', $variantIds)->get(['id', 'cost_price']);
        $totalCostPrice = collect($request->variants)->reduce(function ($carry, $variant) use ($variations) {
            $costPrice = $variations->firstWhere('id', $variant['variantId'])->cost_price ?? 0;
            return $carry + ($costPrice * $variant['qty']);
        }, 0);


        $sale = new Sale;
        $sale->branch_id = Auth::user()->branch_id;
        $sale->customer_id = $request->customer_id;
        $sale->sale_date = Carbon::parse($request->sale_date)->format('Y-m-d H:i:s');
        $sale->created_by = Auth::user()->id;
        $sale->invoice_number = $request->invoice_number;
        $sale->quantity = $request->quantity;
        $sale->discount_type = $request->sale_discount_type === "%" ? "percentage" : "fixed";
        $sale->product_total = $request->product_total;
        $sale->invoice_total = $request->invoice_total;
        $sale->discount = $request->discount ?? 0;
        $sale->actual_discount = $request->actual_discount;
        $sale->total_purchase_cost = $totalCostPrice;
        $sale->tax = $request->tax ?? 0;
        $sale->additional_charge_total = $request->additionalChargesTotal;
        $sale->grand_total = $request->grand_total;
        $sale->paid = $request->paid ?? 0;
        if ($request->due > 0) {
            $sale->due = $request->due;
        } else {
            $sale->change_amount = -$request->due;
        }
        $sale->status = ($sale->paid >= $request->invoice_total) ? 'paid' : ($sale->paid > 0 ? 'partial' : 'unpaid');
        $sale->order_status = $orderStatus;
        $sale->profit = $request->invoice_total - $totalCostPrice;
        $sale->note = $request->note;
        $sale->created_at = Carbon::now();
        $sale->save();

        $saleId = $sale->id;

        // Update selling price if enabled
        if ($settings->selling_price_update === 1) {
            foreach ($request->variants as $item) {
                $updateData = [];
                if ($settings->sale_price_type === 'b2b_price') {
                    $updateData['b2b_price'] = $item['price'];
                } elseif ($settings->sale_price_type === 'b2c_price') {
                    $updateData['b2c_price'] = $item['price'];
                }
                if (!empty($updateData)) {
                    Variation::where('id', $item['variantId'])->update($updateData);
                }
            }
        }

        // Save Additional Charges
        if ($request->additionalChargeItems) {
            foreach ($request->additionalChargeItems as $charge) {
                $additional_charge = new AdditionalCharge();
                $additional_charge->reference_id = $saleId;
                $additional_charge->reference_type = "sale";
                $additional_charge->additional_charge_name_id = $charge['additionalChargeId'];
                $additional_charge->amount = $charge['amount'];
                $additional_charge->save();
            }
        }

        // Save Affiliate Commissions
        $commissionsArray = [];
        if ($request->affiliator_id != null) {
            $affiliators = Affiliator::whereIn('id', $request->affiliator_id)->get();
            foreach ($request->affiliator_id as $affiliateId) {
                $affiliate = $affiliators->firstWhere('id', $affiliateId);
                if (!$affiliate) continue;

                $commissionAmount = 0;
                if ($affiliate->commission_type == 'fixed') {
                    $commissionAmount = $affiliate->commission_rate;
                } elseif ($affiliate->commission_type == 'percentage') {
                    $base = ($affiliate->commission_state == 'against_sale_amount') ? $sale->invoice_total : $sale->profit;
                    $commissionAmount = $base * ($affiliate->commission_rate / 100);
                }

                $commissionsArray[] = [
                    'sale_id' => $saleId,
                    'branch_id' => Auth::user()->branch_id,
                    'affiliator_id' => $affiliateId,
                    'commission_amount' => $commissionAmount,
                    'created_at' => Carbon::now(),
                ];
            }
        }

        if ($settings->sale_commission == 1) {
            $saleCommissioner = Affiliator::where('user_id', Auth::user()->id)->first();
            if ($saleCommissioner) {
                $commissionAmount = 0;
                if ($saleCommissioner->commission_type == 'fixed') {
                    $commissionAmount = $saleCommissioner->commission_rate;
                } elseif ($saleCommissioner->commission_type == 'percentage') {
                    $base = ($saleCommissioner->commission_state == 'against_sale_amount') ? $sale->invoice_total : $sale->profit;
                    $commissionAmount = $base * ($saleCommissioner->commission_rate / 100);
                }

                $commissionsArray[] = [
                    'sale_id' => $saleId,
                    'branch_id' => Auth::user()->branch_id,
                    'affiliator_id' => $saleCommissioner->id,
                    'commission_amount' => $commissionAmount,
                    'created_at' => Carbon::now(),
                ];
            }
        }

        if (!empty($commissionsArray)) {
            AffliateCommission::insert($commissionsArray);
        }


        $warrantyArray = [];
        $allVariants = Variation::whereIn('id', $variantIds)->get();
        foreach ($request->variants as $item) {
            $variant = $allVariants->firstWhere('id', $item['variantId']);
            // dd($item['warranty'] !== null);
            $saleItem = SaleItem::create([
                'sale_id' => $saleId,
                'product_id' => $variant->product_id,
                'variant_id' => $variant->id,
                'rate' => $item['price'],
                'qty' => $item['qty'],
                'discount' => $item['discountAmount'] ?? 0,
                'sub_total' => $item['total'],
                'total_purchase_cost' => $variant->cost_price * $item['qty'],
                'total_profit' => $item['total'] - ($variant->cost_price * $item['qty']),
                'created_at' => Carbon::now(),
            ]);

            if (!empty($item['warranty']) && !empty($item['warranty_type'])) {
                $startDate = Carbon::now();
                $endDate = null;

                if ($item['warranty_type'] === 'month') {
                    $endDate = Carbon::now()->addMonths((int) $item['warranty']);
                } elseif ($item['warranty_type'] === 'year') {
                    $endDate = Carbon::now()->addYears((int) $item['warranty']);
                }

                if ($endDate) {
                    $warrantyArray[] = [
                        'branch_id' => Auth::user()->branch_id,
                        'sale_item_id' => $saleItem->id,
                        'sale_id' => $saleId,
                        'product_id' => $variant->product_id,
                        'variant_id' => $variant->id,
                        'duration' => $item['warranty'] . " " . $item['warranty_type'],
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                        'created_at' => Carbon::now(),
                    ];
                }
            }
        }

        if (!empty($warrantyArray)) {
            Warranty::insert($warrantyArray);
        }

        return [
            'saleId' => $saleId,
            'totalCostPrice' => $totalCostPrice,
            'allVariants' => $allVariants,
            'sale' => $sale,
        ];
    }


    protected function handleCommonSaleOperations(Request $request, $saleId, $allVariants, $sale, $branchId)
    {
        $variantIds = collect($request->variants)->pluck('variantId');
        $settings = PosSetting::first();

        process_stock_operations($request->variants, $branchId, $allVariants, $saleId, 'sale', $request->customer_id);

        $paid = $request->paid > $request->grand_total ? $request->grand_total : $request->paid;


        // Update customer balance
        $customer = Customer::findOrFail($request->customer_id);
        $customer->total_receivable += $request->grand_total;
        $customer->total_debit +=  $paid;
        calculate_Balance($customer);


        // ------------------------------------Party Statement-------------------------------//
        $party_statement = new PartyStatement();
        $party_statement->branch_id = Auth::user()->branch_id;
        $party_statement->date = Carbon::parse($request->sale_date)->format('Y-m-d H:i:s');
        $party_statement->created_by = Auth::user()->id;
        $party_statement->reference_type = 'sale';
        $party_statement->reference_id = $sale->id;
        $party_statement->party_id = $request->customer_id;
        $party_statement->debit = $paid ?? 0;
        $party_statement->save();
        // ------------------------------------Party Statement End-------------------------------//


        // SMS Notification
        $dueCalculate = $sale->due;
        if ($settings->sale_sms == 1) {
            $message = $dueCalculate < 0
                ? "Dear {$customer->name}, your sale (Invoice: {$sale->invoice_number}) has been successfully processed. Total Amount: {$request->invoice_total}, Paid: {$request->paid}. Extra Collection: " . abs($dueCalculate) . '. Thank you for your purchase.'
                : "Dear {$customer->name}, your sale (Invoice: {$sale->invoice_number}) has been successfully processed. Total Amount: {$request->invoice_total}, Paid: {$request->paid}. Due : {$dueCalculate}  Thank you for your purchase.";
            $number = $customer->phone;
            $api_key = config('sms.api_key');
            $senderid = config('sms.sender_id');
            $url = config('sms.api_url');
            $data = [
                'api_key' => $api_key,
                'number' => $number,
                'senderid' => $senderid,
                'message' => $message,
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $response = curl_exec($ch);
            curl_close($ch);
            $response = json_decode($response, true);
        }

        // Low Stock Alerts
        $variantStockAlerts = Variation::whereIn('id', $variantIds)
            ->with(['stockQuantity', 'product', 'colorName', 'variationSize'])
            ->get();

        $lowStockVariants = $variantStockAlerts->filter(function ($variation) {
            $stockQuantity = $variation->stockQuantity ? $variation->stockQuantity->stock_quantity : 0;
            return $stockQuantity < $variation->low_stock_alert;
        })->map(function ($variation) {
            $stockQuantity = $variation->stockQuantity ? $variation->stockQuantity->stock_quantity : 0;
            return [
                'id' => $variation->id,
                'stock_quantity' => $stockQuantity,
                'low_stock_alert' => $variation->low_stock_alert,
                'product' => $variation->product ? ['name' => $variation->product->name] : null,
                'color' => $variation->colorName ? ['name' => $variation->colorName->name] : null,
                'size' => $variation->variationSize ? ['name' => $variation->variationSize->size] : null,
            ];
        })->values()->toArray();

        return [
            'status' => 201,
            'saleId' => $saleId,
            'variantStockAlert' => $variantStockAlerts,
            'lowStockVariants' => $lowStockVariants,
            'message' => 'Successfully save',
        ];
    }



    protected function handleAccountTransactions($sale, $saleId, $branchId, $paymentData, $isMultiple = false)
    {
        $accountTransactions = [];
        $bankUpdates = [];

        if ($isMultiple) {
            foreach ($paymentData as $payment) {
                if (!isset($payment['bankId']) || empty($payment['bankId'])) {
                    continue;  // Skip if no bankId
                }
                $accountTransactions[] = [
                    'branch_id' => $branchId,
                    'purpose' => 'sale',
                    'reference_id' => $saleId,
                    'account_id' => $payment['bankId'],
                    'credit' => $payment['amount'] ?? 0,
                    'transaction_id' => generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10),
                    'created_by' => Auth::user()->id,
                    'created_at' => Carbon::now(),
                ];

                $bank = Bank::findOrFail($payment['bankId']);
                $bankUpdates[] = [
                    'id' => $payment['bankId'],
                    'total_credit' => $bank->total_credit + $payment['amount'],
                    'current_balance' => $bank->current_balance + $payment['amount'],
                    'updated_at' => Carbon::now(),
                ];
            }
        } else {
            if (!isset($paymentData['payment_method']) || empty($paymentData['payment_method'])) {
                return;  // Or handle error
            }
            $accountTransactions[] = [
                'branch_id' => $branchId,
                'purpose' => 'sale',
                'reference_id' => $saleId,
                'account_id' => $paymentData['payment_method'],
                'credit' => $paymentData['paid'] ?? 0,
                'transaction_id' => generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10),
                'created_by' => Auth::user()->id,
                'created_at' => Carbon::now(),
            ];

            $bank = Bank::findOrFail($paymentData['payment_method']);
            $bankUpdates[] = [
                'id' => $paymentData['payment_method'],
                'total_credit' => $bank->total_credit + $paymentData['paid'],
                'current_balance' => $bank->current_balance + $paymentData['paid'],
                'updated_at' => Carbon::now(),
            ];
        }

        if (!empty($accountTransactions)) {
            AccountTransaction::insert($accountTransactions);
        }

        if (!empty($bankUpdates)) {
            foreach ($bankUpdates as $bankUpdate) {
                Bank::where('id', $bankUpdate['id'])->update([
                    'total_credit' => $bankUpdate['total_credit'],
                    'current_balance' => $bankUpdate['current_balance'],
                    'updated_at' => $bankUpdate['updated_at'],
                ]);
            }
        }
    }


    public function store(Request $request)
    {
        // dd($request->all());
        try {
            $validator = $this->validateSaleRequest($request, 'single');
            if ($validator->fails()) {
                return response()->json([
                    'status' => 400,
                    'error' => $validator->messages(),
                ]);
            }

            return DB::transaction(function () use ($request) {
                $data = $this->saveSaleData($request, 'completed');
                $saleId = $data['saleId'];
                $allVariants = $data['allVariants'];
                $sale = $data['sale'];
                $branchId = Auth::user()->branch_id;
                $paid = $request->paid > $request->grand_total ? $request->grand_total : $request->paid;
                // Handle account transactions
                $this->handleAccountTransactions($sale, $saleId, $branchId, [
                    'payment_method' => $request->payment_method,
                    'paid' => $paid,
                ]);

                // Handle common sale operations
                $responseData = $this->handleCommonSaleOperations($request, $saleId, $allVariants, $sale, $branchId);

                return response()->json($responseData);
            });
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Product not found.'], 404);
        } catch (Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred.', 'error_message' => $e->getMessage()], 500);
        }
    }

    public function multiplePaySale(Request $request)
    {
        // dd($request->all());
        try {
            $validator = $this->validateSaleRequest($request, 'multiple');
            if ($validator->fails()) {
                return response()->json([
                    'status' => 400,
                    'error' => $validator->messages(),
                ]);
            }

            return DB::transaction(function () use ($request) {
                $data = $this->saveSaleData($request, 'completed');
                $saleId = $data['saleId'];
                $allVariants = $data['allVariants'];
                $sale = $data['sale'];
                $branchId = Auth::user()->branch_id;

                // Handle account transactions
                $this->handleAccountTransactions($sale, $saleId, $branchId, $request->multiplePaymentMethods, true);

                // Handle common sale operations
                $responseData = $this->handleCommonSaleOperations($request, $saleId, $allVariants, $sale, $branchId);

                return response()->json($responseData);
            });
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Product not found.'], 404);
        } catch (Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred.', 'error_message' => $e->getMessage()], 500);
        }
    }

    // draft sale manage
    public function draftSale(Request $request)
    {
        try {
            $validator = $this->validateSaleRequest($request, 'none');
            if ($validator->fails()) {
                return response()->json([
                    'status' => 400,
                    'error' => $validator->messages(),
                ]);
            }

            return DB::transaction(function () use ($request) {
                $data = $this->saveSaleData($request, 'draft');
                $saleId = $data['saleId'];

                return response()->json([
                    'status' => 201,
                    'saleId' => $saleId,
                    'message' => 'Draft saved successfully',
                ]);
            });
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Product not found.'], 404);
        } catch (Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred.', 'error_message' => $e->getMessage()], 500);
        }
    }

    public function printInvoice($id)
    {
        try {
            $sale = Sale::with('saleBy', "additional_charges.additional_charge_name")->findOrFail($id);
            $customer = Customer::findOrFail($sale->customer_id);
            $products = SaleItem::where('sale_id', $sale->id)->with('variant', 'variant.product', 'product', "variant.variationSize", "variant.colorName", 'warranty')->get();
            $setting = PosSetting::latest()->first();
            $returnUrl = request()->query('returnUrl', '/sale-page');

            return Inertia::render('Invoice/InvoicePrint', [
                'sale' => $sale,
                'customer' => $customer,
                'products' => $products,
                'setting' => $setting,
                'returnUrl' => $returnUrl,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in printInvoice method: ' . $e->getMessage());
            return response()->view('errors.500', ['message' => 'Something went wrong. Please try again later.'], 500);
        }
    }

    public function posPrintInvoice($id)
    {
        try {
            $sale = Sale::findOrFail($id);
            $branch = Branch::findOrFail($sale->branch_id);
            $customer = Customer::findOrFail($sale->customer_id);
            $products = SaleItem::where('sale_id', $sale->id)->with('variant', 'variant.product', 'product',)->get();
            $setting = PosSetting::latest()->first();

            return Inertia::render('Invoice/PosPrintInvoice', [
                'sale' => $sale,
                'branch' => $branch,
                'customer' => $customer,
                'products' => $products,
                'setting' => $setting,
                'siteTitle' =>  $setting->company,
                'address' => $setting->address,
                'phone' => $setting->phone,
                'email' => $setting->email,
                'invoice_logo_type' => $setting->invoice_logo_type,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in posPrintInvoice method: ' . $e->getMessage());
            return response()->view('errors.500', ['message' => 'Something went wrong. Please try again later.'], 500);
        }
    }

    public function addSupplier(Request $request)
    {
        // dd($request->all());
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'phone_number' => 'required|unique:users,phone',
                'opening_receivable' => 'nullable|numeric|max_digits:12',
                'opening_payable' => 'nullable|numeric|max_digits:12',
                'address' => 'nullable|string|max:250',
                'email' => 'nullable|email|unique:users,email',
                'credit_limit' => 'nullable|numeric|max_digits:12',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 400,
                    'error' => $validator->messages(),
                ]);
            }

            $supplier = new Customer;
            $supplier->branch_id = Auth::user()->branch_id;
            $supplier->name = $request->name;
            $supplier->phone = $request->phone_number;
            $supplier->email = $request->email;
            $supplier->address = $request->address;
            $supplier->opening_payable = $request->opening_receivable ?? 0;
            $supplier->total_payable = $request->opening_receivable ?? 0;
            $supplier->credit_limit = $request->credit_limit ?? 0;
            $supplier->party_type = 'supplier';
            $supplier->created_at = Carbon::now();
            calculate_Balance($supplier);

            // if ($request->opening_receivable > 0) {
            //     $party_statement =  new PartyStatement();
            //     $party_statement->branch_id = Auth::user()->branch_id;
            //     $party_statement->date = Carbon::now();
            //     $party_statement->created_by = Auth::user()->id;
            //     $party_statement->reference_type = 'opening_due';
            //     $party_statement->reference_id = null;
            //     $party_statement->party_id = $supplier->id;
            //     $party_statement->credit  = $request->opening_receivable;
            //     $party_statement->save();
            // }

            return response()->json([
                'status' => 201,
                'message' => 'Successfully Saved',
                'supplier' => $supplier,
            ]);
        } catch (\Exception $e) {
            Log::error($e);

            return response()->json([
                'status' => 500,
                'error' => 'An unexpected error occurred. Please try again later.',
            ]);
        }
    }

    public function quickPurchase(Request $request)
    {
        // dd($request->all());
        $validated = $request->validate([
            'supplier_id' => 'required|exists:customers,id',
            'products' => 'required|array|min:1',
            'products.*.variantId' => 'required|exists:variations,id',
            'products.*.costPrice' => 'nullable|numeric|min:0',
            'products.*.salePrice' => 'nullable|numeric|min:0',
            'products.*.qty' => 'nullable|integer|min:1',
            'products.*.total' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'paid' => 'nullable|numeric|min:0',
            'due' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|exists:banks,id',
        ]);

        try {
            DB::beginTransaction();

            // purchases 
            $purchase = Purchase::create([
                'branch_id' => Auth::user()->branch_id,
                'party_id' => $validated['supplier_id'],
                'purchase_date' => now(),
                'total_quantity' => array_sum(array_column($validated['products'], 'qty')),
                'total_amount' => $validated['total'],
                'invoice' => null,
                'discount_type' => null,
                'discount_amount' => 0,
                'sub_total' => $validated['total'],
                'tax' => 0,
                'grand_total' => $validated['total'],
                'paid' => $validated['paid'] ?? 0,
                'due' => $validated['due'] ?? 0,
                'total_purchase_cost' => array_sum(array_map(function ($product) {
                    return ($product['costPrice'] ?? 0) * ($product['qty'] ?? 1);
                }, $validated['products'])),
                'payment_status' => $validated['paid'] >= $validated['total'] ? 'paid' : ($validated['paid'] > 0 ? 'partial' : 'unpaid'),
                'order_status' => 'completed',
                'purchase_type' => 'quick',
                'batch_no' => generate_batch_number(),
                'created_by' => Auth::id(),
            ]);

            // purchase_items 
            foreach ($validated['products'] as $product) {
                $variant = Variation::findOrFail($product['variantId']);
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $variant->product_id,
                    'variant_id' => $product['variantId'],
                    'unit_price' => $product['salePrice'] ?? 0,
                    'quantity' => $product['qty'] ?? 1,
                    'discount' => 0,
                    'total_price' => $product['total'] ?? 0,
                ]);

                // dd($request->all());
                $previousStock = Stock::where('variation_id', $variant->id)->get();
                $negativeStock = $previousStock->firstWhere('stock_quantity', '<=', 0);

                if ($negativeStock) {
                    $negativeStock->stock_quantity += $product['qty'];
                    $negativeStock->updated_at = Carbon::now();
                    $negativeStock->save();

                    StockTracking::create([
                        'branch_id' => Auth::user()->branch_id,
                        'product_id' => $variant->product_id,
                        'variant_id' => $product['variantId'],
                        'stock_id' => $negativeStock->id,
                        'batch_number' => $purchase->batch_no ?? '',
                        'reference_type' => 'quick_purchase',
                        'reference_id' => $purchase->id,
                        'quantity' => $product['qty'],
                        'warehouse_id' => $negativeStock->warehouse_id ?? null,
                        'rack_id' => $negativeStock->rack_id ?? null,
                        'party_id' => $validated['supplier_id'] ?? null,
                        'created_by' => Auth::user()->id ?? null,
                        'created_at' => Carbon::now(),
                    ]);
                } else {
                    $stock = new Stock;
                    $stock->branch_id = Auth::user()->branch_id;
                    $stock->product_id = $variant->product->id;
                    $stock->variation_id = $variant->id;
                    $stock->stock_quantity = $product['qty'];
                    $stock->stock_age = Carbon::now()->toDateString();
                    $stock->status = 'available';
                    $hasCurrentStock = $previousStock->contains('is_Current_stock', 1);
                    $stock->is_Current_stock = $hasCurrentStock ? 0 : 1;
                    $stock->save();


                    StockTracking::create([
                        'branch_id' => Auth::user()->branch_id,
                        'product_id' => $variant->product_id,
                        'variant_id' => $product['variantId'],
                        'stock_id' => $stock->id,
                        'batch_number' => $purchase->batch_no ?? '',
                        'reference_type' => 'quick_purchase',
                        'reference_id' => $purchase->id,
                        'quantity' => $product['qty'],
                        'warehouse_id' => $stock->warehouse_id ?? null,
                        'rack_id' => $stock->rack_id ?? null,
                        'party_id' => $validated['supplier_id'] ?? null,
                        'created_by' => Auth::user()->id ?? null,
                        'created_at' => Carbon::now(),
                    ]);
                }
            }


            // ------------------------------------ Party Statement -------------------------------//
            $party_statement = new PartyStatement();
            $party_statement->branch_id = Auth::user()->branch_id;
            $party_statement->date = Carbon::now();
            $party_statement->created_by = Auth::user()->id;
            $party_statement->reference_type = 'purchase';
            $party_statement->reference_id = $purchase->id;
            $party_statement->party_id = $validated['supplier_id'];
            $party_statement->credit = $validated['paid'] ?? 0;
            $party_statement->save();
            // ------------------------------------ Party Statement End -------------------------------//

            $supplier = Customer::findOrFail($request->supplier_id);
            $supplier->total_payable += $validated['total'];
            $supplier->total_credit += $validated['paid'];
            calculate_Balance($supplier);

            if ($validated['paid'] > 0) {
                AccountTransaction::create([
                    'branch_id' => Auth::user()->branch_id,
                    'reference_id' => $purchase->id,
                    'account_id' => $validated['payment_method'],
                    'purpose' => 'quick_purchase',
                    'debit' => $validated['paid'] ?? 0,
                    'transaction_id' => generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10),
                    'created_by' => Auth::user()->id,
                    'created_at' => Carbon::now(),
                ]);


                $bank = Bank::findOrFail($validated['payment_method']);
                $bank->total_debit = $bank->total_debit + $validated['paid'];
                $bank->current_balance = $bank->current_balance - $validated['paid'];
                $bank->save();
            }


            DB::commit();


            return response()->json([
                'status' => 201,
                'message' => 'Purchase Completed Successfully.',
                'purchase' => $purchase,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 500,
                'message' => 'Failed to complete purchase: ' . $e->getMessage(),
            ], 500);
        }
    }


    public function duplicateInvoice($id)
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
                $query->where('product_type', 'own_goods');
            })
            ->with(['product', 'variationSize', 'colorName', 'stocks.warehouse', 'stocks.racks'])
            ->get();

        $quickPurchaseProducts = Variation::where('productStatus', 'active')
            ->whereHas('product', function ($query) {
                $query->where('status', 'active');
                $query->where('product_type', 'via_goods');
            })
            ->with(['product', 'variationSize', 'colorName', 'stocks.warehouse', 'stocks.racks'])
            ->get();

        $banks = Bank::get();
        $taxes = Tax::get();
        $additionalChargeNames = AdditionalChargeName::get();

        $colors = Color::latest()->get();
        $sizes = Psize::latest()->get();
        $units = Unit::latest()->get();
        $categories = Category::where('status', 1)->latest()->get();
        $subcategories = SubCategory::where('status', 1)->latest()->get();
        $brands = Brand::latest()->get();

        $suppliers = Customer::where('branch_id', Auth::user()->branch_id)->where('party_type', '<>', 'customer')->get();
        $sale = Sale::findOrFail($id);
        $saleItems = SaleItem::where("sale_id", $id)->with('variant.product', 'variant.stocks', 'variant.stocks.warehouse', 'variant.stocks.racks', 'variant.variationSize', 'variant.colorName')->get();


        return Inertia::render('Sale/Sale', [
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
            'duplicateSale' => $sale,
            'duplicateSaleItems' => $saleItems,
        ]);
        // } catch (\Exception $e) {
        //     Log::error('Error in posPrintInvoice method: ' . $e->getMessage());
        //     return response()->view('errors.500', ['message' => 'Something went wrong. Please try again later.'], 500);
        // }
    }
}
