<?php

namespace App\Helpers;

class PartyBalanceCalculation
{
    public static function calculateWalletBalance($customer)
    {
        $dueAmount = $customer->total_receivable - $customer->total_debit;
        $advanced_pay = $customer->total_payable - $customer->total_credit;
        $customer->wallet_balance = $dueAmount - $advanced_pay;
        $customer->save();
    }
}
