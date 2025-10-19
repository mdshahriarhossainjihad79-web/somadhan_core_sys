<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\PartyStatement;
use App\Models\Supplier;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Customer::where('party_type', 'supplier')->get();

        return view('pos.supplier.supplier', compact('suppliers'));
    }

    // this is store function
    public function store(Request $request)
    {
        try {
            // Validate the request data
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'phone' => 'required|unique:users,phone',
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
            $supplier->party_type = 'supplier';
            $supplier->opening_payable = $request->opening_payable ?? 0;
            $supplier->total_payable = $request->opening_payable ?? 0;
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

            // Return a success response
            return response()->json([
                'status' => 200,
                'message' => 'Supplier saved successfully',
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

    public function view()
    {
        $suppliers = Customer::where('party_type', 'supplier')->latest()->get();
        $firstSupplier = Customer::orderBy('created_at', 'asc')->first();
        return response()->json([
            'status' => 200,
            'firstSupplier' => $firstSupplier,
            'data' => $suppliers,
        ]);
    }

    public function edit($id)
    {
        $supplier = Customer::findOrFail($id);
        if ($supplier) {
            return response()->json([
                'status' => 200,
                'supplier' => $supplier,
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
            'name' => 'required|max:250',
            'phone' => 'required|max:100',
        ]);
        if ($validator->passes()) {
            $supplier = Customer::findOrFail($id);
            $supplier->name = $request->name;
            $supplier->branch_id = Auth::user()->branch_id;
            $supplier->email = $request->email;
            $supplier->phone = $request->phone;
            $supplier->address = $request->address;
            $supplier->party_type = $request->party_type;
            $supplier->save();

            return response()->json([
                'status' => 200,
                'message' => 'Supplier Update Successfully',
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
        $supplier = Customer::findOrFail($id);
        $firstSupplier = Customer::orderBy('created_at', 'asc')->first();
        if ($firstSupplier && $firstSupplier->id === $supplier->id) {
            return response()->json([
                'status' => 403,
                'message' => 'Cannot delete the Default Customer',
            ], 403);
        }

        $supplier->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Supplier Deleted Successfully',
        ]);
    }

    public function SupplierProfile($id)
    {
        $data = Customer::findOrFail($id);
        $transactions = Transaction::where('supplier_id', $data->id)->get();
        $branch = Branch::findOrFail($data->branch_id);
        $banks = Bank::latest()->get();
        $isCustomer = false;
        return view('pos.profiling.profiling', compact('data', 'transactions', 'branch', 'isCustomer', 'banks'));
    }
}
