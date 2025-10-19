<?php

namespace App\Http\Controllers;

use App\Models\AccountTransaction;
use App\Models\Bank;
use App\Models\Transaction;
use App\Repositories\RepositoryInterfaces\BankInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BankController extends Controller
{
    private $bankrepo;

    public function __construct(BankInterface $bankInterface)
    {
        $this->bankrepo = $bankInterface;
    }

    public function index()
    {
        return view('pos.bank.bank');
    }

    public function store(Request $request)
    {

        try {
            // Validate the incoming request
            $validator = Validator::make($request->all(), [
                'name' => 'required|max:99',
                'opening_balance' => 'required',
                'branch' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => '500',
                    'error' => $validator->messages(),
                ]);
            }

            // If validation passes, proceed with saving the bank details
            $bank = new Bank;
            $bank->branch_id = Auth::user()->branch_id;
            $bank->name = $request->name;
            $bank->branch_name = $request->branch_name;
            $bank->manager_name = $request->manager_name;
            $bank->phone_number = $request->phone_number;
            $bank->branch_id  = $request->branch;
            $bank->account = $request->account;
            $bank->email = $request->email;
            $bank->opening_balance = $request->opening_balance;
            $bank->current_balance = $request->opening_balance;
            $bank->total_credit = $request->opening_balance;
            $bank->save();

            // Save the account transaction
            $accountTransaction = new AccountTransaction;
            $accountTransaction->branch_id = Auth::user()->branch_id;
            $accountTransaction->purpose = 'bank_opening_balance';
            $accountTransaction->account_id = $bank->id;
            $accountTransaction->created_by = Auth::user()->id;
            $accountTransaction->credit = $request->opening_balance;
            $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
            $accountTransaction->save();

            return response()->json([
                'status' => 200,
                'message' => 'Bank Saved Successfully',
            ]);
        } catch (\Exception $e) {
            // Log the error message
            Log::error('Error to saving bank details: ' . $e->getMessage());

            // Return the errors.500 view for internal server errors
            return response()->view('errors.500', [], 500);
        }
    }

    public function view()
    {
        // $banks = Bank::get();
        if (Auth::user()->role == 'superadmin' || Auth::user()->role == 'admin') {
            $banks = Bank::with('branch')->latest()->get();
        } else {
            $banks = Bank::with('branch')->where('branch_id', Auth::user()->branch_id)->latest()->get();
        }
        $totalBalance = 0;
        $banks->load('accountTransaction');
        // Add latest transaction to each bank
        foreach ($banks as $bank) {
            $totalBalance += $bank->current_balance;
        }

        return response()->json([
            'status' => 200,
            'data' => $banks,
            'totalBalance' => number_format($totalBalance, 2),
        ]);
    }

    public function edit($id)
    {
        $bank =  Bank::findOrFail($id);
        if ($bank) {
            return response()->json([
                'status' => 200,
                'bank' => $bank,
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
        // dd($request->all());
        $validator = Validator::make($request->all(), [
            'name' => 'required|max:99',
            // 'branch' => 'required',
        ]);
        if ($validator->passes()) {
            $bank = Bank::findOrFail($id);
            $bank->name = $request->name;
            $bank->branch_name = $request->branch_name;
            // $bank->branch_id = $request->branch;
            $bank->manager_name = $request->manager_name;
            $bank->phone_number = $request->phone_number;
            $bank->account = $request->account;
            $bank->email = $request->email;
            $bank->save();

            return response()->json([
                'status' => 200,
                'message' => 'Bank Update Successfully',
            ]);
        } else {
            return response()->json([
                'status' => '500',
                'error' => $validator->messages(),
            ]);
        }
    }

    public function destroy($id)
    {
        $bank = Bank::findOrFail($id);
        $bank->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Bank Deleted Successfully',
        ]);
    }

    // Bank balance Add
    public function BankBalanceAdd(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'update_balance' => 'required',
        ]);

        if ($validator->passes()) {
            $bank = Bank::findOrFail($id);
            // dd($bank->update_balance);
            $bank->opening_balance = $bank->opening_balance + $request->update_balance;
            $bank->update_balance = $request->update_balance;
            $bank->purpose = $request->purpose;
            $bank->update();

            $accountTransaction = new AccountTransaction;
            $accountTransaction->branch_id = Auth::user()->branch_id;
            $accountTransaction->purpose = 'bank';
            $accountTransaction->account_id = $bank->id;
            $accountTransaction->note = $request->note;
            $accountTransaction->credit = $request->update_balance;
            $oldBalance = AccountTransaction::where('account_id', $id)->latest('created_at')->first();
            if ($oldBalance) {
                $accountTransaction->balance = $oldBalance->balance + $request->update_balance;
            } else {
                $accountTransaction->balance = $request->update_balance;
            }
            $accountTransaction->save();

            return response()->json([
                'status' => 200,
                'message' => 'Add Money Successfully',
            ]);
        } else {
            return response()->json([
                'status' => '500',
                'error' => $validator->messages(),
            ]);
        }
    }
}
