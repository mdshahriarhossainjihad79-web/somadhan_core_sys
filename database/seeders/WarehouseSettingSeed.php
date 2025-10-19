<?php

namespace Database\Seeders;

use App\Models\WarehouseSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WarehouseSettingSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'id' => 1,
                'warehouse_manage' => 0,
            ],
        ];

        foreach ($settings as $setting) {
            WarehouseSetting::create($setting);
        }
    }
}
