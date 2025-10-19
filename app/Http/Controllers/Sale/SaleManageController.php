<?php

namespace App\Http\Controllers\Sale;

use App\Http\Controllers\Controller;
use App\Models\AccountTransaction;
use App\Models\Bank;
use App\Models\Customer;
use App\Models\PartyStatement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Sale;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class SaleManageController extends Controller
{
    public function saleTable()
    {
        try {
            // $startDate = Carbon::now()->subMonth()->startOfDay();
            // $endDate = Carbon::now()->endOfDay();
            // $sales = Sale::with('customer', 'saleBy', 'saleItem', 'accountReceive')
            //     ->whereBetween('sale_date', [$startDate, $endDate])
            //     ->latest()
            //     ->get();
            $sales = Sale::with('customer', 'saleBy', 'saleItem', 'accountReceive.bank')
                ->latest()
                ->get();
            $accounts = Bank::select('id', 'name')->get();

            return Inertia::render('SaleManage/SaleManagePage', [
                'sales' => $sales,
                'accounts' => $accounts,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in SaleTable method: ' . $e->getMessage());
            return response()->view('errors.500', ['message' => 'Something went wrong. Please try again later.'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            // if (!Auth::user()->hasPermissionTo('pos-manage.delete')) {
            //     session()->flash('error', 'Unauthorized to delete invoice.');
            //     return redirect()->back();
            // }

            $sale = Sale::findOrFail($id);
            $sale->delete();

            session()->flash('success', 'Invoice deleted successfully.');
            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Error deleting sale: ' . $e->getMessage());
            session()->flash('error', 'Failed to delete invoice. Please try again.');
            return redirect()->back();
        }
    }


    public function salePayment(Request $request, $id)
    {
        // dd($request->all());
        $validator = Validator::make($request->all(), [
            'transaction_account' => 'required',
            'amount' => 'required|numeric|min:0',
        ]);

        $validator->after(function ($validator) use ($id, $request) {
            $sale = Sale::findOrFail($id);
            if ($request->amount > $sale->due) {
                $validator->errors()->add('amount', 'The amount cannot be greater than the due amount.');
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'error' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $sale = Sale::findOrFail($id);
            $sale->paid = $sale->paid + $request->amount;
            $sale->due = $sale->due - $request->amount;
            $sale->status = $sale->due > 0 ? 'partial' : 'paid';
            $sale->save();

            $customer = Customer::findOrFail($sale->customer_id);
            $customer->total_debit += $request->amount;
            calculate_Balance($customer);

            // ------------------------------------Party Statement-------------------------------//
            $party_statement = new PartyStatement();
            $party_statement->branch_id = Auth::user()->branch_id;
            $party_statement->date = Carbon::parse($request->payment_date)->format('Y-m-d H:i:s');
            $party_statement->created_by = Auth::user()->id;
            $party_statement->reference_type = 'sale';
            $party_statement->reference_id = $sale->id;
            $party_statement->party_id = $customer->id;
            $party_statement->debit = $request->amount ?? 0;
            $party_statement->save();
            // ------------------------------------Party Statement End-------------------------------//

            $accountTransaction = new AccountTransaction();
            $accountTransaction->branch_id = Auth::user()->branch_id;
            $accountTransaction->purpose = 'sale';
            $accountTransaction->reference_id = $id;
            $accountTransaction->account_id = $request->transaction_account;
            $accountTransaction->credit = $request->amount;
            $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
            $accountTransaction->created_at = Carbon::now();
            $accountTransaction->created_by = Auth::user()->id;
            $accountTransaction->save();

            $bank = Bank::findOrFail($request->transaction_account);
            $bank->total_credit += $request->amount;
            $bank->current_balance += $request->amount;
            $bank->save();

            return response()->json([
                'status' => 200,
                'message' => 'Payment Successful',
                'sales' => Sale::with(['customer', 'accountReceive', 'saleBy'])->get(),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error processing payment: ' . $e->getMessage());
            return response()->json([
                'status' => 500,
                'error' => 'Failed to process payment. Please try again.',
            ], 500);
        }
    }

    public function searchSales(Request $request)
    {
        try {
            $query = $request->input('query', '');
            $page = $request->input('page', 1);
            $perPage = $request->input('per_page', 10);
            $cacheKey = "sales_search_{$query}_{$page}_{$perPage}";

            $sales = Cache::remember($cacheKey, 60, function () use ($query, $perPage, $page) {
                return Sale::with('customer', 'saleBy', 'saleItem', 'accountReceive')
                    ->when($query, function ($queryBuilder, $query) {
                        return $queryBuilder->where(function ($q) use ($query) {
                            $q->where('id', 'like', "%{$query}%")
                                ->orWhere('invoice_number', 'like', "%{$query}%")
                                ->orWhereHas('customer', function ($q) use ($query) {
                                    $q->where('name', 'like', "%{$query}%");
                                })
                                ->orWhereHas('saleBy', function ($q) use ($query) {
                                    $q->where('name', 'like', "%{$query}%");
                                })
                                ->orWhereHas('accountReceive', function ($q) use ($query) {
                                    $q->where('name', 'like', "%{$query}%");
                                })
                                ->orWhere('status', 'like', "%{$query}%")
                                ->orWhere('order_status', 'like', "%{$query}%")
                                ->orWhere('courier_status', 'like', "%{$query}%")
                                ->orWhere('order_type', 'like', "%{$query}%")
                                ->orWhere('quantity', 'like', "%{$query}%")
                                ->orWhere('total', 'like', "%{$query}%")
                                ->orWhere('discount', 'like', "%{$query}%")
                                ->orWhere('additional_charge_total', 'like', "%{$query}%")
                                ->orWhere('receivable', 'like', "%{$query}%")
                                ->orWhere('paid', 'like', "%{$query}%")
                                ->orWhere('due', 'like', "%{$query}%")
                                ->orWhere('total_purchase_cost', 'like', "%{$query}%")
                                ->orWhere('profit', 'like', "%{$query}%");
                        });
                    })
                    ->latest()
                    ->paginate($perPage, ['*'], 'page', $page);
            });

            return response()->json([
                'sales' => $sales->items(),
                'total' => $sales->total(),
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in searchSales method: ' . $e->getMessage());
            return response()->json(['error' => 'Something went wrong'], 500);
        }
    }
}
