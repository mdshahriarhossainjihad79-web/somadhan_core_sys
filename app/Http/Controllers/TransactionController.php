<?php

namespace App\Http\Controllers;

use App\Models\AccountTransaction;
use App\Models\Bank;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Investor;
use App\Models\LinkPaymentHistory;
use App\Models\PartyStatement;
use App\Models\PosSetting;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\ServiceSale;
use App\Models\Supplier;
use App\Models\Transaction;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public function TransactionAdd()
    {
        if (Auth::user()->role == 'superadmin' || Auth::user()->role == 'admin') {
            $supplier = Customer::where('party_type', 'supplier')->latest()->get();
            $customer = Customer::where('party_type', 'customer')->latest()->get();
            $paymentMethod = Bank::all();
            $investors = Investor::latest()->get();
            $transaction = Transaction::latest()->get();
        } else {
            $supplier = Customer::where('party_type', 'supplier')->where('branch_id', Auth::user()->branch_id)->latest()->get();
            $customer = Customer::where('party_type', 'customer')->where('branch_id', Auth::user()->branch_id)->latest()->get();
            $paymentMethod = Bank::where('branch_id', Auth::user()->branch_id)->latest()->get();
            $investors = Investor::where('branch_id', Auth::user()->branch_id)->latest()->get();
            $transaction = Transaction::where('branch_id', Auth::user()->branch_id)->latest()->get();
        }

        return view('pos.transaction.transaction_add', compact('paymentMethod', 'supplier', 'customer', 'transaction', 'investors'));
    }

    //
    // public function TransactionView(){
    //     return view('pos.transaction.transaction_view');
    // }
    public function getDataForAccountId(Request $request)
    {
        $accountId = $request->input('id');
        $account_type = $request->input('account_type');
        // dd($account_type);
        // dd($accountId);
        // if ($account_type == "supplier") {
        //     $info = Customer::findOrFail($accountId);
        //     $count = Purchase::where('supplier_id', $accountId)->where('due', '>', 0)->count();
        // } elseif ($account_type == "customer") {
        //     $info = Customer::findOrFail($accountId);
        //     $count = '-';
        // }
        if ($account_type == 'other') {
            $info = Investor::findOrFail($accountId);
            $count = '-';
        }

        return response()->json([
            'info' => $info,
            'count' => $count,
        ]);
    }

    // End function
    public function TransactionStore(Request $request)
    {
        // dd($request->all());
        $request->validate([
            'payment_method' => 'required',
            'amounts' => 'required',
            'debit' => ['numeric', 'max:12'],
            'credit' => ['numeric', 'max:12'],
        ]);
        $paymentMethods = $request->input('payment_method', []);
        $amounts = $request->input('amounts', []);
        $notification = ['message' => '', 'alert-type' => ''];


        foreach ($paymentMethods as $paymentMethod) {
            $amount = isset($amounts[$paymentMethod]) ? (float) $amounts[$paymentMethod] : 0;

            $oldBalance = Bank::where('id', $paymentMethod)
                ->latest()
                ->first();
            $investor = Investor::findOrFail($request->account_id);
            if ($request->transaction_type == 'pay') {
                // Create Transaction record
                Transaction::create([
                    'branch_id' => Auth::user()->branch_id,
                    'date' => $request->date,
                    'processed_by' => Auth::user()->id,
                    'payment_type' => $request->transaction_type,
                    'investor_id' => $investor->id,
                    'debit' => $amount,
                    'note' => $request->note,
                ]);

                // Update Investor

                $currentBalance = $investor->wallet_balance;
                $newBalance = $currentBalance - $amount;
                $oldDebit = $investor->debit + $amount;
                $investor->update([
                    'type' => $request->type,
                    'debit' => $oldDebit,
                    'wallet_balance' => $newBalance,
                ]);
                $oldBalance->total_debit +=  $amount;
                $oldBalance->current_balance -=  $amount;
                $oldBalance->save();
                // Create AccountTransaction
                AccountTransaction::create([
                    'branch_id' => Auth::user()->branch_id,
                    'reference_id' => $investor->id,
                    'created_by' => Auth::user()->id,
                    'purpose' => 'investor_pay',
                    'account_id' => $paymentMethod,
                    'debit' => $amount,
                    'transaction_id' => generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10),
                    'created_at' => Carbon::now(),
                ]);
            } elseif ($request->transaction_type == 'receive') {
                // Create Transaction record
                Transaction::create([
                    'branch_id' => Auth::user()->branch_id,
                    'date' => $request->date,
                    'processed_by' => Auth::user()->id,
                    'payment_type' => $request->transaction_type,
                    'investor_id' => $investor->id,
                    'credit' => $amount,

                    'note' => $request->note,
                ]);

                // Update Investor
                $investor = Investor::findOrFail($request->account_id);
                $currentBalance = $investor->wallet_balance;
                $newBalance = $currentBalance + $amount;
                $oldCredit = $investor->credit + $amount;
                $investor->update([
                    'type' => $request->type,
                    'credit' => $oldCredit,
                    'wallet_balance' => $newBalance,
                ]);
                $oldBalance->total_credit += $amount;
                $oldBalance->current_balance += $amount;
                $oldBalance->save();
                // Create AccountTransaction
                $accountTransaction = new AccountTransaction;
                $accountTransaction->branch_id = Auth::user()->branch_id;
                $accountTransaction->reference_id = $investor->id;
                $accountTransaction->created_by =  Auth::user()->id;
                $accountTransaction->purpose = 'investor_receive';
                $accountTransaction->account_id = $paymentMethod;
                $accountTransaction->credit = $amount;
                $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
                $accountTransaction->created_at = Carbon::now();
                $accountTransaction->save();
            }
        }

        // Success notification
        $notification = [
            'message' => 'Investment Processed Successfully',
            'alert-type' => 'info',
        ];

        return redirect()->back()->with($notification);
    }


    public function TransactionDelete($id)
    {
        Transaction::find($id)->delete();
        $notification = [
            'message' => 'Transaction Deleted Successfully',
            'alert-type' => 'info',
        ];

        return redirect()->back()->with($notification);
    }

    //
    public function TransactionFilterView(Request $request)
    {
        // $customerName="";
        // $suplyerName="";
        // if($request->filterCustomer == 'Select Customer'){
        //     $customerName = null;
        // }
        // if($request->filterSupplier == 'Select Supplier'){
        //     $suplyerName = null;
        // }
        $transaction = Transaction::when($request->filterCustomer != 'Select Customer', function ($query) use ($request) {
            return $query->where('customer_id', $request->filterCustomer);
        })
            ->when($request->filterSupplier != 'Select Supplier', function ($query) use ($request) {
                return $query->where('supplier_id', $request->filterSupplier);
            })
            ->when($request->startDate && $request->endDate, function ($query) use ($request) {
                return $query->whereBetween('date', [$request->startDate, $request->endDate]);
            })
            ->get();

        return view('pos.transaction.transaction-filter-rander-table', compact('transaction'))->render();
    }

    public function TransactionInvoiceReceipt($id)
    {
        $transaction = Transaction::findOrFail($id);

        return view('pos.transaction.invoice', compact('transaction'));
    }

    public function InvestmentStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'phone' => 'required',
        ]);
        if ($validator->passes()) {
            $investor = new Investor;
            $investor->branch_id = Auth::user()->branch_id;
            $investor->name = $request->name;
            $investor->phone = $request->phone;
            $investor->created_at = Carbon::now();
            $investor->save();

            return response()->json([
                'status' => 200,
                'message' => 'Successfully Save',
            ]);
        } else {
            return response()->json([
                'status' => '500',
                'error' => $validator->messages(),
            ]);
        }
    }

    public function GetInvestor()
    {
        if (Auth::user()->role === 'superadmin' || Auth::user()->role === 'admin') {
            $data = Investor::latest()->get();
        } else {
            $data = Investor::where('branch_id', Auth::user()->branch_id)->latest()->get();
        }

        return response()->json([
            'status' => 200,
            'message' => 'Successfully save',
            'allData' => $data,
        ]);
    }

    public function getParty()
    {
        if (Auth::user()->role === 'superadmin' || Auth::user()->role === 'admin') {
            $data = Customer::latest()->get();
        } else {
            $data = Customer::where('branch_id', Auth::user()->branch_id)->latest()->get();
        }

        return response()->json([
            'status' => 200,
            'message' => 'Successfully save',
            'allData' => $data,
        ]);
    }

    public function InvestorInvoice($id)
    {
        $investors = Investor::findOrFail($id);

        return view('pos.investor.investor-invoice', compact('investors'));
    }

    public function invoicePaymentStore(Request $request)
    {
        // dd($request->all());
        // dd($request->isCustomer === 'both');
        $validator = Validator::make($request->all(), [
            'payment_balance' => 'required',
            'account' => 'required',
        ]);

        if ($validator->passes()) {

            //////////   Party Statement Create   ///////////
            $statement =  PartyStatement::create([
                'branch_id' => Auth::user()->branch_id,
                'created_by' => Auth::user()->id,
                'date' =>  Carbon::now(),
                'reference_type' => 'receive',
                'debit' =>  $request->payment_balance,
                'credit' => 0,
                'note' => $request->note,
                'party_id' => $request->data_id,
                'status' => 'unused',
            ]);
            // Account Transaction Table
            $accountTransaction = new AccountTransaction;
            $accountTransaction->branch_id = Auth::user()->branch_id;
            $accountTransaction->account_id = $request->account;
            $accountTransaction->created_by =  Auth::user()->id;
            $accountTransaction->reference_id = $statement->id;
            $accountTransaction->purpose = 'party_receive';
            $accountTransaction->credit = $request->payment_balance;
            $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);

            $oldBalance = Bank::where('id', $request->account)->latest()->first();
            $customer = Customer::findOrFail($request->data_id);
            $customer->total_debit +=  $request->payment_balance;
            calculate_Balance($customer);

            $oldBalance->total_credit += $request->payment_balance;
            $oldBalance->current_balance += $request->payment_balance;

            //-------------------SMS----------------//
            $settings = PosSetting::first();
            $invoicePayment_sms = $settings->profile_payment_sms;
            if ($invoicePayment_sms == 1) {
                $number = $customer->phone;
                $api_key = '0yRu5BkB8tK927YQBA8u';
                $senderid = '8809617615171';
                $message = "Dear {$customer->name}, your invoice payment has been successfully completed. Paid Amount: {$request->payment_balance}. Thank you for your payment.";
                $url = 'http://bulksmsbd.net/api/smsapi';
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
            // -------------------SMS--------------------//

            $accountTransaction->save();
            $oldBalance->save();

            return response()->json([
                'status' => 200,
                'message' => 'Successfully Payment',
            ]);
        } else {
            return response()->json([
                'status' => '500',
                'error' => $validator->messages(),
            ]);
        }
    }

    public function linkInvoicePaymentStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_balance' => 'required',

        ]);

        if ($validator->passes()) {

            $saleIds = json_decode($request->input('sale_ids'), true);
            $transactionIds = json_decode($request->input('transaction_ids'), true);
            $serviceIds = json_decode($request->input('Service_ids'), true);
            $unused_ids = json_decode($request->input('unused_ids'), true);
            $transaction = Transaction::whereIn('id', $transactionIds)->first(); // Get the first transaction
            $latestFinalBalance = (float) $request->payment_balance;
            $customer = Customer::findOrFail($request->data_id); // Customer খুঁজে রাখুন
            //Unused Id //
            $totalUnusedAmount = Transaction::whereIn('id', $unused_ids)->where('status', 'unused')->sum('debit');
            $unusedAmounts = [];
            foreach ($unused_ids as $unused_id) {
                if ($latestFinalBalance <= 0) {
                    break;
                }
                $transaction_id = Transaction::findOrFail($unused_id);
                $unusedAmounts[$unused_id] = $transaction_id->debit;
                $transaction_id->status = 'used';
                $transaction_id->save();
                // Unused Id end //
                if ($transaction) {
                    $prevDueBal = min($latestFinalBalance, $transaction->balance);
                    $transaction->balance -= $prevDueBal;
                    $transaction->credit += $prevDueBal;
                    $latestFinalBalance -= $prevDueBal;
                    $transaction->save();
                    $linkHistory = new LinkPaymentHistory();
                    $linkHistory->reference_id = $transaction->id;
                    $linkHistory->inv_number = 'N/A';
                    $linkHistory->inv_type = 'openingDue';
                    $linkHistory->link_amount = $prevDueBal;
                    $linkHistory->customer_id = $transaction->customer_id;
                    $linkHistory->linked_by = Auth::user()->id;
                    $linkHistory->save();
                } else {
                    $prevDueBal = 0;
                }
                foreach ($serviceIds as $serviceId) {
                    if ($latestFinalBalance <= 0) {
                        break;
                    }
                    $serviceSale = ServiceSale::findOrFail($serviceId);
                    $amountDiff = min($serviceSale->due, $latestFinalBalance);
                    if ($serviceSale) {
                        $serviceSale->paid += $amountDiff;
                        $serviceSale->due -= $amountDiff;
                        $serviceSale->save();
                        $latestFinalBalance -= $amountDiff;
                    }
                }
                foreach ($saleIds as $saleId) {
                    if ($latestFinalBalance <= 0) {
                        break;
                    }
                    $sale = Sale::findOrFail($saleId);
                    $amountDiff = min($sale->due, $latestFinalBalance);

                    if ($sale) {
                        $sale->paid += $amountDiff;
                        $sale->due -= $amountDiff;
                        $sale->status = ($sale->due == 0) ? 'paid' : 'partial';
                        $sale->save();
                        $latestFinalBalance -= $amountDiff;
                        $remainingSaleAmount = $amountDiff;
                        foreach ($unused_ids as $unused_id) {
                            if ($remainingSaleAmount <= 0) {
                                break;
                            }
                            if ($unusedAmounts[$unused_id] <= 0) {
                                continue;
                            }

                            $allocatedAmount = min($remainingSaleAmount, $unusedAmounts[$unused_id]);
                            $unusedAmounts[$unused_id] -= $allocatedAmount;
                            $remainingSaleAmount -= $allocatedAmount;

                            // Create LinkPaymentHistory for unused payment linked to sale
                            $linkHistory = new LinkPaymentHistory();
                            $linkHistory->reference_id = $unused_id;
                            $linkHistory->inv_number = $sale->invoice_number ?? 'N/A';
                            $linkHistory->inv_type = 'sale';
                            $linkHistory->link_amount = $allocatedAmount;
                            $linkHistory->customer_id = $request->data_id;
                            $linkHistory->linked_by = Auth::user()->id;
                            $linkHistory->save();
                        }
                    }
                }
                $settings = PosSetting::first();
                $linkInvoicePayment_sms = $settings->link_invoice_payment_sms;
                if ($linkInvoicePayment_sms == 1) {
                    $number = $customer->phone;
                    $api_key = '0yRu5BkB8tK927YQBA8u';
                    $senderid = '8809617615171';
                    $message = "Dear {$customer->name}, your Link invoice payment has been successfully completed. Paid Amount: {$request->payment_balance}. Thank you for your payment.";
                    $url = 'http://bulksmsbd.net/api/smsapi';
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
                // transaction
                // $latestUpdateBal =  $request->payment_balance - $totalUnusedAmount ;
                // dd($latestUpdateBal);
                // $transaction = new Transaction;
                // $transaction->branch_id = Auth::user()->branch_id;
                // $transaction->date = Carbon::now();
                // //- $transaction->processed_by =  Auth::user()->id; -//
                // $transaction->payment_type = 'receive';
                // $transaction->payment_method = $request->account;
                // // $transaction->credit = $request->payment_balance - $prevDueBal;
                // $transaction->credit =  $latestUpdateBal ;
                // $transaction->debit = 0;
                // $transaction->balance = $transaction->debit - $transaction->credit ?? 0;
                // $transaction->note = $request->note;
                // $transaction->status = 'used';

                // Account Transaction Table
                // $accountTransaction = new AccountTransaction;
                // $accountTransaction->branch_id = Auth::user()->branch_id;
                // $accountTransaction->account_id = $request->account;
                //  $accountTransaction->processed_by  =  Auth::user()->id;

                // $oldBalance = AccountTransaction::where('account_id', $request->account)->latest('created_at')->first();
                // dd($request->isCustomer);
                // if ($request->isCustomer === 'customer'  || $request->isCustomer === 'both' ) {
                // transaction //
                // $transaction->particulars = 'SaleDue';
                // $transaction->customer_id = $request->data_id;

                // // Customer Table
                // $customer = Customer::findOrFail($request->data_id);
                // $newBalance = $customer->wallet_balance -  $latestUpdateBal ;
                // $newPayable = $customer->total_payable + $latestUpdateBal;
                // $customer->update([
                //     'wallet_balance' => $newBalance,
                //     'total_payable' => $newPayable,
                // ]);

                // $accountTransaction->purpose = 'SaleDue';
                // $accountTransaction->credit =  $latestUpdateBal;
                // if ($oldBalance) {
                //     $accountTransaction->balance = $oldBalance->balance +  $latestUpdateBal;
                // } else {
                //     $accountTransaction->balance =  $latestUpdateBal;
                // }
                // $accountTransaction->save();
                // $transaction->save();
                // -------------------SMS--------------------//

                // -------------------SMS--------------------//
                // } else {
                // if ($oldBalance && $oldBalance->balance > 0 && $oldBalance->balance >=  $latestUpdateBal) {
                //     // transaction update
                //     $transaction->particulars = 'PurchaseDue';
                //     $transaction->supplier_id = $request->data_id;

                //     // supplier Crud
                //     $supplier = Customer::findOrFail($request->data_id);
                //     $newBalance = $supplier->wallet_balance -  $latestUpdateBal;
                //     $newPayable = $supplier->total_payable +  $latestUpdateBal;
                //     $supplier->update([
                //         'wallet_balance' => $newBalance,
                //         'total_payable' => $newPayable,
                //     ]);

                //     $accountTransaction->purpose = 'PurchaseDue';
                //     $accountTransaction->debit =  $latestUpdateBal;
                //     $accountTransaction->balance = $oldBalance->balance -  $latestUpdateBal;
                // } else {
                //     return response()->json([
                //         'status' => 400,
                //         'message' => 'Your account Balance is low Please Select Another account or Add Balance on your Account',
                //     ]);
                // }
            }

            return response()->json([
                'status' => 200,
                'message' => 'Unused payment successfully applied',
            ]);
        } else {
            return response()->json([
                'status' => '500',
                'error' => $validator->messages(),
            ]);
        }
    }

    public function investorDetails($id)
    {
        $investor = Investor::findOrFail($id);
        $branch = Branch::findOrFail($investor->branch_id);
        $transactions = Transaction::where(function ($query) {
            $query->where('particulars', 'OthersPayment')
                ->orWhere('particulars', 'OthersReceive');
        })->where('others_id', $id)->get();
        $banks = Bank::get();

        return view('pos.investor.investorDetails', compact('investor', 'branch', 'transactions', 'banks'));
    }

    // public function investorDelete($id)
    // {
    //     $investor = Investor::findOrFail($id);

    //     $transaction = Transaction::where('particulars', 'OthersReceive')
    //         ->orWhere('particulars', 'OthersPayment')
    //         ->where('others_id', $investor->id)
    //         ->get();

    // if ($transaction) {
    //     $totalDebit = $transaction->debit - $transaction->credit;

    //     if (!$totalDebit === 0) {
    //         $accountTransaction = new AccountTransaction;
    //         $accountTransaction->branch_id =  Auth::user()->branch_id;
    //         $accountTransaction->reference_id = $investor->id;
    //         $accountTransaction->purpose =  'Delete Investor';
    //         $accountTransaction->account_id =  $request->payment_method;
    //         $accountTransaction->debit = $request->amount;
    //         $accountTransaction->credit = $request->amount;
    //         $oldBalance = AccountTransaction::where('account_id', $request->payment_method)->latest('created_at')->first();
    //         $accountTransaction->balance = $oldBalance->balance - $request->amount;
    //         $accountTransaction->created_at = Carbon::now();
    //         $accountTransaction->save();
    //     }
    // }

    //     $investor->delete();

    //     return redirect()->back();
    // }
    public function getPartyData(Request $request)
    {
        $accountId = $request->input('id');
        $account_type = $request->input('account_type');
        if ($account_type === 'party') {
            $info = Customer::findOrFail($accountId);
        }

        return response()->json([
            'info' => $info,
        ]);
    }
}
