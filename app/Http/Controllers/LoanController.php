<?php

namespace App\Http\Controllers;

use App\Models\AccountTransaction;
use App\Models\Bank;
use App\Models\Branch;
use App\Models\LoanManagement\Loan;
use App\Models\LoanManagement\LoanRepayments;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class LoanController extends Controller
{
    public function index()
    {
        try {
            if (Auth::user()->role == 'superadmin' || Auth::user()->role == 'admin') {
                $banks = Bank::get();
            } else {
                $banks = Bank::where('branch_id', Auth::user()->branch_id)
                    ->latest()
                    ->get();
            }

            return view('pos.loan.loan-management', compact('banks'));
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error loading the Loan view: ' . $e->getMessage());

            return response()->view('errors.custom', [], 500);
        }
    }

    // end function
    public function store(Request $request)
    {
        try {
            $messages = [
                'bank_loan_account_id.required' => 'The Loan account is required.',
                'bank_loan_account_id.integer' => 'The Loan account must be an integer.',
                'loan_principal.required' => 'The Loan Amount is required.',
                'loan_principal.numeric' => 'The Loan Amount must be a valid number.',
                'loan_principal.between' => 'The Loan Amount must be between 0 and 999999999999.99.',
            ];

            $validator = Validator::make($request->all(), [
                'loan_name' => 'required|max:99',
                'loan_duration' => 'required|integer|between:0,26',
                'bank_loan_account_id' => 'required|integer',
                'loan_principal' => 'required|numeric|between:0,999999999999.99',
                'interest_rate' => 'required|numeric|between:0,99.99',
                'repayment_schedule' => 'required|in:yearly,monthly,weekly,daily',
                'start_date' => 'required|date',
            ], $messages);

            if ($validator->fails()) {
                return response()->json([
                    'status' => '500',
                    'error' => $validator->messages(),
                ]);
            }

            // If validation passes, proceed with saving the Cash details
            $loan = new Loan;
            $loan->branch_id = Auth::user()->branch_id;
            $loan->bank_loan_account_id = $request->bank_loan_account_id;
            $loan->loan_name = $request->loan_name;
            $loan->loan_duration = $request->loan_duration;
            $loan->loan_principal = $request->loan_principal;
            $loan->interest_rate = $request->interest_rate;
            $interestValue = $request->loan_principal * ($request->interest_rate / 100);
            $TotalInterestValue = $interestValue * $request->loan_duration;
            $loan->loan_balance = $loan->loan_principal + $TotalInterestValue;
            $loan->repayment_schedule = $request->repayment_schedule;
            $loan->start_date = $request->start_date;
            $loan->end_date = Carbon::parse($request->start_date)->copy()->addYears($request->loan_duration);
            $loan->status = 'defaulted';
            $loan->save();

            $bank = Bank::findOrFail($request->bank_loan_account_id);
            $bank->current_balance += $request->loan_principal;
            $bank->total_credit += $request->loan_principal;
            $bank->save();

            $accountTransaction = new AccountTransaction;
            $accountTransaction->branch_id = Auth::user()->branch_id;
            $accountTransaction->created_by = Auth::user()->id;
            $accountTransaction->purpose = 'loan';
            $accountTransaction->reference_id = $loan->id; // loan id
            $accountTransaction->account_id = $request->bank_loan_account_id;
            $accountTransaction->credit = $request->loan_principal;
            $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
            $accountTransaction->created_at = Carbon::now();
            $accountTransaction->save();



            return response()->json([
                'status' => 200,
                'message' => 'loan Saved Successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'An error occurred while fetching Loan loan.',
                'error' => $e->getMessage(),  // Optional: include exception message
            ]);
        }
    }

    public function view()
    {
        try {
            if (Auth::user()->role == 'superadmin' || Auth::user()->role == 'admin') {
                $data = Loan::latest()->get();
            } else {
                $data = Loan::where('branch_id', Auth::user()->branch_id)
                    ->latest()
                    ->get();  // Fetch only for the user's branch
            }

            return response()->json([
                'status' => 200,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'An error occurred while fetching Loans.',
                'error' => $e->getMessage(),  // Optional: include exception message
            ]);
        }
    }

    public function viewLoan($id)
    {
        try {

            $loan = Loan::findOrFail($id);  // Fetch only for the user's branch
            $branch = Branch::findOrFail($loan->branch_id);
            $banks = Bank::latest()->get();
            $loan_repayments = LoanRepayments::where('loan_id', $loan->id)->get();

            return view('pos.loan.loan-profile', compact('loan', 'branch', 'banks', 'loan_repayments'));
        } catch (\Exception $e) {
            // / Log the error
            Log::error('Error loading the Loan view: ' . $e->getMessage());

            // Optionally return a custom error view or a simple error message
            return response()->view('errors.custom', [], 500);
        }
    }

    // loan Repayments store/
    public function repaymentsstore(Request $request)
    {
        try {
            // dd($request->all());
            $messages = [
                'data_id.required' => 'Something Went Wrong Data not found.',
                'data_id.integer' => 'Something Went Wrong. Someone pass The wrong Value',
                'payment_account_id.required' => 'The Payment Account is required.',
                'payment_account_id.integer' => 'Someone pass The wrong Value',
                'payment_balance.required' => 'Someone pass The wrong Value. required',
                'payment_balance.numeric' => 'Someone pass The wrong Value. numeric',
                'payment_balance.between' => 'Someone pass The wrong Value. between',
            ];
            $validator = Validator::make($request->all(), [
                'data_id' => 'required|integer',
                'payment_account_id' => 'required|integer',
                'repayment_date' => 'required',
                'payment_balance' => 'required|numeric|between:0,999999999999.99',
            ], $messages);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 500,
                    'error' => $validator->messages(),
                ]);
            }

            $account_balance = Bank::findOrFail($request->payment_account_id);

                $loan_repayments = new LoanRepayments;
                $loan_repayments->branch_id = Auth::user()->branch_id;
                $loan_repayments->loan_id = $request->data_id;
                $loan_repayments->repayment_date = date('Y-m-d', strtotime($request->repayment_date));
                $loan = Loan::findOrFail($request->data_id);
                $loan_principal = $loan->loan_principal;
                $loan_interest = $loan->loan_balance - $loan->loan_principal;
                if ($loan->repayment_schedule == 'daily') {
                    $total_duration = $loan->loan_duration * 365;
                } elseif ($loan->repayment_schedule == 'weekly') {
                    $total_duration = $loan->loan_duration * 52;
                } elseif ($loan->repayment_schedule == 'monthly') {
                    $total_duration = $loan->loan_duration * 12;
                } else {
                    $total_duration = $loan->loan_duration * 1;
                }
                $loan_repayments->principal_paid = $loan_principal / $total_duration;
                $loan_repayments->interest_paid = $loan_interest / $total_duration;
                $loan_repayments->total_paid = $request->payment_balance;
                $loan_repayments->bank_account_id = $request->payment_account_id;
                $loan_repayments->save();

                $bank = Bank::findOrFail($request->payment_account_id);
                $bank->current_balance -= $request->payment_balance;
                $bank->total_debit += $request->payment_balance;
                $bank->save();


            $accountTransaction = new AccountTransaction;
            $accountTransaction->branch_id = Auth::user()->branch_id;
            $accountTransaction->created_by = Auth::user()->id;
            $accountTransaction->purpose = 'loan_repayments';
            $accountTransaction->reference_id = $loan_repayments->id; // loan id
            $accountTransaction->account_id = $request->payment_account_id;
            $accountTransaction->debit = $request->payment_balance;
            $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
            $accountTransaction->created_at = Carbon::now();
            $accountTransaction->save();



            return response()->json([
                'status' => 200,
                'message' => 'Successfully processed payment.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'An error occurred while loan repayments.',
                'error' => $e->getMessage(),  // Optional: include exception message
            ]);
        }
    }

    public function loanInstalmentInvoice($id)
    {
        $loanRepayments = LoanRepayments::findOrFail($id);

        return view('pos.loan.loan-instalment-invoice', compact('loanRepayments'));
    }
}// Main
