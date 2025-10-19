<?php

namespace App\Http\Controllers;

use App\Models\AccountTransaction;
use App\Models\Bank;
use App\Models\BankToBankTransfer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BankTransferController extends Controller
{
    /**
     * Generate a unique 8–10 digit number
     */
    private function generateUniqueInvoice(): string
    {
        $min = 100000;       // 7-digit lowest (10^6)
        $max = 99999999;     // 9-digit highest (10^9 − 1)
        do {
            $invoice = (string) random_int($min, $max);
        } while (BankToBankTransfer::where('invoice', $invoice)->exists());

        return $invoice;
    }

    public function index()
    {
        $banks = Bank::all();

        return view('pos.bank.bank_to_bank_transfer.bank_transfer', compact('banks'));
    }

    public function storebankTransfer(Request $request)
    {
        // dd( $request->all());
        // try {
            // Validate the incoming request
            $validator = Validator::make($request->all(), [
                'from' => 'required',
                'to' => 'required',
                'amount' => 'required',
                'date' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 422,
                    'error' => $validator->messages(),
                ], 422);
            }

            // ///from/////

            $oldBalanceFrom = Bank::where('id', $request->from)->latest()->first();
            $bankTransfer = new BankToBankTransfer;
            $bankTransfer->branch_id = Auth::user()->branch_id;

            $bankTransfer->invoice = $this->generateUniqueInvoice();
            $bankTransfer->created_by = Auth::user()->id;
            $bankTransfer->from = $request->from;
            $bankTransfer->to = $request->to;
            $bankTransfer->amount = $request->amount;
            $bankTransfer->transfer_date = $request->date;
            $bankTransfer->description = $request->description;
            if ($request->image) {
                $imageName = rand() . '.' . $request->image->extension();
                $request->image->move(public_path('uploads/bank_transfer/'), $imageName);
                $bankTransfer->image = $imageName;
            }
            $bankTransfer->save();

            $oldBalanceFrom->total_debit += $request->amount;
            $oldBalanceFrom->current_balance -= $request->amount;
            $oldBalanceFrom->save();
            $accountTransaction = new AccountTransaction;
            $accountTransaction->branch_id = Auth::user()->branch_id;
            $accountTransaction->purpose = 'from_bank_transfer';
            $accountTransaction->account_id = $request->from;
            $accountTransaction->debit = $request->amount;
            $accountTransaction->reference_id = $bankTransfer->id;
            $accountTransaction->created_by = Auth::user()->id;
            $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
            $accountTransaction->created_at = Carbon::now();
            $accountTransaction->save();

            /////////// To ////////////
            $oldBalanceTo = Bank::where('id', $request->to)->latest()->first();
            $oldBalanceTo->total_credit += $request->amount;
            $oldBalanceTo->current_balance += $request->amount;
            $oldBalanceTo->save();

            $accountTransaction = new AccountTransaction;
            $accountTransaction->branch_id = Auth::user()->branch_id;
            $accountTransaction->purpose = 'to_bank_transfer';
            $accountTransaction->account_id = $request->to;
            $accountTransaction->credit = $request->amount;
            $accountTransaction->reference_id = $bankTransfer->id;
            $accountTransaction->created_by = Auth::user()->id;
            $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
            $accountTransaction->created_at = Carbon::now();
            $accountTransaction->save();

            return response()->json([
                'status' => 200,
                'message' => 'Bank to Bank Transfer Successfully Completed.',
            ]);
        // } catch (\Exception $e) {
        //     // Log the error message
        //     Log::error('Error saving bank transfer: ' . $e->getMessage());

        //     return response()->json([
        //         'status' => 500,
        //         'error' => 'An internal server error occurred. Please try again later.',
        //     ], 500);
        // }
    }

    public function view()
    {
        if (Auth::user()->role == 'superadmin' || Auth::user()->role == 'admin') {
            $banks = BankToBankTransfer::with(['fromBank', 'toBank'])->get();
        } else {
            $banks = BankToBankTransfer::where('branch_id', Auth::user()->branch_id)
                ->with(['fromBank', 'toBank']) // Use the correct relationship names
                ->latest()
                ->get();
        }

        return response()->json([
            'status' => 200,
            'data' => $banks,
        ]);
    }

    public function edit($id)
    {
        $bankTobank = BankToBankTransfer::findOrFail($id);
        if ($bankTobank) {
            return response()->json([
                'status' => 200,
                'bankTobank' => $bankTobank,
            ]);
        } else {
            return response()->json([
                'status' => 500,
                'message' => 'Data Not Found',
            ]);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Validate the incoming request
            $validator = Validator::make($request->all(), [
                'from' => 'required',
                'to' => 'required',
                'amount' => 'required',
                'date' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 422,
                    'error' => $validator->messages(),
                ], 422);
            }

            // ///from/////
            // dd($request->all());
            $oldBalanceFrom = Bank::where('id', $request->from)->latest()->first();

            $bankTransfer = BankToBankTransfer::findOrFail($id);

            $requestAmount = (float) $request->amount;
            $bankTransferAmount = (float) $bankTransfer->amount;
            $accountTransaction = new AccountTransaction;
            $accountTransaction->branch_id = Auth::user()->branch_id;
            $accountTransaction->purpose = 'from_bank_transfer_update';
            $accountTransaction->account_id = $request->from;
            $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
            if ($requestAmount > $bankTransferAmount) {
                $latestAmount = $requestAmount - $bankTransferAmount;
                $accountTransaction->debit = $latestAmount;
                $oldBalanceFrom->total_debit += $latestAmount;
                $oldBalanceFrom->current_balance -= $latestAmount;
                $oldBalanceFrom->save();
            } elseif ($requestAmount < $bankTransferAmount) {
                $latestAmount = $bankTransferAmount - $requestAmount;
                $accountTransaction->credit = $latestAmount;
                $oldBalanceFrom->total_credit += $latestAmount;
                $oldBalanceFrom->current_balance += $latestAmount;
                $oldBalanceFrom->save();
            } else {
                $latestAmount = 0; // No difference if the amounts are equal

                $accountTransaction->debit = $latestAmount;
            }
            $accountTransaction->reference_id = $bankTransfer->id;
            $accountTransaction->created_by = Auth::user()->id;
            $accountTransaction->created_at = Carbon::now();
            $accountTransaction->save();

            // ////////////To//////////
            $oldBalanceTo = Bank::where('id', $request->to)->latest()->first();
            $accountTransaction = new AccountTransaction;
            $accountTransaction->branch_id = Auth::user()->branch_id;
            $accountTransaction->purpose = 'to_bank_transfer_update';
            $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
            $accountTransaction->account_id = $request->to;
            //- - -//
            if ($requestAmount > $bankTransferAmount) {
                $latestAmount = $requestAmount - $bankTransferAmount;
                $accountTransaction->credit = $latestAmount;
                $oldBalanceFrom->total_credit += $latestAmount;
                $oldBalanceFrom->current_balance += $latestAmount;
                $oldBalanceFrom->save();
            } elseif ($requestAmount < $bankTransferAmount) {
                $latestAmount = $bankTransferAmount - $requestAmount;
                $accountTransaction->debit = $latestAmount;
                $oldBalanceFrom->total_debit += $latestAmount;
                $oldBalanceFrom->current_balance -= $latestAmount;
            } else {
                $latestAmount = 0;
                $accountTransaction->credit = $latestAmount;
            }
            $accountTransaction->reference_id = $bankTransfer->id;
            $accountTransaction->created_by = Auth::user()->id;
            $accountTransaction->created_at = Carbon::now();
            $accountTransaction->save();
            //
            $bankTransfer->branch_id = Auth::user()->branch_id;
            $bankTransfer->from = $request->from;
            $bankTransfer->to = $request->to;
            $bankTransfer->amount = $request->amount;
            $bankTransfer->transfer_date = $request->date;
            $bankTransfer->description = $request->description;
            if ($request->image) {
                $imageName = rand() . '.' . $request->image->extension();
                $request->image->move(public_path('uploads/bank_transfer/'), $imageName);
                $bankTransfer->image = $imageName;
            }
            $bankTransfer->save();

            return response()->json([
                'status' => 200,
                'message' => 'Bank to Bank Transfer Successfully Completed.',
            ]);
        } catch (\Exception $e) {
            // Log the error message
            Log::error('Error saving bank transfer: ' . $e->getMessage());

            return response()->json([
                'status' => 500,
                'error' => 'An internal server error occurred. Please try again later.',
            ], 500);
        }
    }

    public function bankToBankViewTransaction($id)
    {
        $b2bTransfer = BankToBankTransfer::where('id', $id)->first();
        $accoutTransactions = AccountTransaction::where('reference_id', $id)
            ->whereIn('purpose', [
                'from_bank_transfer',
                'to_bank_transfer',
                'to_bank_transfer_update',
                'from_bank_transfer_update',
            ])
            ->get();

        return view('pos.bank.bank_to_bank_transfer.bank_to_bank_view_transaction', compact('b2bTransfer', 'accoutTransactions'));
    }
}
