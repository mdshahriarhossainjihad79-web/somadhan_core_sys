<?php

namespace App\Http\Controllers;

use App\Models\AccountTransaction;
use App\Models\Bank;
use App\Models\Customer;
use App\Models\LinkPaymentHistory;
use App\Models\PartyStatement;
use App\Models\Sale;
use App\Models\ServiceSale;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Composer\XdebugHandler\Status;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PartyStatementsController extends Controller
{
    public function partyStatements(Request $request)
    {
        // dd($request->all());
        try {
            $allValid = true;
            $paymentMethods = $request->input('payment_method', []);
            $amounts = $request->input('amounts', []);
            $grandTotal = 0;
            $notifications = [];
            $linkInvoices = $request->input('linked_invoices', []);
            $party = Customer::findOrFail($request->account_id);

            // 1️⃣ Calculate grand total first///
            foreach ($paymentMethods as $paymentMethod) {
                $amount = isset($amounts[$paymentMethod]) ? (float) $amounts[$paymentMethod] : 0;
                if ($amount <= 0) {
                    $notifications[] = [
                        'message' => "Invalid amount for payment method {$paymentMethod}. Skipping.",
                        'alert-type' => 'warning',
                    ];
                    $allValid = false;
                    break;
                }

                $grandTotal += $amount;
            }
            $latestFinalBalance =  $grandTotal;
            $allocatedTotal = 0; // To track total amount actually used
            if ($request->transaction_type == 'receive') { //if start
                //--------------Link Payment get and Update Invoice -----------------//
                foreach ($linkInvoices as $invoice) {
                    if ($latestFinalBalance <= 0) {
                        break;
                    }
                    $partyStatementId = $invoice['party_statement_id'];
                    $partyStatement = PartyStatement::findOrFail($partyStatementId);
                    $openingDue = $partyStatement->debit;

                    $allocatedAmount = min($openingDue, $latestFinalBalance);

                    if ($partyStatement->reference_type == 'opening_due') {
                        if ($allocatedAmount > 0) {
                            $partyStatement->debit -= $allocatedAmount;
                            $partyStatement->status = 'used';
                            $partyStatement->save();

                            //
                            $linkHistory = new LinkPaymentHistory();
                            $linkHistory->reference_id = $partyStatement->id;
                            $linkHistory->inv_number = 'N/A';
                            $linkHistory->inv_type = 'openingDue';
                            $linkHistory->link_amount = $allocatedAmount;
                            $linkHistory->customer_id = $partyStatement->party_id;
                            $linkHistory->linked_by = Auth::user()->id;
                            $linkHistory->save();
                            $latestFinalBalance -= $allocatedAmount;
                            $allocatedTotal += $allocatedAmount;
                        }
                    } elseif ($partyStatement->reference_type == 'sale') {
                        $saleId = $invoice['sale_id'];
                        if ($saleId) {
                            $sale = Sale::find($saleId);

                            if ($sale) {
                                $allocatedAmount = min($sale->due, $latestFinalBalance);
                                if ($allocatedAmount > 0) {
                                    $sale->paid += $allocatedAmount;
                                    $sale->due -= $allocatedAmount;
                                    $sale->status = ($sale->due == 0) ? 'paid' : 'partial';
                                    $sale->save();
                                    $linkHistory = new LinkPaymentHistory();
                                    $linkHistory->reference_id = $partyStatement->id;
                                    $linkHistory->inv_number = $sale->invoice_number ?? 'N/A';
                                    $linkHistory->inv_type = 'sale';
                                    $linkHistory->link_amount = $allocatedAmount;
                                    $linkHistory->customer_id = $partyStatement->party_id;
                                    $linkHistory->linked_by = Auth::user()->id;
                                    $linkHistory->save();
                                    $latestFinalBalance -= $allocatedAmount;
                                    $allocatedTotal += $allocatedAmount;
                                }
                            }
                        }
                    } elseif ($partyStatement->reference_type == 'service_sale') {
                        $serviceSaleId = $invoice['service_sale_id'];
                        if ($serviceSaleId) {
                            $service_Sale = ServiceSale::find($serviceSaleId);
                            if ($service_Sale) {
                                $allocatedAmount = min($service_Sale->due, $latestFinalBalance);
                                if ($allocatedAmount > 0) {
                                    $service_Sale->paid += $allocatedAmount;
                                    $service_Sale->due -= $allocatedAmount;
                                    $service_Sale->status = ($service_Sale->due == 0) ? 'paid' : 'partial';
                                    $service_Sale->save();
                                    $linkHistory = new LinkPaymentHistory();
                                    $linkHistory->reference_id = $partyStatement->id;
                                    $linkHistory->inv_number = $sale->invoice_number ?? 'N/A';
                                    $linkHistory->inv_type = 'service sale';
                                    $linkHistory->link_amount = $allocatedAmount;
                                    $linkHistory->customer_id = $partyStatement->party_id;
                                    $linkHistory->linked_by = Auth::user()->id;
                                    $linkHistory->save();
                                    $latestFinalBalance -= $allocatedAmount;
                                    $allocatedTotal += $allocatedAmount;
                                }
                            }
                        }
                    }
                }
                //--------------Link Payment Applied  Amount  New Statement Create -----------------//
                if ($linkInvoices) {
                    if ($request->transaction_type == 'receive') {
                        $debit = $allocatedTotal;
                        $credit = 0;
                    } else {
                        $debit = 0;
                        $credit = $allocatedTotal;
                    }

                    $transaction = PartyStatement::create([
                        'branch_id' => Auth::user()->branch_id,
                        'created_by' => Auth::user()->id,
                        'date' => $request->date,
                        'reference_type' => $request->transaction_type,
                        'debit' => $debit,
                        'credit' => $credit,
                        'note' => $request->note,
                        'party_id' => $request->account_id,
                        'status' => 'used',
                    ]);
                }
            } //if end
            if (!$allValid) {
                return redirect()->back()->with($notifications[0]);
            }
            //--------------After Link Payment Applied Unused Amount  New Statement Create -----------------//
            // 2️⃣ Create ONE PartyStatement for the grand total
            $finalStatementAmount =  $grandTotal - $allocatedTotal;
            if ($request->transaction_type == 'receive') {
                $debit = $finalStatementAmount;
                $credit = 0;
                $party->total_debit += $grandTotal;
                calculate_Balance($party);
                $status = 'unused';
            } else { // pay
                $debit = 0;
                $credit = $finalStatementAmount;
                $party->total_credit += $grandTotal;
                calculate_Balance($party);
                $status = Null;
            }
            if ($finalStatementAmount > 0) {
                $transaction = PartyStatement::create([
                    'branch_id' => Auth::user()->branch_id,
                    'created_by' => Auth::user()->id,
                    'date' => $request->date,
                    'reference_type' => $request->transaction_type,
                    'debit' => $debit,
                    'credit' => $credit,
                    'note' => $request->note,
                    'party_id' => $request->account_id,
                    'status' => $status,
                ]);
            }


            //--  Loop again to create AccountTransactions per payment method--//
            foreach ($paymentMethods as $paymentMethod) {
                $amount = (float) $amounts[$paymentMethod];
                $oldBalance = Bank::where('id', $paymentMethod)
                    ->latest()
                    ->first();

                if ($request->transaction_type == 'receive') {
                    $accountTransactionDebit = 0;
                    $accountTransactionCredit = $amount;
                    $particulars = 'party_receive';

                    $oldBalance->total_credit += $amount;
                    $oldBalance->current_balance += $amount;
                } else { // - pay - //
                    $accountTransactionDebit = $amount;
                    $accountTransactionCredit = 0;
                    $particulars = 'party_pay';

                    $oldBalance->total_debit += $amount;
                    $oldBalance->current_balance -= $amount;
                }
                $oldBalance->save();
                $accountTransaction = new AccountTransaction;
                $accountTransaction->branch_id = Auth::user()->branch_id;
                $accountTransaction->reference_id = $transaction->id; // link to single PartyStatement
                $accountTransaction->created_by = Auth::user()->id;
                $accountTransaction->purpose = $particulars;
                $accountTransaction->account_id = $paymentMethod;
                $accountTransaction->debit = $accountTransactionDebit;
                $accountTransaction->credit = $accountTransactionCredit;
                $accountTransaction->transaction_id = generate_unique_invoice(AccountTransaction::class, 'transaction_id', 10);
                $accountTransaction->created_at = Carbon::now();
                $accountTransaction->save();

                $notifications[] = [
                    'message' => "Party Transaction  Payment  Successful.",
                    'alert-type' => 'info',
                ];
            }

            DB::commit();

            return redirect()->back()->with($notifications[0]);
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with([
                'error' => 'Transaction failed: ' . 'Try Again Letter',
                'alert-type' => 'info',
            ]);
        }
    } //End Method
    public function getPartyDueInvoice(Request $request, $customerId)
    {
        $statementId = $request->query('statement_id');

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
        $unusedStatement = PartyStatement::findOrFail($statementId);
        $unusedAmount = $unusedStatement->debit;

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
            'partyStatements' => $partyStatements,
            'unusedAmount' => $unusedAmount,
        ]);
    } //End Method


    public function individualPartyStatementStore(Request $request)
    {
        // dd($request->all());
        $validator = Validator::make($request->all(), [
            'party_unused_amount' => 'required',
            'party_id' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'error' => $validator->messages(),
            ], 422);
        }

        try {
            $saleIds = json_decode($request->input('sale_ids'), true);
            $opening_Due_ids = json_decode($request->input('opening_Due_id'), true);
            $serviceSale_ids = json_decode($request->input('serviceSale_ids'), true);

            $statement_id = $request->statement_id;
            $latestFinalBalance = (float) $request->party_unused_amount;
            $partyStatement = PartyStatement::findOrFail($statement_id);


            // Check if transaction is already used
            if ($partyStatement->status === 'used') {
                return response()->json([
                    'status' => 400,
                    'error' => 'Transaction already used',
                ], 400);
            }
            foreach ($opening_Due_ids as $opening_Due_id) {
                if ($latestFinalBalance <= 0) {
                    break;
                }
                $opening_Due_id = PartyStatement::findOrFail($opening_Due_id);
                // $openingDue = $openingDueTransaction->debit - $openingDueTransaction->credit;
                $openingDue = $opening_Due_id->debit;
                $allocatedAmount = min($openingDue, $latestFinalBalance);

                if ($allocatedAmount > 0) {
                    // Update the balance (reduce the due amount)
                    $opening_Due_id->debit -= $allocatedAmount;

                    $opening_Due_id->save();

                    // Create LinkPaymentHistory record
                    $linkHistory = new LinkPaymentHistory();
                    $linkHistory->reference_id = $opening_Due_id->id;
                    $linkHistory->inv_number = 'N/A';
                    $linkHistory->inv_type = 'openingDue';
                    $linkHistory->link_amount = $allocatedAmount;
                    $linkHistory->customer_id = $request->party_id;
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

                    // Create LinkPaymentHistory record//
                    $linkHistory = new LinkPaymentHistory();
                    $linkHistory->reference_id = $sale->id;
                    $linkHistory->inv_number = $sale->invoice_number ?? 'N/A';
                    $linkHistory->inv_type = 'sale';
                    $linkHistory->link_amount = $allocatedAmount;
                    $linkHistory->customer_id = $request->party_id;;
                    $linkHistory->linked_by = Auth::user()->id;
                    $linkHistory->save();
                    $latestFinalBalance -= $allocatedAmount;
                }
            }
            foreach ($serviceSale_ids as $serviceSale_id) {
                if ($latestFinalBalance <= 0) {
                    break;
                }

                $serviceSale = ServiceSale::findOrFail($serviceSale_id);

                $allocatedAmount = min($serviceSale->due, $latestFinalBalance);
                if ($allocatedAmount > 0) {
                    $serviceSale->paid += $allocatedAmount;
                    $serviceSale->due -= $allocatedAmount;
                    $serviceSale->status = ($sale->due == 0) ? 'paid' : 'partial';
                    $serviceSale->save();

                    // Create LinkPaymentHistory record
                    $linkHistory = new LinkPaymentHistory();
                    $linkHistory->reference_id = $serviceSale->id;
                    $linkHistory->inv_number = $serviceSale->invoice_number ?? 'N/A';
                    $linkHistory->inv_type = 'service sale';
                    $linkHistory->link_amount = $allocatedAmount;
                    $linkHistory->customer_id = $request->party_id;;
                    $linkHistory->linked_by = Auth::user()->id;
                    $linkHistory->save();
                    $latestFinalBalance -= $allocatedAmount;
                }
            }

            // Mark transaction as used only after all allocations are done
            if ($latestFinalBalance > 0) {
                $latestBalanceDiff = $request->party_unused_amount - $latestFinalBalance;
                $partyStatement->debit -=  $latestFinalBalance;
                $partyStatement->status = 'used';
                $partyStatement->save();
                PartyStatement::create([
                    'branch_id' => Auth::user()->branch_id,
                    'created_by' => Auth::user()->id,
                    'date' => Carbon::now(),
                    'reference_type' =>  'receive',
                    'debit' => $latestFinalBalance,
                    'credit' => 0,
                    'note' => $request->note,
                    'party_id' => $request->party_id,
                    'status' => 'unused',
                ]);
            } else {
                $partyStatement->status = 'used';
                $partyStatement->save();
            }

            return response()->json([
                'status' => 200,
                'message' => 'Link Payment successfully Applied',
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
    public function PartyPayReceiveEdit($id)
    {
        $at = AccountTransaction::findOrFail($id);
        $stateid =  $at->reference_id;
        $partyStatements = PartyStatement::findOrFail($stateid);
        // dd($partyStatements);
        return response()->json([
            'status' => 200,
            'account_transaction' => $at,
            'party_statements' => $partyStatements,
        ]);
    }
    public function PartyPayReceiveUpdate(Request $request,$id){
        dd($request->all());
    }
}
