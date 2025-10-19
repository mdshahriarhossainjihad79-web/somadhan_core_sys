<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\WarehouseSetting;
use Illuminate\Http\Request;

class WarehouseSettingController extends Controller
{
    public function index()
    {
        $warehouseSetting = WarehouseSetting::whereId(1)->first();

        return view('pos.pos_settings.warehouse-setting', compact('warehouseSetting'));
    } //

    public function update(Request $request)
    {
        $checkboxFields = ['warehouse_manage'];

        $settingId = $request->input('setting_id');
        foreach ($checkboxFields as $field) {
            $values[$field] = $request->has($field) ? 1 : 0;
        }

        WarehouseSetting::where('id', $settingId)->update($values);

        return redirect()->back()->with(['message' => 'Warehouse Settings updated successfully!', 'alert-type' => 'info']);
    }
}
