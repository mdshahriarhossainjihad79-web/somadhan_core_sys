<?php

namespace App\Http\Controllers;

use App\Models\AccountTransaction;
use App\Models\Bank;
use App\Models\Customer;
use App\Models\PartyStatement;
use App\Models\PosSetting;
use App\Models\ServiceSale;
use App\Models\ServiceSaleItem;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ServiceSaleController extends Controller
{
    public function index()
    {
        return view('pos.service_sale.service_sale');
    }

    public function store(Request $request)
    {
        // dd($request->all());
        $serviceNames = $request->input('serviceName', []);
        $volumes = $request->input('volume', []);
        $prices = $request->input('price', []);
        $totals = $request->input('total', []);
        $formattedDate = Carbon::parse($request->date)->format('Y-m-d') ?? Carbon::parse(Carbon::now())->format('Y-m-d');
        do {
            $invoiceNumber = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (ServiceSale::where('invoice_number', $invoiceNumber)->exists());

        // Loop through the arrays and insert each service
        $due = $request->subTotal - $request->total_payable;
 //--------------------------------------Service Create-------------------------------//
        $serviceSale = ServiceSale::create([
            'branch_id' => Auth::user()->branch_id,
            'customer_id' => $request->customer_id,
            'date' => $formattedDate,
            'invoice_number' => $invoiceNumber,
            'grand_total' => $request->subTotal,
            'paid' => $request->total_payable,
            'due' => $due,
        ]);
        $serviceId = $serviceSale->id;
        foreach ($serviceNames as $key => $serviceName) {
            ServiceSaleItem::create([
                'service_sale_id' => $serviceId,
                'name' => $serviceName,
                'volume' => $volumes[$key],
                'price' => $prices[$key],
                'total' => $totals[$key],
            ]);
        }
        $settings = PosSetting::first();
        // check invoice payment on or off
        $invoice_payment = $settings?->invoice_payment ?? 0;
         //--------------------------------------Party Update-------------------------------//
        $customer = Customer::findOrFail($request->customer_id);
        $customer->total_receivable += $request->subTotal;
        $customer->total_debit += $request->total_payable;
        calculate_Balance($customer);
         //--------------------------------------Account Transaction Create-------------------------------//
        $accountTransaction = new AccountTransaction;
        $accountTransaction->branch_id = Auth::user()->branch_id;
        $accountTransaction->purpose = 'service_sale';
        $accountTransaction->account_id = $request->payment_method;
        $accountTransaction->reference_id =  $serviceId;
        $accountTransaction->credit = $request->total_payable;
        $accountTransaction->created_by =  Auth::user()->id;
        $accountTransaction->created_at = Carbon::now();
        $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
        $accountTransaction->save();
         //--------------------------------------Bank Update-------------------------------//
        $oldBalance = Bank::where('id', $request->payment_method)->latest()->first();
        $oldBalance->total_credit +=$request->total_payable;
        $oldBalance->current_balance += $request->total_payable;
        $oldBalance->save();

        //--------------------------------------Party Statement-------------------------------//
        $party_statement =  new PartyStatement;
        $party_statement->branch_id = Auth::user()->branch_id;
        $party_statement->date = $formattedDate;
        $party_statement->created_by = Auth::user()->id;
        $party_statement->reference_type = 'service_sale';
        $party_statement->reference_id = $serviceId;
        $party_statement->party_id =  $request->customer_id;
        $party_statement->debit = $request->total_payable;
        $party_statement->save();
        return response()->json([
            'status' => 200,
            'message' => 'Services added successfully!',
        ]);
    }

    // End Method
    public function view()
    {
        $serviceSales = ServiceSale::all();

        return view('pos.service_sale.service_sale_view', compact('serviceSales'));
    }

    // End Method
    public function invoice($id)
    {
        $sale = ServiceSale::findOrFail($id);
        $customer = Customer::findOrFail($sale->customer_id);

        return view('pos.service_sale.service-sale-invoice', compact('sale', 'customer'));
    }

    public function viewParty()
    {
        $customers = Customer::where('party_type', '!=', 'supplier')->get(); // Adjust fields as needed

        return response()->json([
            'status' => 200,
            'customers' => $customers,
        ]);
    }

    public function viewServiceLedger($id)
    {
        $servicesSales = ServiceSale::findOrFail($id);
        $servicesSaleItems = ServiceSaleItem::where('service_sale_id', $id)->get();
        $transactions = PartyStatement::whereIn('reference_type', ['service_sale', 'service_sale_payments'])
        ->where('reference_id', $id)
        ->latest()
        ->get();
        if (Auth::user()->role === 'superadmin' || Auth::user()->role === 'admin') {
            $banks = Bank::all();
        } else {
            $banks = Bank::where('branch_id', Auth::user()->branch_id)->get();
        }

        return view('pos.service_sale.service-sale-ledger', compact('servicesSales', 'servicesSaleItems', 'transactions', 'banks'));
    }

    public function ServiceSalePayment(Request $request)
    {
        // dd($request->all());
        $servicesale = ServiceSale::findOrFail($request->data_id);
        $servicesale->paid = $servicesale->paid + $request->payment_balance;
        $servicesale->due = $servicesale->due - $request->payment_balance;
        $servicesale->save();
        // dd($request->all());
        $customer = Customer::findOrFail($request->customer_id);
        $customer->total_payable += $request->payment_balance;
        $customer->wallet_balance -= $request->payment_balance;
        $customer->save();
        //
        $accountTransaction = new AccountTransaction;
        $accountTransaction->branch_id = Auth::user()->branch_id;
        $accountTransaction->created_by =  Auth::user()->id;
        $accountTransaction->purpose = 'service_sale_payments';
        $accountTransaction->reference_id = $servicesale->id;
        $accountTransaction->account_id = $request->account;
        $accountTransaction->credit = $request->payment_balance;
        $accountTransaction->created_at = Carbon::now();
        $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
        $accountTransaction->save();

        $oldBalance = Bank::where('id', $request->account)->latest()->first();
        $oldBalance->total_credit +=$request->payment_balance;
        $oldBalance->current_balance += $request->payment_balance;
        $oldBalance->save();

        $party_statement =  new PartyStatement;
        $party_statement->branch_id = Auth::user()->branch_id;
        $party_statement->date  = Carbon::now();
        $party_statement->created_by = Auth::user()->id;
        $party_statement->reference_type = 'service_sale_payments';
        $party_statement->reference_id = $servicesale->id;
        $party_statement->party_id =  $request->customer_id;
        $party_statement->debit = $request->payment_balance;
        $party_statement->save();

        return response()->json([
            'status' => 200,
            'message' => 'Services Payments  successfully!',
        ]);
    }
}// main end
