<?php

namespace Database\Seeders;

use App\Models\Bank;
use Illuminate\Database\Seeder;

class BankSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banks = [
            [
                'id' => 1,
                'branch_id' => 1,
                'name' => 'Cash',
                'branch_name' => 'Dhaka',
                'manager_name' => 'No Name',
                'phone_number' => '0111113333',
                'account' => '343535',
                'email' => 'demo@gmail.com',
                'opening_balance' => '100000000',
                'current_balance' => '100000000',
                'note' => 'cash',
            ],
        ];
        foreach ($banks as $bank) {
            Bank::create($bank);
        }
    }
}
