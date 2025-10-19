<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Branch::create([
            'name' => 'Branch 01',
            'address' => 'Dhaka, Bangladesh',
            'email' => 'info@somadhan.com',
            'phone' => '01',
        ]);
    }
}
