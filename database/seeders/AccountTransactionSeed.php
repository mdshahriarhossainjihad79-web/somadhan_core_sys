<?php

namespace Database\Seeders;

use App\Models\AccountTransaction;
use Illuminate\Database\Seeder;

class AccountTransactionSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AccountTransaction::create([
            'branch_id' => 1,
            'purpose' => 'bank',
            'account_id' => 1,
            'credit' => 100000000,
            'transaction_id' => "328748932947",
            'created_by' => 1,
        ]);
    }
}
