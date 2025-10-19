<?php

namespace App\Http\Controllers\AdditionalCharge;

use App\Http\Controllers\Controller;
use App\Models\AdditionalChargeName;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdditionalChargeController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:additional_charge_names,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $additionalChargeName = AdditionalChargeName::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'success' => true,
            'data' => $additionalChargeName,
        ], 201);
    }
}
