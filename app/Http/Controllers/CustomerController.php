<?php

namespace App\Http\Controllers;

use App\Models\AccountTransaction;
use App\Models\Bank;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\LinkPaymentHistory;
use App\Models\PartyStatement;
use App\Models\Sale;
use App\Models\ServiceSale;
use App\Models\Transaction;
use App\Repositories\RepositoryInterfaces\CustomerInterfaces;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    private $customer_repo;

    public function __construct(CustomerInterfaces $customer_interface)
    {
        $this->customer_repo = $customer_interface;
    }

    public function AddCustomer()
    {
        return view('pos.customer.add_customer');
    }

    // End Method
    public function CustomerStore(Request $request)
    {
        $customer = new Customer;
        $customer->branch_id = Auth::user()->branch_id;
        $customer->name = $request->name;
        $customer->phone = $request->phone;
        $customer->email = $request->email;
        $customer->address = $request->address;
        $customer->party_type = 'customer';
        $customer->opening_receivable = $request->wallet_balance ?? 0;
        $customer->total_receivable = $request->wallet_balance ?? 0;
        calculate_Balance($customer);
        $customer->created_at = Carbon::now();
        $customer->save();

        $notification = [
            'message' => 'Customer Created Successfully',
            'alert-type' => 'info',
        ];

        return redirect()->route('customer.view')->with($notification);
        // return redirect()->route('pos.customer.view')->with($notification);
    }

    // End Method
    public function CustomerView()
    {
        if (Auth::user()->role === 'superadmin' || Auth::user()->role === 'admin') {
            $customers = Customer::where('party_type', 'customer')->all();
        } else {
            $customers = Customer::where('branch_id', Auth::user()->branch_id)->where('party_type', 'customer')->latest()->get();
        }

        return view('pos.customer.view_customer', compact('customers'));
    }

    //
    public function CustomerEdit($id)
    {
        $customer = $this->customer_repo->EditCustomer($id);

        return view('pos.customer.edit_customer', compact('customer'));
    }

    //
    public function CustomerUpdate(Request $request, $id)
    {
        $customer = Customer::find($id);
        $customer->branch_id = Auth::user()->branch_id;
        $customer->name = $request->name;
        $customer->phone = $request->phone;
        $customer->email = $request->email;
        $customer->address = $request->address;
        $customer->updated_at = Carbon::now();
        $customer->save();
        $notification = [
            'message' => 'Customer Updated Successfully',
            'alert-type' => 'info',
        ];

        return redirect()->route('customer.view')->with($notification);
    }

    // End Method
    public function CustomerDelete($id)
    {
        Customer::findOrFail($id)->delete();
        $notification = [
            'message' => 'Customer Deleted Successfully',
            'alert-type' => 'info',
        ];

        return redirect()->back()->with($notification);
    }

    // public function CustomerProfile($id)
    // {
    //     $data = Customer::findOrFail($id);
    //     $transactions = Transaction::where('customer_id', $data->id)->get();
    //     $branch = Branch::findOrFail($data->branch_id);
    //     $banks = Bank::latest()->get();
    //     $isCustomer = true;
    //     return view('pos.profiling.profiling', compact('data', 'transactions', 'branch', 'isCustomer', 'banks'));
    // }

    //Single//
    public function getDueInvoice(Request $request, $customerId)
    {
        $transactionId = $request->query('transaction_id');
        $transactions = Transaction::with('customer', 'sale')

            ->where('customer_id', $customerId)
            ->where('balance', '>', 0)
            ->where('particulars', 'like', 'Sale%')
            ->get();


        $openingDueTransaction = Transaction::where('customer_id', $customerId)
            ->where('particulars', 'OpeningDue') // Condition for OpeningDue
            ->where('balance', '>', 0) // Only include if balance > 0
            // ->where('payment_method','=', Null)
            ->first(['id', 'balance', 'date']); // Ret

        // Extract the values or set defaults if no record matches
        if ($transactionId) {
            $specificTransaction = Transaction::where('status', 'unused')->findOrFail($transactionId);
            // dd(  $specificTransaction);
            $transctionAmount =  $specificTransaction->debit ?? 0;
        }
        // dd($transctionAmount);
        $openingDue = $openingDueTransaction->balance ?? 0;
        $openingDueDate = $openingDueTransaction->date ?? null;
        $openingDueId = $openingDueTransaction->id ?? null;

        return response()->json([
            'openingDue' => $openingDue,  // Add opening due to the response data
            'data' => $transactions,
            'openingDueDate' => $openingDueDate,
            'openingDueId' => $openingDueId,
            'transctionUnsedAmount' => $transctionAmount,
        ]);
    }
    //Multiple old due invoice
    public function getDueInvoice2(Request $request, $customerId)
    {

        $transactions = Transaction::with('customer', 'sale')
            ->where('customer_id', $customerId)
            ->where('balance', '>', 0)
            ->where('particulars', 'like', 'Sale%')
            ->get();
        $transactionsUnused = Transaction::where('customer_id', $customerId)->where('particulars', 'party receive')
            ->where('status', 'unused')->get();

        $openingDueTransaction = Transaction::where('customer_id', $customerId)
            ->where('particulars', 'OpeningDue')
            ->where('balance', '>', 0)
            ->first(['id', 'balance', 'date']);

        $openingDue = $openingDueTransaction->balance ?? 0;
        $openingDueDate = $openingDueTransaction->date ?? null;
        $openingDueId = $openingDueTransaction->id ?? null;
        $serviceSaleTransaction = ServiceSale::where('customer_id', $customerId)
            ->where('due', '>', 0)
            ->get();

        return response()->json([
            'openingDue' => $openingDue,  // Add opening due to the response data
            'data' => $transactions,
            'openingDueDate' => $openingDueDate,
            'openingDueId' => $openingDueId,
            'serviceSaleTransaction' => $serviceSaleTransaction,
            'transactionsUnused' => $transactionsUnused,

        ]);
    }

    //////Party Transaction New due invoice//////
    public function duePartyTransactionDueInvoice(Request $request, $customerId)
    {
        $partyStatements = PartyStatement::with(['sale', 'service_sale'])
            ->where('party_id', $customerId)
            ->where(function ($q) {
                $q->where(function ($q2) {
                    $q2->where('reference_type', 'sale')
                        ->whereHas('sale', function ($query) {
                            $query->where('due', '>', 0);
                        });
                })->orWhere(function ($q3) {
                    $q3->where('reference_type', 'service_sale')
                        ->whereHas('service_sale', function ($query) {
                            $query->where('due', '>', 0);
                        });
                });
            })
            ->get();

        $openingDueData = PartyStatement::where('party_id', $customerId)
            ->where('reference_type', 'opening_due') // Condition for OpeningDue
            ->where('debit', '>', 0)
            ->where(function ($query) {
                $query->where('status', 'unused')
                    ->orWhereNull('status');
            })
            ->first();
        $openingDue = $openingDueData->debit ?? 0;
        $openingDueDate = $openingDueData->date ?? null;
        $openingDueId = $openingDueData->id ?? null;

        return response()->json([
            'openingDue' => $openingDue,
            'openingDueDate' => $openingDueDate,
            'openingDueId' => $openingDueId,
            'partyStatements' => $partyStatements
        ]);
    }

    //end
    //Multiple New due invoice
    public function dueMultipleUnusedInvoice(Request $request, $customerId)
    {

        // $transactions = Transaction::with('customer', 'sale')
        //     ->where('customer_id', $customerId)
        //     ->where('balance', '>', 0)
        //     ->where('particulars', 'like', 'Sale%')
        //     ->get();
        // $transactionsUnused = Transaction::where('customer_id', $customerId)->where('particulars', 'party receive')
        //     ->where('status', 'unused')->get();

        // $openingDueTransaction = Transaction::where('customer_id', $customerId)
        //     ->where('particulars', 'OpeningDue')
        //     ->where('balance', '>', 0)
        //     ->first(['id', 'balance', 'date']);

        // $openingDue = $openingDueTransaction->balance ?? 0;
        // $openingDueDate = $openingDueTransaction->date ?? null;
        // $openingDueId = $openingDueTransaction->id ?? null;
        // $serviceSaleTransaction = ServiceSale::where('customer_id', $customerId)
        //     ->where('due', '>', 0)
        //     ->get();

        // return response()->json([
        //     'openingDue' => $openingDue,  // Add opening due to the response data
        //     'data' => $transactions,
        //     'openingDueDate' => $openingDueDate,
        //     'openingDueId' => $openingDueId,
        //     'serviceSaleTransaction' => $serviceSaleTransaction,
        //     'transactionsUnused' => $transactionsUnused,

        // ]);
    }
    public function party()
    {
        $parties = Customer::get();

        return view('pos.party.index', compact('parties'));
    } // End Method

    public function partyStore(Request $request)
    {
        try {
            // Validate the request data
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'phone' => 'required|unique:users,phone',
                'opening_receivable' => 'nullable|numeric|max_digits:12',
                'opening_payable' => 'nullable|numeric|max_digits:12',
                'address' => 'nullable|string|max:250',
                'email' => 'nullable|email|unique:users,email',
            ]);

            // Check if validation fails
            if ($validator->fails()) {
                return response()->json([
                    'status' => 422, // Unprocessable Entity
                    'errors' => $validator->errors(),
                ]);
            }

            // Create a new Supplier instance
            $supplier = new Customer;
            $supplier->name = $request->name;
            $supplier->branch_id = Auth::user()->branch_id;
            $supplier->email = $request->email;
            $supplier->phone = $request->phone;
            $supplier->address = $request->address;
            if ($request->party_type === 'customer') {
                $supplier->opening_receivable = $supplier->total_receivable = $request->opening_receivable ?? 0;
            } elseif ($request->party_type === 'supplier') {
                $supplier->opening_payable = $supplier->total_payable = $request->opening_payable ?? 0;
            } elseif ($request->party_type === 'both') {
                if ($request->opening_payable > 0) {
                    $supplier->opening_payable = $supplier->total_payable = $request->opening_payable ?? 0;
                } elseif ($request->opening_receivable > 0) {
                    $supplier->opening_receivable = $supplier->total_receivable = $request->opening_receivable ?? 0;
                }
            }


            calculate_Balance($supplier);
            $supplier->party_type = $request->party_type;
            $supplier->save();


            // Return a success response
            return response()->json([
                'status' => 200,
                'message' => 'Party saved successfully',
            ], 200);
        } catch (\Exception $e) {
            // Handle any exceptions
            return response()->json([
                'status' => 500,
                'message' => 'An error occurred while saving the supplier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function partyView()
    {
        $suppliers = Customer::latest()->get();
        $firstSupplier = Customer::orderBy('created_at', 'asc')->first();

        return response()->json([
            'status' => 200,
            'firstSupplier' => $firstSupplier,
            'data' => $suppliers,
        ]);
    }
    ///////////////Old Profile //////////////
    public function partyProfile($id)
    {
        $data = Customer::findOrFail($id);
        $transactions = Transaction::where(function ($query) use ($data) {
            $query->where('customer_id', $data->id)
                ->orWhere('supplier_id', $data->id);
        })->get();

        $totalUnusedBalance = Transaction::where('customer_id', $id)
            ->where('particulars', 'party receive')
            ->where('status', 'unused')
            ->sum('debit');
        $branch = Branch::findOrFail($data->branch_id);
        $banks = Bank::latest()->get();

        return view('pos.profiling.profiling', compact('data', 'transactions', 'branch', 'banks', 'totalUnusedBalance'));
    }
    ////////////////New Profile ////////////////////
    public function partyProfileLedger($id)
    {
        $data = Customer::findOrFail($id);
        $party_statements = PartyStatement::where('party_id', $data->id)->get();
        $branch = Branch::findOrFail($data->branch_id);
        $banks = Bank::latest()->get();
        $totalUnusedBalance = PartyStatement::where('party_id', $id)
            ->where('reference_type', 'receive')
            ->where('status', 'unused')
            ->sum('debit');
        return view('pos.profiling.update-profile', compact('data', 'party_statements', 'branch', 'banks', 'totalUnusedBalance'));
    }
    //Single//
    public function partyLinkPayment(Request $request)
    {
        // Validate request inputs
        // dd($request->all());
        $validator = Validator::make($request->all(), [
            'sale_ids' => 'required|json',
            'transaction_id' => 'required',
            'unused_amount' => 'required',
            'customer_id' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'error' => $validator->messages(),
            ], 422);
        }

        try {
            $saleIds = json_decode($request->input('sale_ids'), true);
            $openeingDueTransactionIds = json_decode($request->input('transaction_ids'), true);
            $transactionId = $request->transaction_id;
            $latestFinalBalance = (float) $request->unused_amount;
            $transaction = Transaction::findOrFail($transactionId);


            // Check if transaction is already used
            if ($transaction->status === 'used') {
                return response()->json([
                    'status' => 400,
                    'error' => 'Transaction already used',
                ], 400);
            }
            foreach ($openeingDueTransactionIds as $openingDueTransactionId) {
                if ($latestFinalBalance <= 0) {
                    break;
                }
                $openingDueTransaction = Transaction::findOrFail($openingDueTransactionId);
                // $openingDue = $openingDueTransaction->debit - $openingDueTransaction->credit;
                $openingDue = $openingDueTransaction->balance;
                $allocatedAmount = min($openingDue, $latestFinalBalance);

                if ($allocatedAmount > 0) {
                    // Update the balance (reduce the due amount)
                    $openingDueTransaction->balance -= $allocatedAmount;
                    $openingDueTransaction->credit += $allocatedAmount;

                    $openingDueTransaction->save();

                    // Create LinkPaymentHistory record
                    $linkHistory = new LinkPaymentHistory();
                    $linkHistory->reference_id = $openingDueTransaction->id;
                    $linkHistory->inv_number = 'N/A';
                    $linkHistory->inv_type = 'openingDue';
                    $linkHistory->link_amount = $allocatedAmount;
                    $linkHistory->customer_id = $openingDueTransaction->customer_id;
                    $linkHistory->linked_by = Auth::user()->id;
                    $linkHistory->save();
                    $latestFinalBalance -= $allocatedAmount;
                }
            }

            foreach ($saleIds as $saleId) {
                if ($latestFinalBalance <= 0) {
                    break;
                }

                $sale = Sale::findOrFail($saleId);

                $allocatedAmount = min($sale->due, $latestFinalBalance);
                if ($allocatedAmount > 0) {
                    $sale->paid += $allocatedAmount;
                    $sale->due -= $allocatedAmount;
                    $sale->status = ($sale->due == 0) ? 'paid' : 'partial';
                    $sale->save();

                    // Create LinkPaymentHistory record
                    $linkHistory = new LinkPaymentHistory();
                    $linkHistory->reference_id = $transaction->id;
                    $linkHistory->inv_number = $sale->invoice_number ?? 'N/A';
                    $linkHistory->inv_type = 'sale';
                    $linkHistory->link_amount = $allocatedAmount;
                    $linkHistory->customer_id = $request->customer_id;
                    $linkHistory->linked_by = Auth::user()->id;
                    $linkHistory->save();

                    $latestFinalBalance -= $allocatedAmount;
                }
            }

            // Mark transaction as used only after all allocations are done
            if ($latestFinalBalance < (float) $request->unused_amount) {
                $transaction->status = 'used';
                $transaction->save();
            }

            return response()->json([
                'status' => 200,
                'message' => 'Unused Payment successfully Applied',
                'remaining_balance' => $latestFinalBalance,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'error' => 'An error occurred while processing the payment.',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function linkPaymentHistory()
    {
        $allLinkPayments = LinkPaymentHistory::latest()->get();
        return view('pos.transaction.link_payment_history', compact('allLinkPayments'));
    }
    public function partyTransaction()
    {
        $party_statements = PartyStatement::whereIn('reference_type', ['receive', 'pay'])->get();

        return view('pos.party.party_cash_in_cash_out', compact('party_statements'));
    }
}
